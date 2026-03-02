// src/pages/Checkout.tsx (LUXURY)
// ✅ UPDATED with Razorpay (REAL online flow) + COD
// ✅ Flow (same as your midrange):
//    1) COD: POST /api/luxury/orders
//    2) ONLINE (Razorpay):
//        - POST /api/luxury/payments/create-order   { amount, currency, receipt, notes }
//        - open Razorpay checkout
//        - POST /api/luxury/payments/verify         { razorpay_order_id, razorpay_payment_id, razorpay_signature }
//        - POST /api/luxury/orders  (send payment proof + coupon)
// ✅ Coupon: sent to backend; backend MUST verify + redeem in server truth.

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard,
  Truck,
  CheckCircle,
  ChevronLeft,
  Plus,
  Pencil,
  Banknote,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

const API_BASE = "https://api.jsgallor.com/api";
const TOKEN_KEY = "luxury_auth_token";
const LS_COUPON_KEY = "luxury_coupon";

type Address = {
  _id: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;

  isDefault?: boolean;
};

// ✅ Now only COD + RAZORPAY (real)
type PaymentMethod = "cod" | "razorpay";

type CheckoutCoupon = {
  couponId?: string;
  code: string;
};

type CheckoutPricing = {
  subtotal: number;
  discount?: number;
  shippingBase?: number;
  shippingDiscount?: number;
  shipping?: number;
  total: number;
};

type CheckoutState = {
  coupon?: CheckoutCoupon;
  pricing?: CheckoutPricing;
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || json?.error || `Request failed (${res.status})`);
  return json;
}

function asAddressList(json: any): Address[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.addresses)) return json.addresses;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  if (json?.address && typeof json.address === "object") return [json.address];
  return [];
}

function readPersistedCoupon(): CheckoutState | null {
  try {
    const raw = localStorage.getItem(LS_COUPON_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    const code = String(parsed?.coupon?.code || parsed?.code || parsed?.couponCode || "").trim();
    if (!code) return null;

    const couponObj = parsed?.coupon || {};
    const pricingObj = parsed?.pricing || {};

    return {
      coupon: { code, couponId: couponObj?.couponId || couponObj?.id || parsed?.couponId },
      pricing: {
        subtotal: Number(pricingObj?.subtotal ?? parsed?.subtotal ?? 0),
        discount: Number(pricingObj?.discount ?? parsed?.discount ?? 0),
        shippingDiscount: Number(pricingObj?.shippingDiscount ?? parsed?.shippingDiscount ?? 0),
        total: Number(pricingObj?.total ?? parsed?.total ?? 0),
      },
    };
  } catch {
    return null;
  }
}

// -----------------------------
// Razorpay loader + typings
// -----------------------------
declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);

    const id = "razorpay-checkout-js";
    if (document.getElementById(id)) return resolve(true);

    const script = document.createElement("script");
    script.id = id;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<1 | 2>(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Address
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Add/Edit modal
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    label: "Home",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  // ✅ Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<CheckoutCoupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  // Luxury shipping rule
  const shippingBase = totalPrice > 500000 ? 0 : totalPrice === 0 ? 0 : 5000;
  const shipping = Math.max(0, shippingBase - shippingDiscount);
  const finalTotal = Math.max(0, totalPrice - discount) + shipping;

  // Auth guard
  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Login required",
        description: "Please login to continue checkout.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate coupon from nav state or localStorage
  useEffect(() => {
    const state = (location.state || null) as CheckoutState | null;
    const fallback = readPersistedCoupon();

    const coupon = state?.coupon || fallback?.coupon || null;
    const pricing = state?.pricing || fallback?.pricing || null;

    if (coupon?.code) setAppliedCoupon({ code: coupon.code, couponId: coupon.couponId });

    if (pricing) {
      setDiscount(Number(pricing.discount || 0));
      setShippingDiscount(Number(pricing.shippingDiscount || 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) navigate("/cart");
  }, [items.length, orderPlaced, navigate]);

  // Load addresses
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await apiFetch("/luxury/addresses", { method: "GET" });
      const list = asAddressList(data);
      setAddresses(list);

      const def = list.find((a) => a.isDefault);
      if (def?._id) setSelectedAddressId(def._id);
      else if (list[0]?._id) setSelectedAddressId(list[0]._id);
      else setSelectedAddressId("");
    } catch (err) {
      toast({
        title: "Failed to load addresses",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  // Add/Edit open
  const openAddAddress = () => {
    setEditing(null);
    setAddressForm({
      label: "Home",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      isDefault: addresses.length === 0,
    });
    setShowAddressForm(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditing(addr);
    setAddressForm({
      label: addr.label || "Home",
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      email: addr.email || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      isDefault: !!addr.isDefault,
    });
    setShowAddressForm(true);
  };

  const validateAddress = () => {
    if (!addressForm.addressLine1.trim()) return "Address Line 1 is required";
    if (!addressForm.city.trim()) return "City is required";
    if (!addressForm.state.trim()) return "State is required";
    if (!/^\d{6}$/.test(String(addressForm.pincode || "").trim())) return "PIN Code must be 6 digits";
    if (addressForm.phone && !/^\d{10}$/.test(String(addressForm.phone).trim()))
      return "Phone must be 10 digits";
    if (addressForm.email && !/^\S+@\S+\.\S+$/.test(String(addressForm.email).trim()))
      return "Invalid email";
    return null;
  };

  const saveAddress = async () => {
    const errMsg = validateAddress();
    if (errMsg) {
      toast({ title: "Invalid address", description: errMsg, variant: "destructive" });
      return;
    }

    setSavingAddress(true);
    try {
      const payload = {
        ...addressForm,
        phone: String(addressForm.phone || "").replace(/[^\d]/g, "").slice(0, 10),
        pincode: String(addressForm.pincode || "").replace(/[^\d]/g, "").slice(0, 6),
      };

      if (editing?._id) {
        const data = await apiFetch(`/luxury/addresses/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        const list = asAddressList(data);
        setAddresses(list.length ? list : addresses);

        const def = list.find((a) => a.isDefault);
        if (def?._id) setSelectedAddressId(def._id);
        else setSelectedAddressId(editing._id);

        toast({ title: "Updated", description: "Address updated successfully" });
      } else {
        const data = await apiFetch(`/luxury/addresses`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const list = asAddressList(data);
        setAddresses(list.length ? list : addresses);

        const def = list.find((a) => a.isDefault);
        const created = list[list.length - 1];

        if (def?._id) setSelectedAddressId(def._id);
        else if (created?._id) setSelectedAddressId(created._id);

        toast({ title: "Saved", description: "Address added successfully" });
      }

      setShowAddressForm(false);
      setEditing(null);
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      toast({
        title: "Select an address",
        description: "Please choose or add a shipping address.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  // -----------------------------
  // Razorpay flow (create -> open -> verify)
  // -----------------------------
  const startRazorpayPayment = async (): Promise<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    _server?: { rpOrderId: string };
  }> => {
    const ok = await loadRazorpay();
    if (!ok) throw new Error("Razorpay SDK failed to load");

    // ✅ Backend MUST implement:
    // POST /api/luxury/payments/create-order -> { success, order:{id,amount,currency}, keyId }
    // POST /api/luxury/payments/verify       -> { success:true } (signature verification)
    const createRes = await apiFetch("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({
        amount: Number(finalTotal) || 0, // rupees
        currency: "INR",
        receipt: `lux_${Date.now()}`,
        notes: { website: "luxury" },
      }),
    });

    if (!createRes?.success || !createRes?.order?.id || !createRes?.keyId) {
      throw new Error(createRes?.message || "Failed to create Razorpay order");
    }

    const rpOrder = createRes.order; // { id, amount, currency }
    const keyId = createRes.keyId;

    const prefillName = `${selectedAddress?.firstName || ""} ${selectedAddress?.lastName || ""}`.trim();

    return new Promise((resolve, reject) => {
      const options: any = {
        key: keyId,
        order_id: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: "Luxury Store",
        description: "Order Payment",
        prefill: {
          name: prefillName || selectedAddress?.label || "",
          email: selectedAddress?.email || "",
          contact: selectedAddress?.phone || "",
        },
        theme: { color: "#111827" },
        handler: async (resp: any) => {
          try {
            // ✅ verify signature server-side
            const verifyRes = await apiFetch("/payments/verify", {
              method: "POST",
              body: JSON.stringify(resp),
            });

            if (!verifyRes?.success) {
              throw new Error(verifyRes?.message || "Payment verification failed");
            }

            resolve({
              ...resp,
              _server: { rpOrderId: rpOrder.id },
            });
          } catch (e: any) {
            reject(new Error(e?.message || "Payment verification failed"));
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // -----------------------------
  // Place Order
  // -----------------------------
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast({
        title: "Select an address",
        description: "Please choose or add a shipping address.",
        variant: "destructive",
      });
      setStep(1);
      return;
    }

    if (!items?.length) {
      toast({ title: "Cart empty", description: "Add items to checkout", variant: "destructive" });
      navigate("/cart");
      return;
    }

    setPlacingOrder(true);
    try {
      // ✅ If Razorpay, collect payment first
      let razorpayProof:
        | {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }
        | null = null;

      if (paymentMethod === "razorpay") {
        razorpayProof = await startRazorpayPayment();
      }

      // ✅ Place order (backend recompute totals + coupon checks)
      const payload: any = {
        addressId: selectedAddressId,

        items: items.map((it: any) => ({
          productId: it.id,
          name: it.name,
          image: it.image,
          color: it.color || "",
          price: Number(it.price || 0),
          quantity: Number(it.quantity || 1),
        })),

        totals: {
          subtotal: Number(totalPrice) || 0,
          discount: Number(discount) || 0,
          shippingBase: Number(shippingBase) || 0,
          shippingDiscount: Number(shippingDiscount) || 0,
          shipping: Number(shipping) || 0,
          total: Number(finalTotal) || 0,
        },

        payment: {
          method: paymentMethod === "razorpay" ? "RAZORPAY" : "COD",
          status: paymentMethod === "razorpay" ? "paid" : "pending",
          gateway: paymentMethod === "razorpay" ? "razorpay" : undefined,
          ...(paymentMethod === "razorpay"
            ? {
                razorpayOrderId: razorpayProof?.razorpay_order_id,
                razorpayPaymentId: razorpayProof?.razorpay_payment_id,
                razorpaySignature: razorpayProof?.razorpay_signature,
              }
            : {}),
        },

        coupon: appliedCoupon?.code
          ? { code: appliedCoupon.code, couponId: appliedCoupon.couponId }
          : undefined,
      };

      const res = await apiFetch("/luxury/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const orderId = res?.order?._id || res?.data?._id;

      // optional redeem (if your backend expects it separately; if backend already redeems, this is safe to remove)
      if (appliedCoupon?.code && orderId) {
        try {
          await apiFetch(`/coupons/redeem`, {
            method: "POST",
            body: JSON.stringify({
              code: appliedCoupon.code,
              couponId: appliedCoupon.couponId,
              orderId,
            }),
          });
        } catch {
          // ignore
        }
      }

      clearCart();
      localStorage.removeItem(LS_COUPON_KEY);

      navigate("/order-success", {
        replace: true,
        state: {
          orderNumber: res?.order?.orderNumber || res?.data?.orderNumber,
          total: finalTotal,
          coupon: appliedCoupon?.code ? appliedCoupon : null,
          discount,
          shipping,
        },
      });

      toast({
        title: "Order Placed Successfully!",
        description:
          paymentMethod === "cod"
            ? "COD order placed. You will pay at delivery."
            : "Payment success! Order placed successfully.",
      });

      setOrderPlaced(true);
    } catch (err) {
      toast({
        title: "Order failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0 && !orderPlaced) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <StepIndicator number={1} label="Shipping" active={step >= 1} completed={step > 1} />
          <div className="w-12 h-px bg-border" />
          <StepIndicator number={2} label="Payment" active={step >= 2} completed={false} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-gold" />
                    <h2 className="text-2xl font-heading font-bold">Shipping Address</h2>
                  </div>

                  <Button variant="outline" onClick={openAddAddress}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="space-y-3">
                    {loadingAddresses ? (
                      <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 text-sm text-muted-foreground">
                        Loading addresses...
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                        <p className="text-sm text-muted-foreground">No address found. Please add one.</p>
                        <Button variant="gold" className="mt-3" type="button" onClick={openAddAddress}>
                          Add Address
                        </Button>
                      </div>
                    ) : (
                      addresses.map((a) => (
                        <label
                          key={a._id}
                          className={`block rounded-xl border p-4 cursor-pointer transition-colors ${
                            selectedAddressId === a._id
                              ? "border-gold bg-gold/5"
                              : "border-border/50 bg-card hover:bg-secondary/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="address"
                                className="mt-1"
                                checked={selectedAddressId === a._id}
                                onChange={() => setSelectedAddressId(a._id)}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold">{a.label || "Address"}</p>
                                  {a.isDefault && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {(a.firstName || "") + " " + (a.lastName || "")}
                                  {a.phone ? ` • ${a.phone}` : ""}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {a.addressLine1}
                                  {a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city}, {a.state} -{" "}
                                  {a.pincode}
                                </p>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              className="text-muted-foreground"
                              onClick={(e) => {
                                e.preventDefault();
                                openEditAddress(a);
                              }}
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Link to="/cart">
                      <Button variant="outline" type="button">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                      </Button>
                    </Link>
                    <Button variant="gold" type="submit" className="flex-1" disabled={!selectedAddressId}>
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-gold" />
                  <h2 className="text-2xl font-heading font-bold">Payment</h2>
                </div>

                {selectedAddress && (
                  <div className="mb-5 rounded-xl border border-border/50 bg-secondary/20 p-4">
                    <p className="text-sm font-medium">Deliver to</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ""}, {selectedAddress.city},{" "}
                      {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}

                <form onSubmit={handlePlaceOrder} className="space-y-5">
                  <div className="rounded-xl border border-border/50 bg-card p-4">
                    <p className="font-medium mb-3">Choose Payment Method</p>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <PaymentOption
                        active={paymentMethod === "cod"}
                        title="Cash on Delivery"
                        desc="Pay when you receive"
                        icon={<Banknote className="w-5 h-5" />}
                        onClick={() => setPaymentMethod("cod")}
                      />

                      <PaymentOption
                        active={paymentMethod === "razorpay"}
                        title="Online Payment (Razorpay)"
                        desc="UPI / Card / NetBanking / Wallets"
                        icon={<CreditCard className="w-5 h-5" />}
                        onClick={() => setPaymentMethod("razorpay")}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Online payment is verified on the server before order is created.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" type="button" onClick={() => setStep(1)} disabled={placingOrder}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button variant="gold" type="submit" className="flex-1" disabled={placingOrder}>
                      {placingOrder
                        ? "Processing..."
                        : paymentMethod === "razorpay"
                        ? `Pay & Place Order - ${formatPrice(finalTotal)}`
                        : `Place Order - ${formatPrice(finalTotal)}`}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Right summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border/50 p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                {items.map((item: any) => (
                  <div key={`${item.id}-${item.color || ""}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {appliedCoupon?.code ? (
                <div className="mb-4 rounded-xl border border-border/50 bg-secondary/20 p-3 flex items-start gap-2">
                  <Tag className="w-4 h-4 text-gold mt-0.5" />
                  <div className="text-xs">
                    <p className="text-muted-foreground">Coupon applied</p>
                    <p className="font-semibold">{appliedCoupon.code}</p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 border-t border-border/50 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(finalTotal)}</span>
                </div>

                <div className="pt-3">
                  <p className="text-xs text-muted-foreground">
                    Payment: <span className="capitalize">{paymentMethod}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Address Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-card rounded-2xl border border-border/50 shadow-elevated overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold">{editing ? "Edit Address" : "Add New Address"}</h3>
              <Button variant="ghost" onClick={() => setShowAddressForm(false)} disabled={savingAddress}>
                Close
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Label (Home/Office)"
                  value={addressForm.label}
                  onChange={(v) => setAddressForm({ ...addressForm, label: v })}
                />
                <div className="flex items-end gap-2">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="mb-3"
                  />
                  <label className="text-sm mb-2">Set as default</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={addressForm.firstName}
                  onChange={(v) => setAddressForm({ ...addressForm, firstName: v })}
                />
                <InputField
                  label="Last Name"
                  value={addressForm.lastName}
                  onChange={(v) => setAddressForm({ ...addressForm, lastName: v })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  type="email"
                  value={addressForm.email}
                  onChange={(v) => setAddressForm({ ...addressForm, email: v })}
                />
                <InputField
                  label="Phone (10 digits)"
                  value={addressForm.phone}
                  onChange={(v) => setAddressForm({ ...addressForm, phone: v.replace(/[^\d]/g, "").slice(0, 10) })}
                />
              </div>

              <InputField
                label="Address Line 1"
                value={addressForm.addressLine1}
                onChange={(v) => setAddressForm({ ...addressForm, addressLine1: v })}
                required
              />
              <InputField
                label="Address Line 2"
                value={addressForm.addressLine2}
                onChange={(v) => setAddressForm({ ...addressForm, addressLine2: v })}
              />

              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="City"
                  value={addressForm.city}
                  onChange={(v) => setAddressForm({ ...addressForm, city: v })}
                  required
                />
                <InputField
                  label="State"
                  value={addressForm.state}
                  onChange={(v) => setAddressForm({ ...addressForm, state: v })}
                  required
                />
                <InputField
                  label="PIN Code"
                  value={addressForm.pincode}
                  onChange={(v) => setAddressForm({ ...addressForm, pincode: v.replace(/[^\d]/g, "").slice(0, 6) })}
                  required
                />
              </div>

              <InputField
                label="Country"
                value={addressForm.country}
                onChange={(v) => setAddressForm({ ...addressForm, country: v })}
              />

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddressForm(false)} disabled={savingAddress}>
                  Cancel
                </Button>
                <Button variant="gold" className="flex-1" onClick={saveAddress} disabled={savingAddress}>
                  {savingAddress ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const PaymentOption = ({
  active,
  title,
  desc,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
      active ? "border-gold bg-gold/5" : "border-border/50 bg-secondary/10 hover:bg-secondary/20"
    }`}
  >
    <div className={`mt-0.5 ${active ? "text-gold" : "text-muted-foreground"}`}>{icon}</div>
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </div>
  </button>
);

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