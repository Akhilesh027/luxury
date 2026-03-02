import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ✅ change if deployed
const API_BASE = "https://jsbackend-hjj1.onrender.com/api/luxury";
const TOKEN_KEY = "luxury_auth_token";

type Product = {
  _id: string;
  title?: string;
  name?: string;

  image?: string; // single image
  images?: string[]; // or array

  type?: string;
  category?: string;

  colors?: string[];
  discount?: number;

  oldPrice?: number;
  newPrice?: number;
  price?: number; // if backend gives price

  status?: string; // "approved"
  tier?: string; // "luxury"
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const normalizeStatus = (s?: string) => (s || "").toLowerCase().trim();
const normalizeTier = (t?: string) => (t || "").toLowerCase().trim();

const pickTitle = (p: Product) => p.title || p.name || "Product";
const pickImage = (p: Product) => p.image || (Array.isArray(p.images) ? p.images[0] : "") || "";
const pickType = (p: Product) => p.type || p.category || "Luxury";
const pickDiscount = (p: Product) => {
  if (typeof p.discount === "number") return p.discount;
  // if old/new price exist, calculate discount
  const oldP = typeof p.oldPrice === "number" ? p.oldPrice : undefined;
  const newP = typeof p.newPrice === "number" ? p.newPrice : undefined;
  if (oldP && newP && oldP > newP) return Math.round(((oldP - newP) / oldP) * 100);
  return 0;
};
const pickOldPrice = (p: Product) => {
  if (typeof p.oldPrice === "number") return p.oldPrice;
  return undefined;
};
const pickNewPrice = (p: Product) => {
  if (typeof p.newPrice === "number") return p.newPrice;
  if (typeof p.price === "number") return p.price;
  return 0;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const NewProducts = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // ✅ Fetch approved + luxury products
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErrMsg(null);

        const token = getToken();
        const res = await fetch(`${API_BASE}/products`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json?.message || `Failed to load products (${res.status})`);
        }

        // ✅ accept either {data: []} or {products: []} or []
        const list: Product[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.products)
          ? json.products
          : [];

        // ✅ filter: approved + luxury (case-insensitive)
        const filtered = list.filter(
          (p) => normalizeStatus(p.status) === "approved" && normalizeTier(p.tier) === "luxury"
        );

        if (mounted) {
          setProducts(filtered);
          setCurrentPage(1);
        }
      } catch (e) {
        if (mounted) {
          setProducts([]);
          setErrMsg(e instanceof Error ? e.message : "Failed to load products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(products.length / 4)), [products.length]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 340;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    if (direction === "right" && currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    } else if (direction === "left" && currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  return (
    <section className="py-16 lg:py-24 bg-charcoal">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold">New Products</h2>

          <div className="hidden md:flex gap-2">
            <Button variant="icon" size="icon" onClick={() => scroll("left")} disabled={loading}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button variant="icon" size="icon" onClick={() => scroll("right")} disabled={loading}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ✅ States */}
        {loading ? (
          <div className="rounded-xl border border-border/40 bg-secondary/20 p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading approved luxury products...</p>
          </div>
        ) : errMsg ? (
          <div className="rounded-xl border border-border/40 bg-secondary/20 p-6">
            <p className="text-sm text-muted-foreground">{errMsg}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-secondary/20 p-6">
            <p className="text-sm text-muted-foreground">
              No <span className="text-gold font-semibold">approved</span> luxury products found.
            </p>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.map((product, index) => {
                const id = product._id;
                const title = pickTitle(product);
                const img = pickImage(product);
                const type = pickType(product);

                const discount = pickDiscount(product);
                const oldPrice = pickOldPrice(product);
                const newPrice = pickNewPrice(product);

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 w-72 lg:w-80 snap-start group relative"
                  >
                    <Link to={`/product/${id}`} className="block">
                      {/* Image */}
                      <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-secondary/20">
                        {img ? (
                          <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                            No image
                          </div>
                        )}

                        {/* Discount badge */}
                        {discount > 0 && (
                          <span className="absolute top-3 left-3 bg-gold text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      {/* Colors */}
                      {Array.isArray(product.colors) && product.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-4">
                          {product.colors.slice(0, 4).map((color, idx) => (
                            <span
                              key={idx}
                              className="w-5 h-5 rounded-full border border-border/50"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Info */}
                      <p className="text-muted-foreground text-sm mt-3">{type}</p>
                      <h4 className="text-lg font-semibold mt-1">{title}</h4>

                      <div className="flex items-center gap-3 mt-2">
                        {typeof oldPrice === "number" && oldPrice > newPrice && (
                          <p className="text-muted-foreground line-through text-sm">{formatPrice(oldPrice)}</p>
                        )}
                        <p className="text-gold font-bold">{formatPrice(newPrice)}</p>
                      </div>
                    </Link>

                    {/* Favorite button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(id);
                      }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                        favorites.includes(id)
                          ? "bg-gold text-primary-foreground"
                          : "bg-card/80 backdrop-blur-sm text-foreground hover:bg-gold hover:text-primary-foreground"
                      }`}
                      aria-label="Toggle favorite"
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(id) ? "fill-current" : ""}`} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 mt-8 text-sm font-medium">
              <span className="text-gold text-xl font-heading">
                {String(currentPage).padStart(2, "0")}
              </span>
              <div className="w-12 h-px bg-border" />
              <span className="text-muted-foreground">{String(totalPages).padStart(2, "0")}</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewProducts;
