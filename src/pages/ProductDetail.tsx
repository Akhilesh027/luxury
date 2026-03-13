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

  // can be string (single or comma-separated) or array
  color?: string | string[];
  size?: string | string[];

  category?: string;
  type?: string;

  inStock?: boolean;

  dimensions?: {
    width?: number;
    depth?: number;
    height?: number;
  };
};

// Helper to normalise to array
function toArray(value?: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    // split by comma or pipe (for legacy CSV)
    return value.split(/[,|]/g).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function isHexColor(v: string) {
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(v.trim());
}

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
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
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

  const colorOptions = useMemo(() => toArray(product?.color), [product?.color]);
  const sizeOptions = useMemo(() => toArray(product?.size), [product?.size]);

  // Auto-select first if only one option
  useEffect(() => {
    if (colorOptions.length === 1) setSelectedColor(colorOptions[0]);
    if (sizeOptions.length === 1) setSelectedSize(sizeOptions[0]);
  }, [colorOptions, sizeOptions]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(p || 0));

  // fetch product + related
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/products/${id}`, { method: "GET" });
        const p: Product = data?.product || data;
        setProduct(p);

        // related products by category
        if (p?.category) {
          const rel = await apiFetch(`/products?category=${encodeURIComponent(p.category)}&limit=8`);
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

  const requireColor = colorOptions.length > 1;
  const requireSize = sizeOptions.length > 1;

  const validateSelections = () => {
    if (requireColor && !selectedColor) {
      toast({ title: "Select a color", description: "Please choose a color to continue." });
      return false;
    }
    if (requireSize && !selectedSize) {
      toast({ title: "Select a size", description: "Please choose a size to continue." });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!product?._id) return;

    if (!validateSelections()) return;

    addItem(
      {
        id: product._id,
        name: productName,
        price,
        image: images[0],
        color: selectedColor || (colorOptions.length === 1 ? colorOptions[0] : ""),
        size: selectedSize,
      },
      quantity
    );

    toast({
      title: "Added to cart",
      description: `${quantity}x ${productName}${
        selectedColor ? ` • Color: ${selectedColor}` : ""
      }${selectedSize ? ` • Size: ${selectedSize}` : ""} added.`,
    });
  };

  const handleWishlistToggle = () => {
    if (!product?._id) return;

    toggleFavorite({
      productId: product._id,
      id: product._id,
      name: productName,
      price,
      image: images[0],
      type: product?.type || "",
      color: selectedColor,
      size: selectedSize,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        <Header />
        <main className="container mx-auto px-4 py-20 relative z-10">
          <div className="rounded-2xl border border-white/20 bg-black/40 backdrop-blur-sm p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-white/70" />
            <p className="text-sm text-white/80">Loading product...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        <Header />
        <main className="container mx-auto px-4 py-20 text-center relative z-10">
          <h1 className="text-3xl font-heading text-white drop-shadow-lg">Product not found</h1>
          <Link to="/catalog" className="text-[#d4af37] hover:text-white mt-4 inline-block">
            Back to catalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
      {/* Soft overlay for text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/70 mb-8">
          <Link to="/" className="hover:text-[#d4af37]">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-[#d4af37]">Catalog</Link>
          <span>/</span>
          <span className="text-white">{productName}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/20">
              <img
                src={images[selectedImage]}
                alt={productName}
                className="w-full h-full object-cover"
              />

              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-[#d4af37] text-[#7a5a1e] text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}

              <button
                onClick={handleWishlistToggle}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isFavorite(product._id)
                    ? "bg-[#d4af37] text-[#7a5a1e]"
                    : "bg-black/60 backdrop-blur-sm text-white hover:bg-[#d4af37] hover:text-[#7a5a1e]"
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
                    selectedImage === idx ? "border-[#d4af37]" : "border-transparent"
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
              <p className="text-white/70 text-sm uppercase tracking-wider mb-2">
                {product.type || "Luxury"}
              </p>
              <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-lg">
                {productName}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold">{formatPrice(price)}</span>
              {oldPrice > price && (
                <span className="text-xl text-white/50 line-through">{formatPrice(oldPrice)}</span>
              )}
            </div>

            <p className="text-white/80 leading-relaxed">{product.description || "—"}</p>

            {/* Color Selection */}
            {colorOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white mb-3">Color</p>
                  {selectedColor ? (
                    <p className="text-xs text-white/60">{selectedColor}</p>
                  ) : requireColor ? (
                    <p className="text-xs text-red-300">Required</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((color, idx) => {
                    const selected = selectedColor === color;
                    const isHex = isHexColor(color);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selected ? "border-[#d4af37] scale-110" : "border-transparent hover:border-white/30"
                        }`}
                        style={{ backgroundColor: isHex ? color : undefined }}
                      >
                        {!isHex && <span className="text-white text-xs">{color}</span>}
                        {selected && (
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizeOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white mb-3">Size</p>
                  {selectedSize ? (
                    <p className="text-xs text-white/60">{selectedSize}</p>
                  ) : requireSize ? (
                    <p className="text-xs text-red-300">Required</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const selected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selected
                            ? "border-[#d4af37] bg-[#d4af37]/10 text-white"
                            : "border-white/20 text-white/80 hover:border-white/40"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dimensions */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <p className="font-medium text-white mb-3">Dimensions</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/70">Width</span>
                  <p className="font-medium text-white">{product.dimensions?.width ?? "—"} cm</p>
                </div>
                <div>
                  <span className="text-white/70">Depth</span>
                  <p className="font-medium text-white">{product.dimensions?.depth ?? "—"} cm</p>
                </div>
                <div>
                  <span className="text-white/70">Height</span>
                  <p className="font-medium text-white">{product.dimensions?.height ?? "—"} cm</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-white/70 hover:text-white"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-medium text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-white/70 hover:text-white"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button
                className="flex-1 bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
                size="xl"
                onClick={handleAddToCart}
                disabled={product.inStock === false}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.inStock === false ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-[#d4af37] mb-2" />
                <p className="text-xs text-white/70">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-[#d4af37] mb-2" />
                <p className="text-xs text-white/70">2 Year Warranty</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-[#d4af37] mb-2" />
                <p className="text-xs text-white/70">Easy Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Description Section */}
        <section className="mt-20 border-t border-white/10 pt-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-heading font-bold text-white mb-4">Product Description</h2>
            <p className="text-white/80 leading-relaxed text-base">
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
                  <Check className="w-5 h-5 text-[#d4af37] mt-1" />
                  <p className="text-sm text-white/80">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-heading font-bold text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => {
                const name = item.title || item.name || "Product";
                const img = item.image || item.images?.[0] || "https://via.placeholder.com/600";
                const p = Number(item.newPrice ?? item.price ?? 0);

                return (
                  <Link key={item._id} to={`/product/${item._id}`} className="group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-black/20 mb-3">
                      <img
                        src={img}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-sm text-white/70">{item.type || "Luxury"}</p>
                    <h4 className="font-medium text-white group-hover:text-[#d4af37] transition-colors">
                      {name}
                    </h4>
                    <p className="text-[#d4af37] font-bold">{formatPrice(p)}</p>
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