import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartPanelProps {
  onClose: () => void;
}

const CartPanel = ({ onClose }: CartPanelProps) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gold font-heading font-semibold">
          Your Cart {totalItems > 0 ? `(${totalItems})` : ""}
        </h3>

        <button
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty</p>
          <Button variant="gold-outline" className="mt-4" onClick={onClose}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-72 overflow-auto pr-1">
            {items.map((item) => (
              <div
                key={`${item.id}::${item.color || ""}`}
                className="flex gap-3 pb-4 border-b border-border/50"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-14 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <p className="font-semibold text-sm line-clamp-1">
                    {item.name}
                  </p>

                  {!!item.color && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Color: {item.color}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPrice(item.price)} each
                  </p>

                  {/* Qty controls */}
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1, item.color)
                      }
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <span className="text-sm w-6 text-center">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1, item.color)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 ml-auto"
                      onClick={() => removeItem(item.id, item.color)}
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="font-semibold text-sm whitespace-nowrap">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{formatPrice(totalPrice)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <Link to="/cart" className="flex-1" onClick={onClose}>
              <Button variant="outline" className="w-full">
                View Cart
              </Button>
            </Link>

            <Link to="/checkout" className="flex-1" onClick={onClose}>
              <Button variant="gold" className="w-full">
                Checkout
              </Button>
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CartPanel;
