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

  // your backend fields
  category?: string;     // parent slug (ex: dining)
  subcategory?: string;  // child slug (ex: chair)  ✅ add this if backend has it
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

  status?: string; // approved
  tier?: string; // luxury
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

  // ✅ keep URL query filters (room/material/style/price)
  const activeRoom = searchParams.get("room");
  const activeMaterial = searchParams.get("material");
  const activeStyle = searchParams.get("style");
  const activePriceMin = searchParams.get("priceMin");
  const activePriceMax = searchParams.get("priceMax");

  // ✅ route-based filters
  const activeCategorySlug = (categorySlug || "").trim() || null;
  const activeSubSlug = (subCategorySlug || "").trim() || null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // ✅ Fetch products from backend (approved + luxury)
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

        // extra safety filter
        const filtered = list.filter((p) => norm(p.status) === "approved" && norm(p.tier) === "luxury");

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

  // ✅ Sync route params into query params (optional, but keeps URL filters consistent)
  // You can remove this if you don’t want category/subcategory in query at all.
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (activeCategorySlug) newParams.set("category", activeCategorySlug);
    else newParams.delete("category");

    if (activeSubSlug) newParams.set("subcategory", activeSubSlug);
    else newParams.delete("subcategory");

    // prevent infinite loop: only update if changed
    const before = searchParams.toString();
    const after = newParams.toString();
    if (before !== after) setSearchParams(newParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategorySlug, activeSubSlug]);

  // ✅ Filter products (route params + query params)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // category from route
    if (activeCategorySlug) {
      result = result.filter((p) => norm(p.category) === norm(activeCategorySlug));
    }

    // subcategory from route (if your product has "subcategory")
    if (activeSubSlug) {
      result = result.filter((p) => norm((p as any).subcategory) === norm(activeSubSlug));
    }

    // other filters
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

    // Sort
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
        // featured: keep backend order as-is
        break;
    }

    return result;
  }, [products, activeCategorySlug, activeSubSlug, activeRoom, activeMaterial, activeStyle, activePriceMin, activePriceMax, sortBy]);

  const setFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    // keep route-based filters, clear other query filters
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
    !!activeCategorySlug || !!activeSubSlug || !!activeRoom || !!activeMaterial || !!activeStyle || !!activePriceMin;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold">
              {activeCategorySlug ? `Catalog • ${activeCategorySlug}` : "Catalog"}
              {activeSubSlug ? ` • ${activeSubSlug}` : ""}
            </h1>
            <p className="text-muted-foreground mt-1">
              {loading ? "Loading..." : `${filteredProducts.length} products`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="icon" size="icon" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "text-gold" : ""}>
              <Grid className="w-5 h-5" />
            </Button>
            <Button variant="icon" size="icon" onClick={() => setViewMode("list")} className={viewMode === "list" ? "text-gold" : ""}>
              <List className="w-5 h-5" />
            </Button>

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? "fixed inset-0 z-50 bg-background p-6" : "hidden"} lg:block lg:relative lg:w-64 lg:flex-shrink-0`}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-xl font-heading font-bold">Filters</h2>
              <Button variant="icon" size="icon" onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="mb-6 text-gold">
                Clear all filters
              </Button>
            )}

            {/* ✅ Category info (route based) */}
            {(activeCategorySlug || activeSubSlug) && (
              <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 mb-6">
                <p className="text-sm text-muted-foreground">Browsing</p>
                <p className="font-semibold mt-1">
                  {activeCategorySlug || "All"} {activeSubSlug ? `→ ${activeSubSlug}` : ""}
                </p>
                <Link to="/catalog" className="text-sm text-gold hover:underline mt-2 inline-block">
                  Go to all products
                </Link>
              </div>
            )}

            {/* Room Filter */}
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

            {/* Material Filter */}
            <FilterSection title="Material">
              {filterOptions.materials.map((mat) => (
                <FilterItem
                  key={mat.value}
                  label={mat.label}
                  active={activeMaterial === mat.value}
                  onClick={() => setFilter("material", activeMaterial === mat.value ? null : mat.value)}
                />
              ))}
            </FilterSection>

            {/* Style Filter */}
            <FilterSection title="Style">
              {filterOptions.styles.map((style) => (
                <FilterItem
                  key={style.value}
                  label={style.label}
                  active={activeStyle === style.value}
                  onClick={() => setFilter("style", activeStyle === style.value ? null : style.value)}
                />
              ))}
            </FilterSection>

            {/* Price Filter */}
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

            <Button variant="gold" className="w-full mt-6 lg:hidden" onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Sort */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-secondary/30 border border-border/50 rounded-lg px-3 py-2 text-sm outline-none focus:border-gold"
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
              <div className="rounded-xl border border-border/40 bg-secondary/20 p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading approved luxury products...</p>
              </div>
            ) : errMsg ? (
              <div className="rounded-xl border border-border/40 bg-secondary/20 p-6">
                <p className="text-sm text-muted-foreground">{errMsg}</p>
                <Button variant="gold-outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No products found</p>
                <Button variant="gold-outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {filteredProducts.map((product, index) => {
                  const id = product._id;
                  const title = pickTitle(product);
                  const img = pickImage(product);
                  const newPrice = pickNewPrice(product);
                  const oldPrice = typeof product.oldPrice === "number" ? product.oldPrice : undefined;

                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group relative ${viewMode === "list" ? "flex gap-6" : ""}`}
                    >
                      <Link
                        to={`/product/${id}`}
                        className={`relative overflow-hidden rounded-xl bg-secondary/20 block ${
                          viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "aspect-square"
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
                          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                            No image
                          </div>
                        )}

                        {(product.discount || 0) > 0 && (
                          <span className="absolute top-3 left-3 bg-gold text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
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
                            ? "bg-gold text-primary-foreground"
                            : "bg-card/80 backdrop-blur-sm hover:bg-gold hover:text-primary-foreground"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(id as any) ? "fill-current" : ""}`} />
                      </button>

                      <div className={viewMode === "list" ? "flex-1 py-2" : "mt-4"}>
                        <p className="text-sm text-muted-foreground">{product.type || "Luxury"}</p>

                        <Link to={`/product/${id}`}>
                          <h3 className="font-semibold hover:text-gold transition-colors">{title}</h3>
                        </Link>

                        <div className="flex items-center gap-3 mt-1">
                          {typeof oldPrice === "number" && oldPrice > newPrice && (
                            <span className="text-muted-foreground line-through text-sm">{formatPrice(oldPrice)}</span>
                          )}
                          <span className="text-gold font-bold">{formatPrice(newPrice)}</span>
                        </div>

                        {viewMode === "list" && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
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

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-border/50 pb-4 mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full py-2 font-medium">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
};

const FilterItem = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? "bg-gold/20 text-gold" : "hover:bg-secondary/50 text-muted-foreground"
    }`}
  >
    {label}
  </button>
);

export default Catalog;