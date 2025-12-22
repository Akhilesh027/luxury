import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X, Heart, ChevronDown, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { allProducts, filterOptions } from "@/data/siteData";
import { useFavorites } from "@/contexts/FavoritesContext";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { isFavorite, toggleFavorite } = useFavorites();

  // Get active filters from URL
  const activeCategory = searchParams.get("category");
  const activeRoom = searchParams.get("room");
  const activeMaterial = searchParams.get("material");
  const activeStyle = searchParams.get("style");
  const activePriceMin = searchParams.get("priceMin");
  const activePriceMax = searchParams.get("priceMax");

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (activeRoom) {
      result = result.filter((p) => p.room === activeRoom);
    }
    if (activeMaterial) {
      result = result.filter((p) => p.material === activeMaterial);
    }
    if (activeStyle) {
      result = result.filter((p) => p.style === activeStyle);
    }
    if (activePriceMin && activePriceMax) {
      const min = Number(activePriceMin);
      const max = Number(activePriceMax);
      result = result.filter((p) => p.newPrice >= min && p.newPrice <= max);
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.newPrice - b.newPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.newPrice - a.newPrice);
        break;
      case "discount":
        result.sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }

    return result;
  }, [activeCategory, activeRoom, activeMaterial, activeStyle, activePriceMin, activePriceMax, sortBy]);

  const setFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasActiveFilters = activeCategory || activeRoom || activeMaterial || activeStyle || activePriceMin;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold">Catalog</h1>
            <p className="text-muted-foreground mt-1">{filteredProducts.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="icon"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "text-gold" : ""}
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "text-gold" : ""}
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? "fixed inset-0 z-50 bg-background p-6" : "hidden"
            } lg:block lg:relative lg:w-64 lg:flex-shrink-0`}
          >
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

            {/* Category Filter */}
            <FilterSection title="Category">
              {filterOptions.categories.map((cat) => (
                <FilterItem
                  key={cat.value}
                  label={cat.label}
                  active={activeCategory === cat.value}
                  onClick={() => setFilter("category", activeCategory === cat.value ? null : cat.value)}
                />
              ))}
            </FilterSection>

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

            <Button
              variant="gold"
              className="w-full mt-6 lg:hidden"
              onClick={() => setShowFilters(false)}
            >
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

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">No products found</p>
                <Button variant="gold-outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative ${viewMode === "list" ? "flex gap-6" : ""}`}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className={`relative overflow-hidden rounded-xl bg-secondary/20 block ${
                        viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "aspect-square"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {product.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-gold text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                          -{product.discount}%
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite({
                          id: product.id,
                          name: product.title,
                          price: product.newPrice,
                          image: product.image,
                          type: product.type,
                        });
                      }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-10 ${
                        isFavorite(product.id)
                          ? "bg-gold text-primary-foreground"
                          : "bg-card/80 backdrop-blur-sm hover:bg-gold hover:text-primary-foreground"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isFavorite(product.id) ? "fill-current" : ""}`}
                      />
                    </button>

                    <div className={viewMode === "list" ? "flex-1 py-2" : "mt-4"}>
                      <div className="flex gap-1 mb-2">
                        {product.colors.slice(0, 4).map((color, idx) => (
                          <span
                            key={idx}
                            className="w-4 h-4 rounded-full border border-border/50"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.type}</p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold hover:text-gold transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-muted-foreground line-through text-sm">
                          {formatPrice(product.oldPrice)}
                        </span>
                        <span className="text-gold font-bold">{formatPrice(product.newPrice)}</span>
                      </div>
                      {viewMode === "list" && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 font-medium"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
      active ? "bg-gold/20 text-gold" : "hover:bg-secondary/50 text-muted-foreground"
    }`}
  >
    {label}
  </button>
);

export default Catalog;
