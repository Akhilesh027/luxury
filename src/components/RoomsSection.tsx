import { motion } from "framer-motion";
import { roomsData } from "@/data/siteData";

const RoomsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
      {/* Soft overlay to improve text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-center mb-12 text-white drop-shadow-lg">
          Choose a Room
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {roomsData.map((room, index) => (
            <motion.div
              key={room.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-xl cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300"
              style={{
                aspectRatio: index % 3 === 0 ? "16/10" : "4/3",
              }}
            >
              <img
                src={room.image}
                alt={room.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-300" />

              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-flex items-center gap-2 text-lg font-heading font-semibold text-white group-hover:text-[#d4af37] transition-colors duration-300 drop-shadow-md">
                  {room.title}
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    className="text-[#d4af37]"
                  >
                    →
                  </motion.span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;