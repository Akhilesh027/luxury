import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { newProducts } from "@/data/siteData";

const NewProducts = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(newProducts.length / 4);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
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
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-16 lg:py-24 bg-charcoal">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold">
            New Products
          </h2>
          <div className="hidden md:flex gap-2">
            <Button variant="icon" size="icon" onClick={() => scroll("left")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button variant="icon" size="icon" onClick={() => scroll("right")}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {newProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-72 lg:w-80 snap-start group"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-secondary/20">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Discount Badge */}
                <span className="absolute top-3 left-3 bg-gold text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                  -{product.discount}%
                </span>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    favorites.includes(product.id)
                      ? "bg-gold text-primary-foreground"
                      : "bg-card/80 backdrop-blur-sm text-foreground hover:bg-gold hover:text-primary-foreground"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.includes(product.id) ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Color Options */}
              <div className="flex items-center gap-1.5 mt-4">
                {product.colors.slice(0, 4).map((color, idx) => (
                  <span
                    key={idx}
                    className="w-5 h-5 rounded-full border border-border/50 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="w-5 h-5 rounded-full bg-secondary/50 flex items-center justify-center text-xs text-muted-foreground">
                    +
                  </span>
                )}
              </div>

              {/* Product Info */}
              <p className="text-muted-foreground text-sm mt-3">{product.type}</p>
              <h4 className="text-lg font-semibold mt-1">{product.title}</h4>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-muted-foreground line-through text-sm">
                  {formatPrice(product.oldPrice)}
                </p>
                <p className="text-gold font-bold">{formatPrice(product.newPrice)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-8 text-sm font-medium">
          <span className="text-gold text-xl font-heading">
            {String(currentPage).padStart(2, "0")}
          </span>
          <div className="w-12 h-px bg-border" />
          <span className="text-muted-foreground">
            {String(totalPages).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default NewProducts;
