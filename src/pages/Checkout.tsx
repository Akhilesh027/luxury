import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Truck, CheckCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shipping = totalPrice > 500000 ? 0 : 5000;
  const finalTotal = totalPrice + shipping;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
    clearCart();
    toast({
      title: "Order Placed Successfully!",
      description: "Thank you for your purchase. You will receive a confirmation email shortly.",
    });
  };

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [items.length, orderPlaced, navigate]);

  if (items.length === 0 && !orderPlaced) {
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-4">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been placed successfully and you will receive a confirmation email shortly.
            </p>
            <p className="text-lg font-medium mb-8">
              Order Total: <span className="text-gold">{formatPrice(finalTotal)}</span>
            </p>
            <Link to="/">
              <Button variant="gold" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <StepIndicator number={1} label="Shipping" active={step >= 1} completed={step > 1} />
          <div className="w-12 h-px bg-border" />
          <StepIndicator number={2} label="Payment" active={step >= 2} completed={step > 2} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-gold" />
                  <h2 className="text-2xl font-heading font-bold">Shipping Information</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="First Name"
                      value={shippingInfo.firstName}
                      onChange={(v) => setShippingInfo({ ...shippingInfo, firstName: v })}
                      required
                    />
                    <InputField
                      label="Last Name"
                      value={shippingInfo.lastName}
                      onChange={(v) => setShippingInfo({ ...shippingInfo, lastName: v })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(v) => setShippingInfo({ ...shippingInfo, email: v })}
                      required
                    />
                    <InputField
                      label="Phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(v) => setShippingInfo({ ...shippingInfo, phone: v })}
                      required
                    />
                  </div>
                  <InputField
                    label="Address"
                    value={shippingInfo.address}
                    onChange={(v) => setShippingInfo({ ...shippingInfo, address: v })}
                    required
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <InputField
                      label="City"
                      value={shippingInfo.city}
                      onChange={(v) => setShippingInfo({ ...shippingInfo, city: v })}
                      required
                    />
                    <InputField
                      label="State"
                      value={shippingInfo.state}
                      onChange={(v) => setShippingInfo({ ...shippingInfo, state: v })}
                      required
                    />
                    <InputField
                      label="PIN Code"
                      value={shippingInfo.pincode}
                      onChange={(v) => setShippingInfo({ ...shippingInfo, pincode: v })}
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Link to="/cart">
                      <Button variant="outline" type="button">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                      </Button>
                    </Link>
                    <Button variant="gold" type="submit" className="flex-1">
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-gold" />
                  <h2 className="text-2xl font-heading font-bold">Payment Information</h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <InputField
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChange={(v) => setPaymentInfo({ ...paymentInfo, cardNumber: v })}
                    required
                  />
                  <InputField
                    label="Cardholder Name"
                    value={paymentInfo.cardName}
                    onChange={(v) => setPaymentInfo({ ...paymentInfo, cardName: v })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={paymentInfo.expiry}
                      onChange={(v) => setPaymentInfo({ ...paymentInfo, expiry: v })}
                      required
                    />
                    <InputField
                      label="CVV"
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChange={(v) => setPaymentInfo({ ...paymentInfo, cvv: v })}
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" type="button" onClick={() => setStep(1)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button variant="gold" type="submit" className="flex-1">
                      Place Order - {formatPrice(finalTotal)}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border/50 p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const StepIndicator = ({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
        completed
          ? "bg-emerald-500 text-white"
          : active
          ? "bg-gold text-primary-foreground"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      {completed ? <CheckCircle className="w-5 h-5" /> : number}
    </div>
    <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
  </div>
);

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-3 bg-secondary/30 border border-border/50 rounded-lg outline-none focus:border-gold transition-colors"
    />
  </div>
);

export default Checkout;
