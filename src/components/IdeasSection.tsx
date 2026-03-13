import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ideasData } from "@/data/siteData";
import InteractiveHotspot from "./InteractiveHotspot";

const IdeasSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
      {/* Soft overlay to improve text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-center mb-12 text-white drop-shadow-lg">
          Need Ideas?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideasData.map((idea, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <img
                src={idea.image}
                alt={idea.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Hotspots */}
              {idea.hotspots.map((hotspot, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + idx * 0.15 }}
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

              {/* Label – gold gradient icon + dark glass background */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7a5a1e] to-[#d4af37] flex items-center justify-center shadow-md">
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-medium text-white drop-shadow-md">
                      {idea.title} →
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#7a5a1e] transition-all duration-300"
          >
            More Ideas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IdeasSection;