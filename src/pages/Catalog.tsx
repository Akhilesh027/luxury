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
const API_ADMIN = "https://api.jsgallor.com/api/admin";
const TOKEN_KEY = "luxury_auth_token";

type Product = {
  _id: string;
  title?: string;
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  image?: string;
  images?: string[];
  oldPrice?: number;
  newPrice?: number;
  price?: number;
  discount?: number;
  status?: string;
  tier?: string;
};

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  status?: string;
  showOnWebsite?: boolean;
};

const getToken = () => localStorage.getItem(TOKEN_KEY);
const norm = (v?: string) => (v || "").toLowerCase().trim();

const pickTitle = (p: Product) => p.title || p.name || "Product";
const pickImage = (p: Product) => p.image || (Array.isArray(p.images) ? p.images[0] : "") || "";
const pickNewPrice = (p: Product) =>
  typeof p.newPrice === "number" ? p.newPrice : typeof p.price === "number" ? p.price : 0;

// Helper to compute original price from discounted price and discount percent
const computeOriginalPrice = (price: number, discountPercent: number): number => {
  if (discountPercent <= 0) return price;
  return Math.round(price * 100 / (100 - discountPercent));
};

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

  const activePriceMin = searchParams.get("priceMin");
  const activePriceMax = searchParams.get("priceMax");
  const searchQuery = searchParams.get("search") || "";
  const filterCategorySlug = searchParams.get("cat") || categorySlug || null;
  const filterSubSlug = searchParams.get("sub") || subCategorySlug || null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Categories state for filter UI
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);

  // Fetch categories (luxury + all)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCatLoading(true);
        const urls = [
          `${API_ADMIN}/categories?segment=all&status=active&level=all&sort=order&limit=200`,
          `${API_ADMIN}/categories?segment=luxury&status=active&level=all&sort=order&limit=200`,
        ];
        const [r1, r2] = await Promise.all(urls.map((u) => fetch(u)));
        if (!r1.ok || !r2.ok) throw new Error("Failed to fetch categories");
        const j1 = await r1.json().catch(() => ({}));
        const j2 = await r2.json().catch(() => ({}));
        const a1: ApiCategory[] = Array.isArray(j1) ? j1 : j1?.data?.items || [];
        const a2: ApiCategory[] = Array.isArray(j2) ? j2 : j2?.data?.items || [];
        const map = new Map<string, ApiCategory>();
        [...a1, ...a2].forEach((c) => {
          if (!c?.slug) return;
          const prev = map.get(c.slug);
          if (!prev) map.set(c.slug, c);
          else if (norm(prev.status) === "all" && norm(c.status) === "luxury") map.set(c.slug, c);
        });
        let merged = Array.from(map.values());
        merged = merged.filter((c) => c.status === "active" && c.showOnWebsite !== false);
        merged.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCategories(merged);
      } catch (err) {
        console.error("Category fetch error:", err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Group categories into parent and children
  const parents = useMemo(() => categories.filter((c) => !c.parentId), [categories]);
  const childrenMap = useMemo(() => {
    const map = new Map<string, ApiCategory[]>();
    parents.forEach((p) => {
      map.set(p.slug, categories.filter((c) => c.parentId === p.id));
    });
    return map;
  }, [categories, parents]);

  const selectedParent = parents.find((p) => p.slug === filterCategorySlug) || null;
  const selectedChild = childrenMap.get(filterCategorySlug || "")?.find((c) => c.slug === filterSubSlug) || null;

  // Build API URL with category/subcategory filters
  const buildApiUrl = () => {
    const url = new URL(`${API_BASE}/products`);
    url.searchParams.set("status", "approved");
    url.searchParams.set("tier", "luxury");
    url.searchParams.set("limit", "200");
    if (filterCategorySlug) url.searchParams.set("category", filterCategorySlug);
    if (filterSubSlug) url.searchParams.set("subcategory", filterSubSlug);
    return url.toString();
  };

  // Fetch products when filters change
  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setErrMsg(null);
        const token = getToken();
        const url = buildApiUrl();
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: abortController.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || `Failed to load products (${res.status})`);
        let list: Product[] = [];
        if (Array.isArray(json?.products)) list = json.products;
        else if (Array.isArray(json?.data)) list = json.data;
        else if (Array.isArray(json)) list = json;
        if (mounted) setProducts(list);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        if (mounted) {
          setProducts([]);
          setErrMsg(err.message || "Failed to load products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [filterCategorySlug, filterSubSlug]);

  // Client-side filtering (price, search) and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activePriceMin && activePriceMax) {
      const min = Number(activePriceMin);
      const max = Number(activePriceMax);
      result = result.filter((p) => {
        const price = pickNewPrice(p);
        return price >= min && price <= max;
      });
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          pickTitle(p).toLowerCase().includes(lowerQuery) ||
          (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
          (p.type && p.type.toLowerCase().includes(lowerQuery))
      );
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
  }, [products, activePriceMin, activePriceMax, searchQuery, sortBy]);

  const setFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set("search", searchQuery);
    setSearchParams(newParams);
  };

  const handleCategoryChange = (parentSlug: string | null, childSlug: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (parentSlug) newParams.set("cat", parentSlug);
    else newParams.delete("cat");
    if (childSlug) newParams.set("sub", childSlug);
    else newParams.delete("sub");
    setSearchParams(newParams);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const hasActiveFilters = !!filterCategorySlug || !!filterSubSlug || !!activePriceMin;

  // Helper to render product card with discount and original price
  const renderProductCard = (product: Product, index: number) => {
    const id = product._id;
    const title = pickTitle(product);
    const img = pickImage(product);
    const finalPrice = pickNewPrice(product);
    const discountPercent = product.discount || 0;
    const originalPrice = computeOriginalPrice(finalPrice, discountPercent);
    const hasDiscount = discountPercent > 0 && originalPrice > finalPrice;

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

            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-[#d4af37] text-[#7a5a1e] text-xs font-bold px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
          </Link>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite({
                id,
                name: title,
                price: finalPrice,
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
            <Heart className={`w-4 h-4 ${isFavorite(id as any) ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className={viewMode === "list" ? "flex-1 py-1 sm:py-2 min-w-0" : "mt-4"}>
          <p className="text-sm text-white/70">{product.type || "Luxury"}</p>
          <Link to={`/product/${id}`}>
            <h3 className="font-semibold text-white hover:text-[#d4af37] transition-colors break-words line-clamp-2">
              {title}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
            {hasDiscount && (
              <span className="text-white/50 line-through text-sm">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-[#d4af37] font-bold">{formatPrice(finalPrice)}</span>
          </div>
          {viewMode === "list" && (
            <p className="text-sm text-white/70 mt-2 line-clamp-3">
              {product.description || "—"}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative overflow-x-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Header with title and controls */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-lg break-words">
              {selectedParent ? selectedParent.name : "Catalog"}
              {selectedChild ? ` • ${selectedChild.name}` : ""}
              {searchQuery && ` • Search: "${searchQuery}"`}
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
              showFilters
                ? "fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto"
                : "hidden"
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
                <Button variant="ghost" onClick={clearFilters} className="mb-6 text-white hover:text-[#d4af37]">
                  Clear all filters
                </Button>
              )}

              {/* Category Filter */}
              <FilterSection title="Category">
                {!catLoading && (
                  <>
                    <FilterItem
                      label="All Categories"
                      active={!filterCategorySlug}
                      onClick={() => handleCategoryChange(null, null)}
                    />
                    {parents.map((cat) => (
                      <div key={cat.id}>
                        <FilterItem
                          label={cat.name}
                          active={filterCategorySlug === cat.slug && !selectedChild}
                          onClick={() => handleCategoryChange(cat.slug, null)}
                        />
                        {filterCategorySlug === cat.slug && childrenMap.get(cat.slug)?.length ? (
                          <div className="ml-4 mt-1 space-y-1">
                            <FilterItem
                              label={`All ${cat.name}`}
                              active={!selectedChild}
                              onClick={() => handleCategoryChange(cat.slug, null)}
                            />
                            {childrenMap.get(cat.slug)!.map((child) => (
                              <FilterItem
                                key={child.id}
                                label={child.name}
                                active={selectedChild?.slug === child.slug}
                                onClick={() => handleCategoryChange(cat.slug, child.slug)}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </>
                )}
              </FilterSection>

              {/* Price Range Filter */}
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
                        setFilter("priceMin", String(range.min));
                        setFilter("priceMax", String(range.max));
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

          {/* Product Grid / List */}
          <div className="flex-1 min-w-0">
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
                {filteredProducts.map((product, index) => renderProductCard(product, index))}
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

const FilterItem = ({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon?: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? "bg-[#d4af37]/20 text-[#d4af37]" : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Catalog;