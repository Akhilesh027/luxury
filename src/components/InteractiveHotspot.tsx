import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HotspotProps {
  top: string;
  left: string;
  productId: number;
  productName: string;
  price: number;
}

const InteractiveHotspot = ({ top, left, productId, productName, price }: HotspotProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"right" | "left">("right");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const handleClick = () => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.closest(".relative, [style*='position']");
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const hotspotRect = containerRef.current.getBoundingClientRect();
        const hotspotCenterX = hotspotRect.left + hotspotRect.width / 2;
        const parentCenterX = parentRect.left + parentRect.width / 2;

        if (hotspotCenterX > parentCenterX) {
          setTooltipPosition("left");
        } else {
          setTooltipPosition("right");
        }
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute group cursor-pointer z-20"
      style={{ top, left }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Outer ring animation – using lighter gold */}
      <motion.div
        className="absolute -inset-3 rounded-full border border-[#d4af37]/40"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main dot – gradient from dark gold to light gold */}
      <motion.div
        className="relative w-4 h-4 rounded-full bg-gradient-to-br from-[#7a5a1e] to-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.6)] z-10"
        whileHover={{ scale: 1.3 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {/* Inner glow */}
        <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
      </motion.div>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: tooltipPosition === "right" ? -10 : 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: tooltipPosition === "right" ? -10 : 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute top-1/2 -translate-y-1/2 z-50 min-w-48 ${
              tooltipPosition === "right" ? "left-8" : "right-8"
            }`}
          >
            {/* Connector line – gradient based on tooltip position */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-px bg-gradient-to-r ${
                tooltipPosition === "right"
                  ? "left-0 -translate-x-full from-transparent to-[#d4af37]/60"
                  : "right-0 translate-x-full from-[#d4af37]/60 to-transparent"
              }`}
            />

            {/* Content card – dark background with gold border */}
            <div className="bg-black/95 backdrop-blur-xl rounded-lg border border-[#d4af37]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(212,175,55,0.1)] overflow-hidden">
              {/* Gold accent line */}
              <div className="h-0.5 bg-gradient-to-r from-[#7a5a1e] to-[#d4af37]" />

              <div className="p-4">
                <h4 className="font-heading text-sm font-semibold text-white tracking-wide leading-tight">
                  {productName}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[#d4af37] font-bold text-lg">{formatPrice(price)}</p>
                  <div className="flex items-center gap-1 text-xs text-white/60 group-hover:text-[#d4af37] transition-colors">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveHotspot;