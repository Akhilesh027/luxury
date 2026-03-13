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
    id?: string;
    couponId?: string;
    code: string;
    type: "percentage" | "flat" | "free_shipping";
    value: number;
    maxDiscount?: number;
    minOrder?: number;
    website?: string;
    applyTo?: "all_categories" | "selected_categories";
    categories?: Array<{
      id?: string;
      name?: string;
      slug?: string;
    }>;
  };
  discount?: number;
  shippingDiscount?: number;
};

const LS_COUPON_KEY = `${WEBSITE}_coupon`;
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
  const { items, updateQuantity, removeItem, totalPrice, clearCart, totalItems } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const shippingBase = totalPrice > 500000 ? 0 : totalPrice === 0 ? 0 : 5000;

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState<ApplyCouponResponse["coupon"] | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  const shipping = Math.max(0, shippingBase - shippingDiscount);
  const finalTotal = Math.max(0, totalPrice - discount) + shipping;

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

  // ✅ rich item payload for selected-category coupons
  const buildCouponItemsPayload = () => {
    return items.map((item: any) => {
      const qty = Number(item?.quantity || 1);

      const unitPrice = Number(
        item?.price ??
          item?.product?.price ??
          item?.productSnapshot?.afterDiscount ??
          item?.productSnapshot?.finalPrice ??
          item?.productSnapshot?.salesPrice ??
          item?.productSnapshot?.price ??
          0
      );

      return {
        productId: item?.id || item?.productId || item?.product?.id || item?.product?._id,
        quantity: qty,
        price: unitPrice,
        lineTotal: unitPrice * qty,

        categoryId:
          item?.categoryId ||
          item?.product?.categoryId ||
          item?.productSnapshot?.categoryId ||
          item?.product?.subcategoryId ||
          item?.productSnapshot?.subcategoryId ||
          (typeof item?.product?.category === "object"
            ? item?.product?.category?._id || item?.product?.category?.id
            : undefined) ||
          (typeof item?.productSnapshot?.category === "object"
            ? item?.productSnapshot?.category?._id || item?.productSnapshot?.category?.id
            : undefined) ||
          (typeof item?.product?.subcategory === "object"
            ? item?.product?.subcategory?._id || item?.product?.subcategory?.id
            : undefined) ||
          (typeof item?.productSnapshot?.subcategory === "object"
            ? item?.productSnapshot?.subcategory?._id || item?.productSnapshot?.subcategory?.id
            : undefined) ||
          (typeof item?.product?.category === "string" ? item?.product?.category : undefined) ||
          (typeof item?.productSnapshot?.category === "string"
            ? item?.productSnapshot?.category
            : undefined) ||
          (typeof item?.product?.subcategory === "string"
            ? item?.product?.subcategory
            : undefined) ||
          (typeof item?.productSnapshot?.subcategory === "string"
            ? item?.productSnapshot?.subcategory
            : undefined),

        category:
          item?.product?.category ??
          item?.productSnapshot?.category ??
          undefined,

        subcategoryId:
          item?.product?.subcategoryId ||
          item?.productSnapshot?.subcategoryId ||
          (typeof item?.product?.subcategory === "object"
            ? item?.product?.subcategory?._id || item?.product?.subcategory?.id
            : undefined) ||
          (typeof item?.productSnapshot?.subcategory === "object"
            ? item?.productSnapshot?.subcategory?._id || item?.productSnapshot?.subcategory?.id
            : undefined),

        subcategory:
          item?.product?.subcategory ??
          item?.productSnapshot?.subcategory ??
          undefined,

        product: {
          categoryId:
            item?.product?.categoryId ||
            item?.productSnapshot?.categoryId ||
            (typeof item?.product?.category === "object"
              ? item?.product?.category?._id || item?.product?.category?.id
              : undefined) ||
            (typeof item?.productSnapshot?.category === "object"
              ? item?.productSnapshot?.category?._id || item?.productSnapshot?.category?.id
              : undefined),
          category: item?.product?.category ?? item?.productSnapshot?.category,
          subcategoryId:
            item?.product?.subcategoryId ||
            item?.productSnapshot?.subcategoryId ||
            (typeof item?.product?.subcategory === "object"
              ? item?.product?.subcategory?._id || item?.product?.subcategory?.id
              : undefined) ||
            (typeof item?.productSnapshot?.subcategory === "object"
              ? item?.productSnapshot?.subcategory?._id || item?.productSnapshot?.subcategory?.id
              : undefined),
          subcategory: item?.product?.subcategory ?? item?.productSnapshot?.subcategory,
          price: unitPrice,
        },

        productSnapshot: {
          categoryId: item?.productSnapshot?.categoryId,
          category: item?.productSnapshot?.category,
          subcategoryId: item?.productSnapshot?.subcategoryId,
          subcategory: item?.productSnapshot?.subcategory,
          price: item?.productSnapshot?.price,
          finalPrice: item?.productSnapshot?.finalPrice,
          afterDiscount: item?.productSnapshot?.afterDiscount,
        },
      };
    });
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

      const res = await apiFetch("/coupons/apply", {
        method: "POST",
        body: JSON.stringify({
          code,
          cartTotal: Number(totalPrice) || 0,
          shipping: Number(shippingBase) || 0,
          userId: userId || undefined,
          items: buildCouponItemsPayload(), // ✅ required for category coupons
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

      const data: ApplyCouponResponse = json?.data || json;
      const ok = data?.success === true || data?.valid === true || !!data?.coupon;

      if (!ok) {
        setCouponApplied(null);
        setDiscount(0);
        setShippingDiscount(0);
        clearCouponPersisted();
        if (!silent) toast.error(data?.message || "Invalid coupon");
        return;
      }

      const normalizedCoupon = data?.coupon
        ? {
            couponId: data.coupon.couponId || data.coupon.id,
            id: data.coupon.id,
            code: data.coupon.code,
            type: data.coupon.type,
            value: data.coupon.value,
            maxDiscount: data.coupon.maxDiscount,
            minOrder: data.coupon.minOrder,
            website: data.coupon.website,
            applyTo: data.coupon.applyTo,
            categories: data.coupon.categories || [],
          }
        : null;

      const d = Number(data.discount || 0);
      const sd = Number(data.shippingDiscount || 0);

      setCouponApplied(normalizedCoupon);
      setDiscount(d);
      setShippingDiscount(sd);

      persistCoupon({
        code: normalizedCoupon?.code || code,
        coupon: normalizedCoupon,
        discount: d,
        shippingDiscount: sd,
      });

      if (!silent) toast.success(`Coupon applied: ${normalizedCoupon?.code || code}`);
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

  useEffect(() => {
    if (!couponApplied?.code) return;
    applyCouponInternal(couponApplied.code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrice, shippingBase, items.length]);

  const goToCheckout = () => {
    const payload = {
      coupon: couponApplied
        ? {
            couponId: couponApplied.couponId || couponApplied.id,
            id: couponApplied.id,
            code: couponApplied.code,
            type: couponApplied.type,
            value: couponApplied.value,
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

    navigate("/checkout", { state: payload });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
        <Header />
        <main className="container mx-auto px-4 py-20 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ShoppingBag className="w-20 h-20 text-white/50 mx-auto mb-6" />
            <h1 className="text-3xl font-heading font-bold text-white drop-shadow-lg mb-4">
              Your cart is empty
            </h1>
            <p className="text-white/80 mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link to="/catalog">
              <Button
                className="bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
                size="lg"
              >
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
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
      {/* Soft overlay for contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-lg">
              Shopping Cart
            </h1>
            <p className="text-sm text-white/80 mt-1">
              {totalItems} item{totalItems > 1 ? "s" : ""} in your cart
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              clearCart();
              handleRemoveCoupon();
            }}
            className="text-white/80 hover:text-white w-fit"
          >
            Clear Cart
          </Button>
        </div>

        {/* Secure checkout panel */}
        <div className="mb-6 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#d4af37] mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-white">Secure checkout & luxury-grade packaging</p>
            <p className="text-white/70">
              Free delivery over {formatPrice(500000)} • Easy returns • 2-year warranty (where applicable)
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any, index: number) => (
              <motion.div
                key={`${item.id}::${item.color || ""}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20"
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
                      className="font-semibold text-white hover:text-[#d4af37] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>

                    {item.color ? (
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-white/70">{item.color}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-white/70 mt-2">Standard finish</p>
                    )}

                    <p className="text-xs text-white/50 mt-2">
                      Unit price: {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.color)}
                        className="text-white/70 hover:text-white"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-7 text-center font-medium text-white">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.color)}
                        className="text-white/70 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.color)}
                      className="text-white/70 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-[#d4af37]">{formatPrice(item.price * item.quantity)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-white/50 mt-1">{formatPrice(item.price)} each</p>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Coupon section */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    placeholder="Enter coupon code"
                    className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-white/50 focus-visible:ring-[#d4af37]"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponLoading}
                  />
                </div>

                {!couponApplied ? (
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="border-white text-white hover:bg-white hover:text-[#7a5a1e]"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleRemoveCoupon}
                    className="border-white text-white hover:bg-white hover:text-[#7a5a1e] gap-2"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>

              {couponApplied ? (
                <div className="mt-2 text-xs text-white/70">
                  Applied:{" "}
                  <span className="font-semibold text-[#d4af37]">{couponApplied.code}</span>
                  {discount > 0 ? (
                    <span className="ml-2 text-emerald-500">(-{formatPrice(discount)})</span>
                  ) : null}
                  {shippingDiscount > 0 ? (
                    <span className="ml-2 text-emerald-500">
                      (-{formatPrice(shippingDiscount)} shipping)
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 border-b border-white/10 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-white/70">Subtotal</span>
                  <span className="text-white">{formatPrice(totalPrice)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Shipping Discount</span>
                    <span>-{formatPrice(shippingDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-white/70">Shipping</span>
                  <span className="text-white">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>

                {shippingBase === 0 ? (
                  <p className="text-xs text-emerald-500">🎉 You qualify for free shipping!</p>
                ) : (
                  <p className="text-xs text-white/50">
                    Add {formatPrice(Math.max(0, 500000 - totalPrice))} more for free shipping.
                  </p>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold mb-6">
                <span className="text-white">Total</span>
                <span className="text-[#d4af37]">{formatPrice(finalTotal)}</span>
              </div>

              <Button
                className="w-full bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
                size="lg"
                onClick={goToCheckout}
                disabled={couponLoading}
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Link to="/catalog">
                <Button variant="ghost" className="w-full mt-3 text-white/70 hover:text-white">
                  Continue Shopping
                </Button>
              </Link>

              <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm font-medium text-white">Need help?</p>
                <p className="text-xs text-white/70 mt-1">
                  Our concierge can assist with sizing, materials, and delivery scheduling.
                </p>
                <Button
                  variant="outline"
                  className="w-full mt-3 border-white text-white hover:bg-white hover:text-[#7a5a1e]"
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