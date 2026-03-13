// src/pages/Checkout.tsx (LUXURY)
// ✅ UPDATED with dynamic shipping by city + optional pincode
// ✅ Razorpay (REAL online flow) + COD
// ✅ Flow:
//    1) COD: POST /api/luxury/orders
//    2) ONLINE (Razorpay):
//        - POST /api/payments/create-order
//        - open Razorpay checkout
//        - POST /api/payments/verify
//        - POST /api/luxury/orders
// ✅ Coupon: sent to backend; backend must verify
// ✅ Shipping:
//        - GET /api/shipping-costs/by-location?website=luxury&city=...&pincode=...
//        - auto recalculates when selected address changes
//        - sends shipping object + totals to backend

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
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

const API_BASE = "https://api.jsgallor.com/api";
const TOKEN_KEY = "luxury_auth_token";
const LS_COUPON_KEY = "luxury_coupon";
const WEBSITE = "luxury";

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

type ShippingLookupResponse = {
  success: boolean;
  message?: string;
  data?: {
    _id: string;
    website: string;
    city: string;
    pincode?: string;
    amount: number;
    isActive: boolean;
  } | null;
  appliedRule?: string | null;
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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);

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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [appliedCoupon, setAppliedCoupon] = useState<CheckoutCoupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);

  // ✅ dynamic shipping
  const [shippingBase, setShippingBase] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingMeta, setShippingMeta] = useState<{
    found: boolean;
    city: string;
    pincode: string;
    appliedRule: string;
  }>({
    found: false,
    city: "",
    pincode: "",
    appliedRule: "",
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const shipping = useMemo(() => {
    return Math.max(0, Number(shippingBase || 0) - Number(shippingDiscount || 0));
  }, [shippingBase, shippingDiscount]);

  const finalTotal = useMemo(() => {
    return Math.max(0, totalPrice - discount) + shipping;
  }, [totalPrice, discount, shipping]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast({
        title: "Login required",
        description: "Please login to continue checkout.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [navigate]);

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
  }, [location.state]);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) navigate("/cart");
  }, [items.length, orderPlaced, navigate]);

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
  }, []);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  const fetchShippingCost = async (params: { city?: string; pincode?: string }) => {
    const city = String(params.city || "").trim();
    const pincode = String(params.pincode || "").trim();

    if (!city) {
      setShippingBase(0);
      setShippingMeta({
        found: false,
        city: "",
        pincode: "",
        appliedRule: "",
      });
      return;
    }

    try {
      setShippingLoading(true);

      const qs = new URLSearchParams({
        website: WEBSITE,
        city,
      });

      if (pincode) qs.set("pincode", pincode);

      const data: ShippingLookupResponse = await apiFetch(
        `/shipping-costs/by-location?${qs.toString()}`,
        { method: "GET" }
      );

      if (data?.data) {
        setShippingBase(Number(data.data.amount || 0));
        setShippingMeta({
          found: true,
          city: data.data.city || city,
          pincode: data.data.pincode || pincode,
          appliedRule: data.appliedRule || "",
        });
      } else {
        setShippingBase(0);
        setShippingMeta({
          found: false,
          city,
          pincode,
          appliedRule: "",
        });
      }
    } catch {
      setShippingBase(0);
      setShippingMeta({
        found: false,
        city,
        pincode,
        appliedRule: "",
      });
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedAddress?.city) {
      setShippingBase(0);
      setShippingMeta({
        found: false,
        city: "",
        pincode: "",
        appliedRule: "",
      });
      return;
    }

    fetchShippingCost({
      city: selectedAddress.city,
      pincode: selectedAddress.pincode,
    });
  }, [selectedAddress?.city, selectedAddress?.pincode]);

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
        if (list.length) {
          setAddresses(list);
          const def = list.find((a) => a.isDefault);
          if (def?._id) setSelectedAddressId(def._id);
          else setSelectedAddressId(editing._id);
        }

        toast({ title: "Updated", description: "Address updated successfully" });
      } else {
        const data = await apiFetch(`/luxury/addresses`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const list = asAddressList(data);
        if (list.length) {
          setAddresses(list);
          const def = list.find((a) => a.isDefault);
          const created = list[list.length - 1];
          if (def?._id) setSelectedAddressId(def._id);
          else if (created?._id) setSelectedAddressId(created._id);
        } else {
          await fetchAddresses();
        }

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
    if (shippingLoading) {
      toast({
        title: "Please wait",
        description: "Shipping is being calculated.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const startRazorpayPayment = async (): Promise<{
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    _server?: { rpOrderId: string };
  }> => {
    const ok = await loadRazorpay();
    if (!ok) throw new Error("Razorpay SDK failed to load");

    const createRes = await apiFetch("/payments/create-order", {
      method: "POST",
      body: JSON.stringify({
        amount: Number(finalTotal) || 0,
        currency: "INR",
        receipt: `lux_${Date.now()}`,
        notes: {
          website: WEBSITE,
          shippingCity: selectedAddress?.city || "",
          shippingPincode: selectedAddress?.pincode || "",
        },
      }),
    });

    if (!createRes?.success || !createRes?.order?.id || !createRes?.keyId) {
      throw new Error(createRes?.message || "Failed to create Razorpay order");
    }

    const rpOrder = createRes.order;
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

    if (shippingLoading) {
      toast({
        title: "Please wait",
        description: "Shipping is being calculated.",
        variant: "destructive",
      });
      return;
    }

    setPlacingOrder(true);
    try {
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

        shipping: {
          website: WEBSITE,
          city: selectedAddress?.city || shippingMeta.city || "",
          pincode: selectedAddress?.pincode || shippingMeta.pincode || "",
          amount: Number(shippingBase) || 0,
          shippingDiscount: Number(shippingDiscount) || 0,
          finalShipping: Number(shipping) || 0,
          appliedRule: shippingMeta.appliedRule || "",
          matchedRuleFound: shippingMeta.found,
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
          shippingMeta,
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
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
      {/* Soft overlay for text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-12">
          <StepIndicator number={1} label="Shipping" active={step >= 1} completed={step > 1} />
          <div className="w-12 h-px bg-white/20" />
          <StepIndicator number={2} label="Payment" active={step >= 2} completed={false} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-[#d4af37]" />
                    <h2 className="text-2xl font-heading font-bold text-white drop-shadow-lg">
                      Shipping Address
                    </h2>
                  </div>

                  <Button
                    variant="outline"
                    onClick={openAddAddress}
                    className="border-white text-white hover:bg-white hover:text-[#7a5a1e]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="space-y-3">
                    {loadingAddresses ? (
                      <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20 text-sm text-white/80 inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading addresses...
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20">
                        <p className="text-sm text-white/80">No address found. Please add one.</p>
                        <Button
                          variant="outline"
                          className="mt-3 border-white text-white hover:bg-white hover:text-[#7a5a1e]"
                          type="button"
                          onClick={openAddAddress}
                        >
                          Add Address
                        </Button>
                      </div>
                    ) : (
                      addresses.map((a) => (
                        <label
                          key={a._id}
                          className={`block rounded-xl border p-4 cursor-pointer transition-colors ${
                            selectedAddressId === a._id
                              ? "border-[#d4af37] bg-[#d4af37]/10"
                              : "border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="address"
                                className="mt-1 accent-[#d4af37]"
                                checked={selectedAddressId === a._id}
                                onChange={() => setSelectedAddressId(a._id)}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-white">{a.label || "Address"}</p>
                                  {a.isDefault && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-white/80 mt-1">
                                  {(a.firstName || "") + " " + (a.lastName || "")}
                                  {a.phone ? ` • ${a.phone}` : ""}
                                </p>
                                <p className="text-sm text-white/80 mt-1">
                                  {a.addressLine1}
                                  {a.addressLine2 ? `, ${a.addressLine2}` : ""}, {a.city}, {a.state} -{" "}
                                  {a.pincode}
                                </p>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              className="text-white/70 hover:text-white"
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

                  {selectedAddress && (
                    <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-[#d4af37]" />
                          <div>
                            <p className="text-sm font-medium text-white">Shipping for selected address</p>
                            <p className="text-sm text-white/80 mt-1">
                              {selectedAddress.city}
                              {selectedAddress.pincode ? ` - ${selectedAddress.pincode}` : ""}
                            </p>

                            {!shippingLoading && shippingMeta.found && shippingMeta.appliedRule && (
                              <p className="text-xs text-white/60 mt-1">
                                Applied rule: {shippingMeta.appliedRule.replace(/_/g, " ")}
                              </p>
                            )}

                            {!shippingLoading && !shippingMeta.found && (
                              <p className="text-xs text-white/60 mt-1">
                                No shipping rule found. Free shipping applied.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-white/70">Shipping</p>
                          <p className="font-semibold text-white">
                            {shippingLoading ? "Loading..." : shipping === 0 ? "Free" : formatPrice(shipping)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Link to="/cart">
                      <Button variant="outline" type="button" className="border-white text-white hover:bg-white hover:text-[#7a5a1e]">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                      </Button>
                    </Link>
                    <Button
                      variant="default"
                      type="submit"
                      className="flex-1 bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
                      disabled={!selectedAddressId || shippingLoading}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-[#d4af37]" />
                  <h2 className="text-2xl font-heading font-bold text-white drop-shadow-lg">Payment</h2>
                </div>

                {selectedAddress && (
                  <div className="mb-5 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-4">
                    <p className="text-sm font-medium text-white">Deliver to</p>
                    <p className="text-sm text-white/80 mt-1">
                      {selectedAddress.addressLine1}
                      {selectedAddress.addressLine2 ? `, ${selectedAddress.addressLine2}` : ""}, {selectedAddress.city},{" "}
                      {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    {!shippingLoading && shippingMeta.found && shippingMeta.appliedRule && (
                      <p className="text-xs text-white/60 mt-1">
                        Shipping rule: {shippingMeta.appliedRule.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={handlePlaceOrder} className="space-y-5">
                  <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-4">
                    <p className="font-medium text-white mb-3">Choose Payment Method</p>

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

                    <p className="text-xs text-white/60 mt-3">
                      Online payment is verified on the server before order is created.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" type="button" onClick={() => setStep(1)} disabled={placingOrder} className="border-white text-white hover:bg-white hover:text-[#7a5a1e]">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      variant="default"
                      type="submit"
                      className="flex-1 bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
                      disabled={placingOrder || shippingLoading}
                    >
                      {placingOrder ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      ) : paymentMethod === "razorpay" ? (
                        `Pay & Place Order - ${formatPrice(finalTotal)}`
                      ) : (
                        `Place Order - ${formatPrice(finalTotal)}`
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold text-white drop-shadow-lg mb-6">Order Summary</h2>

              <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                {items.map((item: any) => (
                  <div key={`${item.id}-${item.color || ""}`} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-white">{item.name}</p>
                      <p className="text-xs text-white/70">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {appliedCoupon?.code ? (
                <div className="mb-4 rounded-xl border border-white/20 bg-black/60 p-3 flex items-start gap-2">
                  <Tag className="w-4 h-4 text-[#d4af37] mt-0.5" />
                  <div className="text-xs">
                    <p className="text-white/80">Coupon applied</p>
                    <p className="font-semibold text-white">{appliedCoupon.code}</p>
                  </div>
                </div>
              ) : null}

              <div className="mb-4 rounded-xl border border-white/20 bg-black/60 p-3">
                {!selectedAddress ? (
                  <p className="text-sm text-white/80">Select address to calculate shipping</p>
                ) : shippingLoading ? (
                  <p className="text-sm text-white/80 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating shipping...
                  </p>
                ) : shippingMeta.found ? (
                  <div>
                    <p className="text-sm font-medium text-white">
                      Shipping for {selectedAddress.city}
                      {selectedAddress.pincode ? ` - ${selectedAddress.pincode}` : ""}
                    </p>
                    {shippingMeta.appliedRule && (
                      <p className="text-xs text-white/60 mt-1">
                        Rule: {shippingMeta.appliedRule.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-emerald-300 font-medium">
                    No shipping rule matched. Free shipping applied.
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-white/20 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal</span>
                  <span className="text-white">{formatPrice(totalPrice)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-300">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Shipping</span>
                  <span className="text-white">
                    {shippingLoading ? "Loading..." : shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>

                {shippingDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-300">
                    <span>Shipping Discount</span>
                    <span>-{formatPrice(shippingDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/20">
                  <span className="text-white">Total</span>
                  <span className="text-[#d4af37]">{formatPrice(finalTotal)}</span>
                </div>

                <div className="pt-3">
                  <p className="text-xs text-white/60">
                    Payment: <span className="capitalize text-white/80">{paymentMethod}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddressForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-elevated overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-white">{editing ? "Edit Address" : "Add New Address"}</h3>
              <Button variant="ghost" onClick={() => setShowAddressForm(false)} disabled={savingAddress} className="text-white/70 hover:text-white">
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
                    className="mb-3 accent-[#d4af37]"
                  />
                  <label className="text-sm text-white/80 mb-2">Set as default</label>
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
                <Button variant="outline" className="flex-1 border-white text-white hover:bg-white hover:text-[#7a5a1e]" onClick={() => setShowAddressForm(false)} disabled={savingAddress}>
                  Cancel
                </Button>
                <Button variant="default" className="flex-1 bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0" onClick={saveAddress} disabled={savingAddress}>
                  {savingAddress ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Address"
                  )}
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
      active
        ? "border-[#d4af37] bg-[#d4af37]/10"
        : "border-white/20 bg-black/40 hover:bg-black/60"
    }`}
  >
    <div className={`mt-0.5 ${active ? "text-[#d4af37]" : "text-white/60"}`}>{icon}</div>
    <div>
      <p className="font-semibold text-white">{title}</p>
      <p className="text-xs text-white/70 mt-1">{desc}</p>
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
            ? "bg-[#d4af37] text-[#7a5a1e]"
            : "bg-white/10 text-white/60"
      }`}
    >
      {completed ? <CheckCircle className="w-5 h-5" /> : number}
    </div>
    <span className={active ? "text-white" : "text-white/60"}>{label}</span>
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
    <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/50 outline-none focus:border-[#d4af37] transition-colors"
    />
  </div>
);

export default Checkout;