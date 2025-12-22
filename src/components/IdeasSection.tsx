import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ideasData } from "@/data/siteData";
import InteractiveHotspot from "./InteractiveHotspot";

const IdeasSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-center mb-12">
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
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
            >
              <img
                src={idea.image}
                alt={idea.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

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

              {/* Label */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-card/80 backdrop-blur-xl rounded-xl p-4 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-gold" />
                    </div>
                    <p className="text-sm font-medium flex-1">
                      {idea.title} →
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="gold-outline" size="lg">
            More Ideas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IdeasSection;
