import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X, Heart, ChevronDown, Grid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { filterOptions } from "@/data/siteData";
import { useFavorites } from "@/contexts/FavoritesContext";

const API_BASE = "https://api.jsgallor.com/api/luxury";
const TOKEN_KEY = "luxury_auth_token";

type Product = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  room?: string;
  material?: string;
  style?: string;
  image?: string;
  images?: string[];
  colors?: string[];
  oldPrice?: number;
  newPrice?: number;
  price?: number;
  discount?: number;
  status?: string;
  tier?: string;
};

const getToken = () => localStorage.getItem(TOKEN_KEY);
const norm = (v?: string) => (v || "").toLowerCase().trim();

const pickTitle = (p: Product) => p.title || p.name || "Product";
const pickImage = (p: Product) => p.image || (Array.isArray(p.images) ? p.images[0] : "") || "";
const pickNewPrice = (p: Product) =>
  typeof p.newPrice === "number" ? p.newPrice : typeof p.price === "number" ? p.price : 0;

const Catalog = () => {
  const { categorySlug, subCategorySlug } = useParams<{
    categorySlug?: string;
    subCategorySlug?: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { isFavorite, toggleFavorite } = useFavorites();

  const activeRoom = searchParams.get("room");
  const activeMaterial = searchParams.get("material");
  const activeStyle = searchParams.get("style");
  const activePriceMin = searchParams.get("priceMin");
  const activePriceMax = searchParams.get("priceMax");

  const activeCategorySlug = (categorySlug || "").trim() || null;
  const activeSubSlug = (subCategorySlug || "").trim() || null;

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
        const res = await fetch(`${API_BASE}/products?status=approved&tier=luxury&limit=200`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || `Failed to load products (${res.status})`);

        const list: Product[] = Array.isArray(json?.products)
          ? json.products
          : Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];

        const filtered = list.filter(
          (p) => norm(p.status) === "approved" && norm(p.tier) === "luxury"
        );

        if (mounted) setProducts(filtered);
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

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (activeCategorySlug) newParams.set("category", activeCategorySlug);
    else newParams.delete("category");

    if (activeSubSlug) newParams.set("subcategory", activeSubSlug);
    else newParams.delete("subcategory");

    const before = searchParams.toString();
    const after = newParams.toString();
    if (before !== after) setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategorySlug, activeSubSlug]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategorySlug) {
      result = result.filter((p) => norm(p.category) === norm(activeCategorySlug));
    }

    if (activeSubSlug) {
      result = result.filter((p) => norm((p as any).subcategory) === norm(activeSubSlug));
    }

    if (activeRoom) result = result.filter((p) => norm(p.room) === norm(activeRoom));
    if (activeMaterial) result = result.filter((p) => norm(p.material) === norm(activeMaterial));
    if (activeStyle) result = result.filter((p) => norm(p.style) === norm(activeStyle));

    if (activePriceMin && activePriceMax) {
      const min = Number(activePriceMin);
      const max = Number(activePriceMax);
      result = result.filter((p) => {
        const price = pickNewPrice(p);
        return price >= min && price <= max;
      });
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => pickNewPrice(a) - pickNewPrice(b));
        break;
      case "price-desc":
        result.sort((a, b) => pickNewPrice(b) - pickNewPrice(a));
        break;
      case "discount":
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      default:
        break;
    }

    return result;
  }, [
    products,
    activeCategorySlug,
    activeSubSlug,
    activeRoom,
    activeMaterial,
    activeStyle,
    activePriceMin,
    activePriceMax,
    sortBy,
  ]);

  const setFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (activeCategorySlug) newParams.set("category", activeCategorySlug);
    if (activeSubSlug) newParams.set("subcategory", activeSubSlug);
    setSearchParams(newParams);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const hasActiveFilters =
    !!activeCategorySlug ||
    !!activeSubSlug ||
    !!activeRoom ||
    !!activeMaterial ||
    !!activeStyle ||
    !!activePriceMin;

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative overflow-x-hidden">
      {/* Soft overlay for text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-lg break-words">
              {activeCategorySlug ? `Catalog • ${activeCategorySlug}` : "Catalog"}
              {activeSubSlug ? ` • ${activeSubSlug}` : ""}
            </h1>
            <p className="text-sm sm:text-base text-white/80 mt-1">
              {loading ? "Loading..." : `${filteredProducts.length} products`}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-start lg:self-auto">
            <Button
              variant="icon"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "text-white" : "text-white/70 hover:text-white"}
            >
              <Grid className="w-5 h-5" />
            </Button>

            <Button
              variant="icon"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "text-white" : "text-white/70 hover:text-white"}
            >
              <List className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden border-white text-white hover:bg-white hover:text-[#7a5a1e]"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto" : "hidden"
            } lg:block lg:relative lg:w-64 lg:flex-shrink-0`}
          >
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-xl font-heading font-bold text-white">Filters</h2>
              <Button variant="icon" size="icon" onClick={() => setShowFilters(false)} className="text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="lg:sticky lg:top-24">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="mb-6 text-white hover:text-[#d4af37]"
                >
                  Clear all filters
                </Button>
              )}

              {(activeCategorySlug || activeSubSlug) && (
                <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-4 mb-6">
                  <p className="text-sm text-white/70">Browsing</p>
                  <p className="font-semibold mt-1 text-white break-words">
                    {activeCategorySlug || "All"} {activeSubSlug ? `→ ${activeSubSlug}` : ""}
                  </p>
                  <Link
                    to="/catalog"
                    className="text-sm text-[#d4af37] hover:underline mt-2 inline-block"
                  >
                    Go to all products
                  </Link>
                </div>
              )}

              <FilterSection title="Room">
                {filterOptions.rooms.map((room) => (
                  <FilterItem
                    key={room.value}
                    label={room.label}
                    active={activeRoom === room.value}
                    onClick={() => setFilter("room", activeRoom === room.value ? null : room.value)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Material">
                {filterOptions.materials.map((mat) => (
                  <FilterItem
                    key={mat.value}
                    label={mat.label}
                    active={activeMaterial === mat.value}
                    onClick={() =>
                      setFilter("material", activeMaterial === mat.value ? null : mat.value)
                    }
                  />
                ))}
              </FilterSection>

              <FilterSection title="Style">
                {filterOptions.styles.map((style) => (
                  <FilterItem
                    key={style.value}
                    label={style.label}
                    active={activeStyle === style.value}
                    onClick={() =>
                      setFilter("style", activeStyle === style.value ? null : style.value)
                    }
                  />
                ))}
              </FilterSection>

              <FilterSection title="Price Range">
                {filterOptions.priceRanges.map((range, idx) => (
                  <FilterItem
                    key={idx}
                    label={range.label}
                    active={activePriceMin === String(range.min)}
                    onClick={() => {
                      if (activePriceMin === String(range.min)) {
                        setFilter("priceMin", null);
                        setFilter("priceMax", null);
                      } else {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("priceMin", String(range.min));
                        newParams.set("priceMax", String(range.max));
                        setSearchParams(newParams);
                      }
                    }}
                  />
                ))}
              </FilterSection>

              <Button
                className="w-full mt-6 lg:hidden bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Sort */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-white/80">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="min-w-[180px] bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>
            </div>

            {/* Loading / Error / Empty */}
            {loading ? (
              <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-5 sm:p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-white/70" />
                <p className="text-sm text-white/80">Loading approved luxury products...</p>
              </div>
            ) : errMsg ? (
              <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-5 sm:p-6">
                <p className="text-sm text-white/80">{errMsg}</p>
                <Button
                  variant="outline"
                  className="mt-4 border-white text-white hover:bg-white hover:text-[#7a5a1e]"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-20">
                <p className="text-lg sm:text-xl text-white/80">No products found</p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4 border-white text-white hover:bg-white hover:text-[#7a5a1e]"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredProducts.map((product, index) => {
                  const id = product._id;
                  const title = pickTitle(product);
                  const img = pickImage(product);
                  const newPrice = pickNewPrice(product);
                  const oldPrice =
                    typeof product.oldPrice === "number" ? product.oldPrice : undefined;

                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group relative ${
                        viewMode === "list"
                          ? "flex flex-col sm:flex-row gap-4 sm:gap-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 p-4"
                          : "bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 p-4"
                      }`}
                    >
                      <div className="relative">
                        <Link
                          to={`/product/${id}`}
                          className={`relative overflow-hidden rounded-lg bg-black/20 block ${
                            viewMode === "list"
                              ? "w-full sm:w-48 h-56 sm:h-48 sm:flex-shrink-0"
                              : "aspect-square"
                          }`}
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-white/50">
                              No image
                            </div>
                          )}

                          {(product.discount || 0) > 0 && (
                            <span className="absolute top-3 left-3 bg-[#d4af37] text-[#7a5a1e] text-xs font-bold px-2 py-1 rounded-full">
                              -{product.discount}%
                            </span>
                          )}
                        </Link>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite({
                              id,
                              name: title,
                              price: newPrice,
                              image: img,
                              type: product.type || "Luxury",
                            } as any);
                          }}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
                            isFavorite(id as any)
                              ? "bg-[#d4af37] text-[#7a5a1e]"
                              : "bg-black/60 backdrop-blur-sm text-white hover:bg-[#d4af37] hover:text-[#7a5a1e]"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${isFavorite(id as any) ? "fill-current" : ""}`}
                          />
                        </button>
                      </div>

                      <div className={viewMode === "list" ? "flex-1 py-1 sm:py-2 min-w-0" : "mt-4"}>
                        <p className="text-sm text-white/70">
                          {product.type || "Luxury"}
                        </p>

                        <Link to={`/product/${id}`}>
                          <h3 className="font-semibold text-white hover:text-[#d4af37] transition-colors break-words line-clamp-2">
                            {title}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                          {typeof oldPrice === "number" && oldPrice > newPrice && (
                            <span className="text-white/50 line-through text-sm">
                              {formatPrice(oldPrice)}
                            </span>
                          )}
                          <span className="text-[#d4af37] font-bold">{formatPrice(newPrice)}</span>
                        </div>

                        {viewMode === "list" && (
                          <p className="text-sm text-white/70 mt-2 line-clamp-3">
                            {product.description || "—"}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-white/10 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 font-medium text-left text-white"
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform text-white/70 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
};

const FilterItem = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
      active
        ? "bg-[#d4af37]/20 text-[#d4af37]"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    {label}
  </button>
);

export default Catalog;