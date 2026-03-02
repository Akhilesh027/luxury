import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "@/hooks/use-toast";

const API_BASE = "https://api.jsgallor.com/api/luxury";

type Product = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;

  image?: string;
  images?: string[];

  price?: number;
  newPrice?: number;
  oldPrice?: number;
  discount?: number;

  colors?: string[];
  category?: string;
  type?: string;

  inStock?: boolean;

  dimensions?: {
    width?: number;
    depth?: number;
    height?: number;
  };
};

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`);
  return json;
}

const ProductDetail = () => {
  const { id } = useParams(); // ✅ mongo _id from URL
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const productName = product?.title || product?.name || "Product";
  const price = Number(product?.newPrice ?? product?.price ?? 0);
  const oldPrice = Number(product?.oldPrice ?? 0);
  const discount = Number(product?.discount ?? 0);

  const images = useMemo(() => {
    const list = product?.images?.length ? product.images : product?.image ? [product.image] : [];
    return list.length ? list : ["https://via.placeholder.com/900x900?text=No+Image"];
  }, [product]);

  const colors = product?.colors?.length ? product.colors : ["#000000"];

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(p || 0));

  // ✅ fetch product + related
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/products/${id}`, { method: "GET" });
        const p: Product = data?.product || data; // supports {product} or direct
        setProduct(p);

        // ✅ related products by category
        if (p?.category) {
          const rel = await apiFetch(`/products?category=${encodeURIComponent(p.category)}&limit=8`, {
            method: "GET",
          });

          const list: Product[] = Array.isArray(rel?.products) ? rel.products : [];
          const filtered = list.filter((x) => String(x._id) !== String(p._id)).slice(0, 4);
          setRelated(filtered);
        } else {
          setRelated([]);
        }
      } catch (err) {
        toast({
          title: "Failed to load product",
          description: err instanceof Error ? err.message : "Try again",
          variant: "destructive",
        });
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!product?._id) return;

    addItem(
      {
        id: product._id, // ✅ IMPORTANT: send _id
        name: productName,
        price,
        image: images[0],
        color: colors[selectedColor] || "",
      },
      quantity
    );
  };

  const handleWishlistToggle = () => {
    if (!product?._id) return;

    toggleFavorite({
      productId: product._id, // ✅ for backend wishlist
      id: product._id,        // ✅ keep local UI checks
      name: productName,
      price,
      image: images[0],
      type: product?.type || "",
    } as any);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading product...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-heading">Product not found</h1>
          <Link to="/catalog" className="text-gold hover:underline mt-4 inline-block">
            Back to catalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-gold">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-gold">Catalog</Link>
          <span>/</span>
          <span className="text-foreground">{productName}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/20">
              <img
                src={images[selectedImage]}
                alt={productName}
                className="w-full h-full object-cover"
              />

              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-gold text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}

              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isFavorite(product._id)
                    ? "bg-gold text-primary-foreground"
                    : "bg-card/80 backdrop-blur-sm hover:bg-gold hover:text-primary-foreground"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product._id) ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? "border-gold" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">
                {product.type || "Luxury"}
              </p>
              <h1 className="text-4xl lg:text-5xl font-heading font-bold">{productName}</h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gold">{formatPrice(price)}</span>
              {oldPrice > price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(oldPrice)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description || "—"}</p>

            {/* Color Selection */}
            <div>
              <p className="font-medium mb-3">Color</p>
              <div className="flex gap-3">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === idx ? "border-gold scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === idx && (
                      <Check className="w-5 h-5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="font-medium mb-3">Dimensions</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Width</span>
                  <p className="font-medium">{product.dimensions?.width ?? "—"} cm</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Depth</span>
                  <p className="font-medium">{product.dimensions?.depth ?? "—"} cm</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Height</span>
                  <p className="font-medium">{product.dimensions?.height ?? "—"} cm</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button
                variant="gold"
                size="xl"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.inStock === false}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.inStock === false ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-gold mb-2" />
                <p className="text-xs text-muted-foreground">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-gold mb-2" />
                <p className="text-xs text-muted-foreground">2 Year Warranty</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-gold mb-2" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Description Section */}
        <section className="mt-20 border-t border-border/50 pt-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-heading font-bold mb-4">Product Description</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              {product.description || "No description available."}
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                "Crafted with premium-quality materials for long-lasting durability.",
                "Designed to complement modern interiors with a timeless aesthetic.",
                "Easy to maintain and built for everyday comfort.",
                "Precision dimensions ensure a perfect fit in your space.",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gold mt-1" />
                  <p className="text-sm text-muted-foreground">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-heading font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => {
                const name = item.title || item.name || "Product";
                const img = item.image || item.images?.[0] || "https://via.placeholder.com/600";
                const p = Number(item.newPrice ?? item.price ?? 0);

                return (
                  <Link key={item._id} to={`/product/${item._id}`} className="group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-secondary/20 mb-3">
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{item.type || "Luxury"}</p>
                    <h4 className="font-medium">{name}</h4>
                    <p className="text-gold font-bold">{formatPrice(p)}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
