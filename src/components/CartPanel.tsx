import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CartPanelProps {
  onClose: () => void;
}

const CartPanel = ({ onClose }: CartPanelProps) => {
  const cartItems = [
    {
      id: 1,
      name: "Blue Sofa",
      price: 34999,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=200",
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-20 right-4 w-80 bg-card/98 backdrop-blur-xl rounded-xl border border-border/50 shadow-elevated z-50 p-5"
    >
      <h3 className="text-gold font-heading font-semibold mb-4">Your Cart</h3>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-3 pb-4 border-b border-border/50">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-14 object-cover rounded-lg"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <p className="font-semibold text-sm">{formatPrice(item.price)}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <Button variant="outline" className="flex-1">
          View cart
        </Button>
        <Button variant="gold" className="flex-1">
          Checkout
        </Button>
      </div>
    </motion.div>
  );
};

export default CartPanel;
