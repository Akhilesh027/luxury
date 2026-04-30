import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-[#af8e36] text-white">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Heart className="w-20 h-20 text-white/70 mx-auto mb-6" />
            <h1 className="text-3xl font-heading font-bold mb-4">No favorites yet</h1>
            <p className="text-white/80 mb-8">
              Start adding products to your wishlist to save them for later.
            </p>
            <Link to="/catalog">
              <Button variant="gold" size="lg">
                Explore Products
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#af8e36] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl lg:text-4xl font-heading font-bold mb-8 text-white">
          My Favorites ({favorites.length})
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-white/10 mb-4">
                <Link to={`/product/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-white/80">{item.type}</p>
              <Link to={`/product/${item.id}`}>
                <h3 className="font-semibold hover:text-gold transition-colors text-white">
                  {item.name}
                </h3>
              </Link>
              <p className="text-white font-bold mt-1">{formatPrice(item.price)}</p>

              
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;