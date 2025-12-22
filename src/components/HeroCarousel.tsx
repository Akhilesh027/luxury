import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroSlides } from "@/data/siteData";
import InteractiveHotspot from "./InteractiveHotspot";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden bg-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={heroSlides[currentSlide].image}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          {/* Hotspots */}
          {heroSlides[currentSlide].hotspots.map((hotspot, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.2 }}
            >
              <InteractiveHotspot
                top={hotspot.top}
                left={hotspot.left}
                productId={hotspot.productId}
                productName={hotspot.productName}
                price={hotspot.price}
              />
            </motion.div>
          ))}

          {/* Info Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-20 lg:bottom-8 left-4 lg:left-8 right-4 lg:right-auto"
          >
            <div className="bg-card/90 backdrop-blur-xl rounded-xl p-4 lg:p-6 border border-gold/20 max-w-md shadow-elevated">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                </div>
                <p className="text-foreground font-medium">
                  {heroSlides[currentSlide].title} →
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <Button
        variant="icon"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/50 backdrop-blur-md border border-border/50 hover:bg-card"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="icon"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/50 backdrop-blur-md border border-border/50 hover:bg-card"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Pagination */}
      <div className="absolute bottom-8 right-4 lg:right-8 flex items-center gap-3 text-sm font-medium">
        <span className="text-gold text-xl font-heading">
          {String(currentSlide + 1).padStart(2, "0")}
        </span>
        <div className="w-12 h-px bg-border" />
        <span className="text-muted-foreground">
          {String(heroSlides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
};

export default HeroCarousel;
