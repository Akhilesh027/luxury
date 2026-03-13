import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ✅ change if deployed
const API_BASE = "https://api.jsgallor.com/api/luxury";
const TOKEN_KEY = "luxury_auth_token";

type Product = {
  _id: string;
  title?: string;
  name?: string;

  image?: string;
  images?: string[];

  type?: string;
  category?: string;

  colors?: string[];
  discount?: number;

  oldPrice?: number;
  newPrice?: number;
  price?: number;

  status?: string;
  tier?: string;
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const normalizeStatus = (s?: string) => (s || "").toLowerCase().trim();
const normalizeTier = (t?: string) => (t || "").toLowerCase().trim();

const pickTitle = (p: Product) => p.title || p.name || "Product";
const pickImage = (p: Product) =>
  p.image || (Array.isArray(p.images) ? p.images[0] : "") || "";
const pickType = (p: Product) => p.type || p.category || "Luxury";

const pickDiscount = (p: Product) => {
  if (typeof p.discount === "number") return p.discount;

  const oldP = typeof p.oldPrice === "number" ? p.oldPrice : undefined;
  const newP = typeof p.newPrice === "number" ? p.newPrice : undefined;

  if (oldP && newP && oldP > newP) {
    return Math.round(((oldP - newP) / oldP) * 100);
  }

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

        const list: Product[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.products)
          ? json.products
          : [];

        const filtered = list.filter(
          (p) =>
            normalizeStatus(p.status) === "approved" &&
            normalizeTier(p.tier) === "luxury"
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / 4)),
    [products.length]
  );

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
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-[#3b2a12] via-[#8b6b2e] to-[#3b2a12] text-[#f8f3e7]">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-[#f8f3e7] tracking-wide">
            New Products
          </h2>

          <div className="hidden md:flex gap-2">
            <Button
              variant="icon"
              size="icon"
              onClick={() => scroll("left")}
              disabled={loading}
              className="bg-[#2b1d0e]/70 border border-[#ffd76a]/30 text-[#f8f3e7] hover:bg-[#3b2a12] hover:text-[#ffd76a] disabled:opacity-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="icon"
              size="icon"
              onClick={() => scroll("right")}
              disabled={loading}
              className="bg-[#2b1d0e]/70 border border-[#ffd76a]/30 text-[#f8f3e7] hover:bg-[#3b2a12] hover:text-[#ffd76a] disabled:opacity-50"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#ffd76a]/20 bg-[#2b1d0e]/40 p-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#ffd76a]" />
            <p className="text-sm text-[#f8f3e7]/80">
              Loading approved luxury products...
            </p>
          </div>
        ) : errMsg ? (
          <div className="rounded-xl border border-[#ffd76a]/20 bg-[#2b1d0e]/40 p-6">
            <p className="text-sm text-[#f8f3e7]/80">{errMsg}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-[#ffd76a]/20 bg-[#2b1d0e]/40 p-6">
            <p className="text-sm text-[#f8f3e7]/80">
              No <span className="font-semibold text-[#ffd76a]">approved</span> luxury
              products found.
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
                    className="group relative w-72 flex-shrink-0 snap-start lg:w-80"
                  >
                    <Link to={`/product/${id}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#ffd76a]/20 bg-[#2b1d0e]/35 shadow-lg transition-all duration-300 group-hover:border-[#ffd76a]/45">
                        {img ? (
                          <img
                            src={img}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-[#f8f3e7]/65">
                            No image
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#2b1d0e]/90 via-[#3b2a12]/25 to-transparent" />

                        {discount > 0 && (
                          <span className="absolute left-3 top-3 rounded-full border border-[#ffd76a]/30 bg-[#ffd76a] px-2 py-1 text-xs font-bold text-[#2b1d0e] shadow-md">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      {Array.isArray(product.colors) && product.colors.length > 0 && (
                        <div className="mt-4 flex items-center gap-1.5">
                          {product.colors.slice(0, 4).map((color, idx) => (
                            <span
                              key={idx}
                              className="h-5 w-5 rounded-full border border-[#f8f3e7]/25 shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}

                      <p className="mt-3 text-sm text-[#f8f3e7]/70">{type}</p>
                      <h4 className="mt-1 text-lg font-semibold tracking-wide text-[#f8f3e7]">
                        {title}
                      </h4>

                      <div className="mt-2 flex items-center gap-3">
                        {typeof oldPrice === "number" && oldPrice > newPrice && (
                          <p className="text-sm  line-through">
                            {formatPrice(oldPrice)}
                          </p>
                        )}
                        <p className="font-bold text-[#ffd76a]">{formatPrice(newPrice)}</p>
                      </div>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(id);
                      }}
                      className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                        favorites.includes(id)
                          ? "border-[#ffd76a]/40 bg-[#ffd76a] text-[#2b1d0e]"
                          : "border-[#f8f3e7]/15 bg-[#2b1d0e]/75 text-[#f8f3e7] backdrop-blur-sm hover:border-[#ffd76a]/30 hover:bg-[#3b2a12] hover:text-[#ffd76a]"
                      }`}
                      aria-label="Toggle favorite"
                    >
                      <Heart
                        className={`h-4 w-4 ${favorites.includes(id) ? "fill-current" : ""}`}
                      />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium">
              <span className="text-xl font-heading text-[#ffd76a]">
                {String(currentPage).padStart(2, "0")}
              </span>
              <div className="h-px w-12 bg-[#f8f3e7]/25" />
              <span className="text-[#f8f3e7]/70">
                {String(totalPages).padStart(2, "0")}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default NewProducts;