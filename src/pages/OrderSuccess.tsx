import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const OrderSuccess = () => {
  const location = useLocation();

  // data passed from checkout
  const orderNumber = location.state?.orderNumber;
  const total = location.state?.total;

  const formatPrice = (price?: number) =>
    price
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(price)
      : "";

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
      {/* Soft overlay for text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <Header />

      <main className="container mx-auto px-4 py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="text-3xl font-heading font-bold text-white drop-shadow-lg mb-3">
            Order Placed Successfully
          </h1>

          <p className="text-white/80 mb-6">
            Thank you for shopping with us. Your order has been confirmed.
          </p>

          {orderNumber && (
            <p className="text-sm text-white/80 mb-2">
              Order ID:{" "}
              <span className="font-semibold ">{orderNumber}</span>
            </p>
          )}

          {total && (
            <p className="text-lg font-medium text-white/80 mb-8">
              Total Paid:{" "}
              <span className="font-bold">{formatPrice(total)}</span>
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Link to="/orders">
              <Button
                className="w-full bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
                size="lg"
              >
                View My Orders
              </Button>
            </Link>

            <Link to="/">
              <Button
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-[#7a5a1e]"
                size="lg"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;