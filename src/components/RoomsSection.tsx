import { motion } from "framer-motion";
import { roomsData } from "@/data/siteData";

const RoomsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-charcoal">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-center mb-12">
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
              className="group relative overflow-hidden rounded-xl cursor-pointer"
              style={{
                aspectRatio: index % 3 === 0 ? "16/10" : "4/3",
              }}
            >
              <img
                src={room.image}
                alt={room.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent group-hover:from-background/80 transition-all duration-300" />

              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-flex items-center gap-2 text-lg font-heading font-semibold group-hover:text-gold transition-colors duration-300">
                  {room.title}
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    className="text-gold"
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
