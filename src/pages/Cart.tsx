import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

/**
 * ✅ Adjust these if needed
 * - WEBSITE drives API segment and coupon localStorage key
 * - token key should match your auth storage
 */
const WEBSITE: "affordable" | "midrange" | "luxury" = "luxury";
const API_BASE = `https://api.jsgallor.com/api/${WEBSITE}`;

function getToken() {
  // ✅ change if your luxury token key differs
  return localStorage.getItem("luxury_token");
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: any = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

type ApplyCouponResponse = {
  success?: boolean;
  valid?: boolean;
  message?: string;
  coupon?: {
    id?: string; // backend returns id (in your controller)
    couponId?: string; // some versions return couponId
    code: string;
    type: "percentage" | "flat" | "free_shipping";
    value: number;
    maxDiscount?: number;
    minOrder?: number;
    website?: string;
  };
  discount?: number;
  shippingDiscount?: number;
};

const LS_COUPON_KEY = `${WEBSITE}_coupon`;

// If your backend uses perUserLimit, you must send userId.
// Update this to match how you store user.
const LS_USER_KEY = `${WEBSITE}_user`;
function getSavedUserId(): string | null {
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id ? String(u.id) : u?._id ? String(u._id) : null;
  } catch {
    return null;
  }
}

const Cart = () => {
  const navigate = useNavigate();

  // ✅ CartContext updated version uses (id: string, qty: number, color?: string)
  const { items, updateQuantity, removeItem, totalPrice, clearCart, totalItems } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  // ✅ Luxury shipping rule (you can change)
  const shippingBase = totalPrice > 500000 ? 0 : totalPrice === 0 ? 0 : 5000;

  // ✅ Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState<ApplyCouponResponse["coupon"] | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  // ✅ derived
  const shipping = Math.max(0, shippingBase - shippingDiscount);
  const finalTotal = Math.max(0, totalPrice - discount) + shipping;

  // ✅ restore coupon after refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_COUPON_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setCouponCode(parsed?.code || "");
      setCouponApplied(parsed?.coupon || null);
      setDiscount(Number(parsed?.discount || 0));
      setShippingDiscount(Number(parsed?.shippingDiscount || 0));
    } catch {
      // ignore
    }
  }, []);

  const persistCoupon = (payload: {
    code: string;
    coupon: any;
    discount: number;
    shippingDiscount: number;
  }) => {
    localStorage.setItem(LS_COUPON_KEY, JSON.stringify(payload));
  };

  const clearCouponPersisted = () => {
    localStorage.removeItem(LS_COUPON_KEY);
  };

  const applyCouponInternal = async (codeRaw: string, silent = false) => {
    const code = codeRaw.trim().toUpperCase();
    if (!code) {
      if (!silent) toast.error("Enter coupon code");
      return;
    }
    if (items.length === 0) {
      if (!silent) toast.error("Cart is empty");
      return;
    }

    try {
      setCouponLoading(true);

      const userId = getSavedUserId();

      // ✅ IMPORTANT: Your backend applyCoupon expects { code, cartTotal, shipping, userId }
      const res = await apiFetch("/coupons/apply", {
        method: "POST",
        body: JSON.stringify({
          code,
          cartTotal: Number(totalPrice) || 0, // ✅ items subtotal only
          shipping: Number(shippingBase) || 0, // ✅ important for free_shipping coupons
          userId: userId || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setCouponApplied(null);
        setDiscount(0);
        setShippingDiscount(0);
        clearCouponPersisted();
        if (!silent) toast.error(json?.message || "Invalid coupon");
        return;
      }

      // backend response shape: { success: true, coupon: {...}, discount, shippingDiscount }
      const data: ApplyCouponResponse = json?.data || json;

      // normalize validity
      const ok = data?.success === true || data?.valid === true || !!data?.coupon;
      if (!ok) {
        setCouponApplied(null);
        setDiscount(0);
        setShippingDiscount(0);
        clearCouponPersisted();
        if (!silent) toast.error(data?.message || "Invalid coupon");
        return;
      }

      const d = Number(data.discount || 0);
      const sd = Number(data.shippingDiscount || 0);

      setCouponApplied(data.coupon || null);
      setDiscount(d);
      setShippingDiscount(sd);

      persistCoupon({
        code: data?.coupon?.code || code,
        coupon: data.coupon || null,
        discount: d,
        shippingDiscount: sd,
      });

      if (!silent) toast.success(`Coupon applied: ${data?.coupon?.code || code}`);
    } catch (e: any) {
      if (!silent) toast.error(e?.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    await applyCouponInternal(couponCode, false);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(null);
    setDiscount(0);
    setShippingDiscount(0);
    clearCouponPersisted();
    toast.message("Coupon removed");
  };

  // ✅ when cart changes (qty +/-), silently re-check coupon so discount stays correct
  useEffect(() => {
    if (!couponApplied?.code) return;
    applyCouponInternal(couponApplied.code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice, shippingBase]);

  // ✅ checkout navigation (pass coupon + amounts)
  const goToCheckout = () => {
    const payload = {
      coupon: couponApplied
        ? {
            // backend sometimes returns id or couponId
            couponId: couponApplied.couponId || couponApplied.id,
            code: couponApplied.code,
          }
        : couponCode.trim()
          ? { code: couponCode.trim().toUpperCase() }
          : undefined,
      pricing: {
        subtotal: totalPrice,
        discount,
        shippingBase,
        shippingDiscount,
        shipping,
        total: finalTotal,
      },
    };

    // Option A: location.state (best if you don't want URL params)
    navigate("/checkout", { state: payload });

    // Option B (fallback): store in localStorage so refresh keeps it
    // localStorage.setItem(`${WEBSITE}_checkout_pricing`, JSON.stringify(payload));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-heading font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link to="/catalog">
              <Button variant="gold" size="lg">
                Start Shopping
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems} item{totalItems > 1 ? "s" : ""} in your cart
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              clearCart();
              handleRemoveCoupon();
            }}
            className="text-muted-foreground w-fit"
          >
            Clear Cart
          </Button>
        </div>

        {/* Trust strip */}
        <div className="mb-6 rounded-xl border border-border/50 bg-secondary/20 p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-gold mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Secure checkout & luxury-grade packaging</p>
            <p className="text-muted-foreground">
              Free delivery over {formatPrice(500000)} • Easy returns • 2-year warranty (where applicable)
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.id}::${item.color || ""}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border/50"
              >
                <Link to={`/product/${item.id}`} className="w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold hover:text-gold transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>

                    {/* Color optional */}
                    {item.color ? (
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="w-4 h-4 rounded-full border border-border/50"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.color}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">Standard finish</p>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      Unit price: {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.color)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-7 text-center font-medium">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.color)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove item"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gold">{formatPrice(item.price * item.quantity)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">{formatPrice(item.price)} each</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* ✅ Coupon box */}
            <div className="bg-card rounded-xl border border-border/50 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter coupon code"
                    className="bg-secondary pl-9"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponLoading}
                  />
                </div>

                {!couponApplied ? (
                  <Button variant="outline" onClick={handleApplyCoupon} disabled={couponLoading}>
                    {couponLoading ? "Applying..." : "Apply"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleRemoveCoupon} className="gap-2">
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>

              {couponApplied ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  Applied:{" "}
                  <span className="font-semibold text-foreground">{couponApplied.code}</span>
                  {discount > 0 ? (
                    <span className="ml-2 text-emerald-500">(-{formatPrice(discount)})</span>
                  ) : null}
                  {shippingDiscount > 0 ? (
                    <span className="ml-2 text-emerald-500">(-{formatPrice(shippingDiscount)} shipping)</span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border/50 p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 border-b border-border/50 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>

                {shippingBase === 0 ? (
                  <p className="text-xs text-emerald-500">🎉 You qualify for free shipping!</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Add {formatPrice(Math.max(0, 500000 - totalPrice))} more for free shipping.
                  </p>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span className="text-gold">{formatPrice(finalTotal)}</span>
              </div>

              {/* ✅ Navigate with applied coupon + amounts */}
              <Button
                variant="gold"
                className="w-full"
                size="lg"
                onClick={goToCheckout}
                disabled={couponLoading}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Link to="/catalog">
                <Button variant="ghost" className="w-full mt-3">
                  Continue Shopping
                </Button>
              </Link>

              {/* Extra content */}
              <div className="mt-6 rounded-xl bg-secondary/20 border border-border/40 p-4">
                <p className="text-sm font-medium">Need help?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Our concierge can assist with sizing, materials, and delivery scheduling.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => alert("Concierge request flow")}
                >
                  Contact Concierge
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
