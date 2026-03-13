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
    <section className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden bg-[#1f160d]">
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

          {/* Luxury overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b]/95 via-[#2a1d10]/35 to-transparent" />
          <div className="absolute inset-0 bg-black/20" />

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
            <div className="max-w-md rounded-2xl border border-[#d4af37]/25 bg-[#2a1d10]/70 p-4 lg:p-6 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/15">
                  <ShoppingBag className="h-5 w-5 text-[#f1d27a]" />
                </div>
                <p className="font-medium text-[#f8f3e7] text-base lg:text-lg tracking-wide">
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
        className="absolute left-4 top-1/2 -translate-y-1/2 border border-[#d4af37]/25 bg-[#2a1d10]/55 text-[#f8f3e7] backdrop-blur-md hover:bg-[#3b2a12]/80 hover:text-[#ffd76a]"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="icon"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 border border-[#d4af37]/25 bg-[#2a1d10]/55 text-[#f8f3e7] backdrop-blur-md hover:bg-[#3b2a12]/80 hover:text-[#ffd76a]"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Pagination */}
      <div className="absolute bottom-8 right-4 lg:right-8 flex items-center gap-3 text-sm font-medium">
        <span className="text-[#f1d27a] text-xl font-semibold tracking-wider">
          {String(currentSlide + 1).padStart(2, "0")}
        </span>
        <div className="h-px w-12 bg-[#d4af37]/40" />
        <span className="text-[#f8f3e7]/70">
          {String(heroSlides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
};

export default HeroCarousel;