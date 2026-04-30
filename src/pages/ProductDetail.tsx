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
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "@/hooks/use-toast";

const API_BASE = "https://api.jsgallor.com/api/luxury";

type Variant = {
  _id: string;
  attributes: {
    size?: string;
    color?: string;
    fabric?: string;
  };
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  image?: string;
};

type Product = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;

  image?: string;
  images?: string[];
  galleryImages?: string[];

  price?: number;
  discount?: number;
  gst?: number;
  isCustomized?: boolean;
  priceIncludesGst?: boolean;

  color?: string | string[];
  size?: string | string[];
  quantity?: number;
  inStock?: boolean;

  category?: string;
  type?: string;

  dimensions?: {
    width?: number;
    depth?: number;
    height?: number;
  };

  hasVariants?: boolean;
  variants?: Variant[];
  fabricTypes?: string[];
  extraPillows?: number;
};

function toArray(value?: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,|]/g)
      .map((s) => s.trim())
      .filter(Boolean);
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

const getColorName = (hex: string) => {
  const colors: Record<string, string> = {
    "#8B7355": "Brown",
    "#1C1C1C": "Black",
    "#F5E6D3": "White",
    "#4A4A4A": "Grey",
    "#4A6741": "Green",
    "#2C3E50": "Blue",
    "#773F1A": "Brown",
    "#36454F": "Charcoal",
    "#CC5500": "Burnt Orange",
    "#008080": "Teal",
    "#D3B69C": "Beige",
    "#808000": "Olive",
  };

  return colors[hex.toUpperCase()] || hex;
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFabric, setSelectedFabric] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const productName = product?.title || product?.name || "Product";

  const hasVariants =
    !!(product?.variants && product.variants.length > 0) || product?.hasVariants === true;

  const availableColors = useMemo(() => {
    if (hasVariants && product?.variants) {
      const colors = new Set<string>();
      product.variants.forEach((v) => {
        if (v.attributes.color) colors.add(v.attributes.color);
      });
      return Array.from(colors);
    }

    return toArray(product?.color);
  }, [product, hasVariants]);

  const availableSizes = useMemo(() => {
    if (hasVariants && product?.variants) {
      const sizes = new Set<string>();
      product.variants.forEach((v) => {
        if (v.attributes.size) sizes.add(v.attributes.size);
      });
      return Array.from(sizes);
    }

    return toArray(product?.size);
  }, [product, hasVariants]);

  const availableFabrics = useMemo(() => {
    if (hasVariants && product?.variants) {
      const fabrics = new Set<string>();
      product.variants.forEach((v) => {
        if (v.attributes.fabric) fabrics.add(v.attributes.fabric);
      });
      return Array.from(fabrics);
    }

    return product?.fabricTypes || [];
  }, [product, hasVariants]);

  const selectedVariant = useMemo(() => {
    if (!hasVariants || !product?.variants) return null;

    return (
      product.variants.find((v) => {
        const colorMatch = !availableColors.length || v.attributes.color === selectedColor;
        const sizeMatch = !availableSizes.length || v.attributes.size === selectedSize;
        const fabricMatch = !availableFabrics.length || v.attributes.fabric === selectedFabric;
        return colorMatch && sizeMatch && fabricMatch;
      }) || null
    );
  }, [
    product,
    hasVariants,
    selectedColor,
    selectedSize,
    selectedFabric,
    availableColors,
    availableSizes,
    availableFabrics,
  ]);

  const originalPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.price;
    return Number(product?.price ?? 0);
  }, [product, selectedVariant]);

  const discountPercent = product?.discount ?? 0;

  const finalPrice = useMemo(() => {
    const price = originalPrice;
    if (discountPercent > 0) {
      return price * (1 - discountPercent / 100);
    }
    return price;
  }, [originalPrice, discountPercent]);

  const displayStock = useMemo(() => {
    if (hasVariants) {
      return selectedVariant ? selectedVariant.quantity : 0;
    }

    if (typeof product?.quantity === "number") return product.quantity;
    return product?.inStock ? 999 : 0;
  }, [product, hasVariants, selectedVariant]);

  const inStock = hasVariants
    ? !!(selectedVariant && selectedVariant.quantity > 0)
    : displayStock > 0;

  const requireColor = availableColors.length > 1;
  const requireSize = availableSizes.length > 1;
  const requireFabric = availableFabrics.length > 1;

  const allOptionsSelected =
    !hasVariants ||
    ((!requireColor || selectedColor) &&
      (!requireSize || selectedSize) &&
      (!requireFabric || selectedFabric));

  const images = useMemo(() => {
    const list: string[] = [];

    if (selectedVariant?.image) {
      list.push(selectedVariant.image);
    }

    if (product?.image && !list.includes(product.image)) {
      list.push(product.image);
    }

    if (product?.images?.length) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }

    if (product?.galleryImages?.length) {
      product.galleryImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }

    return list.length ? list : ["https://via.placeholder.com/900x900?text=No+Image"];
  }, [product, selectedVariant]);

  useEffect(() => {
    setSelectedImage(0);
  }, [images.length, selectedVariant?._id]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p);

  useEffect(() => {
    if (!product) return;

    if (hasVariants && product.variants && product.variants.length > 0) {
      let variantToSelect = product.variants.find((v) => v.quantity > 0);
      if (!variantToSelect) variantToSelect = product.variants[0];

      if (variantToSelect) {
        setSelectedColor(variantToSelect.attributes.color || "");
        setSelectedSize(variantToSelect.attributes.size || "");
        setSelectedFabric(variantToSelect.attributes.fabric || "");
      }
    } else {
      if (availableColors.length === 1) setSelectedColor(availableColors[0]);
      if (availableSizes.length === 1) setSelectedSize(availableSizes[0]);
      if (availableFabrics.length === 1) setSelectedFabric(availableFabrics[0]);
    }
  }, [product, hasVariants, availableColors, availableSizes, availableFabrics]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/products/${id}`, { method: "GET" });
        const p: Product = data?.product || data;
        setProduct(p);

        if (p?.category) {
          const rel = await apiFetch(`/products?category=${encodeURIComponent(p.category)}&limit=8`);
          const list: Product[] = Array.isArray(rel?.products)
            ? rel.products
            : Array.isArray(rel?.data)
            ? rel.data
            : [];
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

  const validateSelections = () => {
    if (requireColor && !selectedColor) {
      toast({ title: "Select a color", description: "Please choose a color to continue." });
      return false;
    }

    if (requireSize && !selectedSize) {
      toast({ title: "Select a size", description: "Please choose a size to continue." });
      return false;
    }

    if (requireFabric && !selectedFabric) {
      toast({ title: "Select a fabric", description: "Please choose a fabric to continue." });
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!product?._id) return;
    if (!validateSelections()) return;

    const attributes: { size?: string; color?: string; fabric?: string } = {};
    if (selectedSize) attributes.size = selectedSize;
    if (selectedColor) attributes.color = selectedColor;
    if (selectedFabric) attributes.fabric = selectedFabric;

    const cartItem = {
      id: product._id,
      name: productName,
      price: finalPrice,
      originalPrice,
      discountPercent,
      gst: product.gst ?? 0,
      priceIncludesGst: product.priceIncludesGst ?? true,
      isCustomized: product.isCustomized ?? false,
      image: images[0],
      variantId: selectedVariant?._id || null,
      attributes,
    };

    addItem(cartItem, quantity);

    toast({
      title: "Added to cart",
      description: `${quantity}x ${productName}${
        selectedColor ? ` • Color: ${getColorName(selectedColor)}` : ""
      }${selectedSize ? ` • Size: ${selectedSize}` : ""}${
        selectedFabric ? ` • Fabric: ${selectedFabric}` : ""
      } added.`,
    });
  };

  const handleWishlistToggle = () => {
    if (!product?._id) return;

    toggleFavorite({
      productId: product._id,
      id: product._id,
      name: productName,
      price: finalPrice,
      image: images[0],
      type: product?.type || "",
      color: selectedColor,
      size: selectedSize,
      fabric: selectedFabric,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = productName;
    const text = `Check out ${productName} on JSGALLOR! ${product?.description?.slice(0, 100) || ""}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast({ title: "Sharing failed", description: err.message, variant: "destructive" });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied!", description: "Product link copied to clipboard." });
      } catch {
        toast({
          title: "Copy failed",
          description: "Please copy the URL manually.",
          variant: "destructive",
        });
      }
    }
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
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center gap-2 text-sm text-white/70 mb-8">
          <Link to="/" className="hover:text-[#d4af37]">
            Home
          </Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-[#d4af37]">
            Catalog
          </Link>
          <span>/</span>
          <span className="text-white">{productName}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/20">
              <img src={images[selectedImage]} alt={productName} className="w-full h-full object-cover" />

              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-[#d4af37] text-[#7a5a1e] text-sm font-bold px-3 py-1 rounded-full">
                  -{discountPercent}%
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

            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                    selectedImage === idx ? "border-[#d4af37]" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

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
              <span className="text-3xl font-bold">{formatPrice(finalPrice)}</span>
              {discountPercent > 0 && (
                <span className="text-xl text-white/50 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>

            <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
              {product.description || "—"}
            </div>

            {availableColors.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white mb-3">Color</p>
                  {selectedColor ? (
                    <p className="text-xs text-white/60">{getColorName(selectedColor)}</p>
                  ) : requireColor ? (
                    <p className="text-xs text-red-300">Required</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color, idx) => {
                    const selected = selectedColor === color;
                    const isHex = isHexColor(color);
                    return (
                      <button
                        key={`${color}-${idx}`}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selected ? "border-[#d4af37] scale-110" : "border-transparent hover:border-white/30"
                        }`}
                        style={{ backgroundColor: isHex ? color : undefined }}
                      >
                        {!isHex && <span className="text-white text-xs">{color}</span>}
                        {selected && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {availableSizes.length > 0 && (
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
                  {availableSizes.map((size) => {
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

            {availableFabrics.length > 0 && (
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white mb-3">Fabric</p>
                  {selectedFabric ? (
                    <p className="text-xs text-white/60 capitalize">{selectedFabric}</p>
                  ) : requireFabric ? (
                    <p className="text-xs text-red-300">Required</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableFabrics.map((fabric) => {
                    const selected = selectedFabric === fabric;
                    return (
                      <button
                        key={fabric}
                        onClick={() => setSelectedFabric(fabric)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all capitalize ${
                          selected
                            ? "border-[#d4af37] bg-[#d4af37]/10 text-white"
                            : "border-white/20 text-white/80 hover:border-white/40"
                        }`}
                      >
                        {fabric}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.isCustomized && (
              <div>
                <Button
                  className="w-full bg-white/20 text-white border border-white/40 hover:bg-white/30"
                  size="xl"
                  onClick={() => {
                    const message = `Hi, I'm interested in customizing this product:%0A%0A*Name:* ${encodeURIComponent(
                      productName
                    )}%0A*ID:* ${product._id}%0A%0ACan you please share customization options?`;
                    window.open(`https://wa.me/917075848516?text=${message}`, "_blank");
                  }}
                >
                  ✨ Customize This Product
                </Button>
                <p className="text-xs text-white/60 mt-2">
                  Choose size, color, fabric, and add personal touches.
                </p>
              </div>
            )}

            {product.dimensions && (
              <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <p className="font-medium text-white mb-3">Dimensions</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Width</span>
                    <p className="font-medium text-white">{product.dimensions.width ?? "—"} cm</p>
                  </div>
                  <div>
                    <span className="text-white/70">Depth</span>
                    <p className="font-medium text-white">{product.dimensions.depth ?? "—"} cm</p>
                  </div>
                  <div>
                    <span className="text-white/70">Height</span>
                    <p className="font-medium text-white">{product.dimensions.height ?? "—"} cm</p>
                  </div>
                </div>
              </div>
            )}

            {product.extraPillows ? (
              <div className="text-sm text-white/70">
                <span className="font-medium text-white">Extra pillows included:</span> {product.extraPillows}
              </div>
            ) : null}

            <div className="text-sm space-y-1">
              <div>
                <span className="text-white/70">GST:</span>{" "}
                <span className="text-white">{product.gst ?? 0}%</span>
              </div>
              <div>
                <span className="text-white/70">Availability:</span>{" "}
                <span
                  className={
                    hasVariants && !selectedVariant
                      ? "text-yellow-300"
                      : inStock
                      ? "text-green-300"
                      : "text-red-300"
                  }
                >
                  {hasVariants && !selectedVariant
                    ? "Select options to see availability"
                    : inStock
                    ? `In Stock (${displayStock})`
                    : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-white/70 hover:text-white"
                  disabled={!inStock}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-medium text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-white/70 hover:text-white"
                  disabled={
                    !inStock ||
                    (hasVariants && !!selectedVariant && quantity >= selectedVariant.quantity)
                  }
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <Button
                className="flex-1 bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
                size="xl"
                onClick={handleAddToCart}
                disabled={!inStock || (hasVariants && !allOptionsSelected)}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {!inStock
                  ? "Out of Stock"
                  : hasVariants && !allOptionsSelected
                  ? "Select Options"
                  : "Add to Cart"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-white/20 bg-black/20 text-white hover:bg-white/30"
                onClick={handleShare}
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

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

        <section className="mt-20 border-t border-white/10 pt-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-heading font-bold text-white mb-4">Product Description</h2>

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

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-heading font-bold text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => {
                const name = item.title || item.name || "Product";
                const img =
                  item.image ||
                  item.images?.[0] ||
                  item.galleryImages?.[0] ||
                  "https://via.placeholder.com/600";
                const original = Number(item.price ?? 0);
                const discount = item.discount ?? 0;
                const final = discount > 0 ? original * (1 - discount / 100) : original;

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
                    <div className="flex items-baseline gap-2">
                      <p className="text-[#d4af37] font-bold">{formatPrice(final)}</p>
                      {discount > 0 && (
                        <p className="text-xs text-white/50 line-through">{formatPrice(original)}</p>
                      )}
                    </div>
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
