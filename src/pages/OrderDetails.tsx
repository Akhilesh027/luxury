import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, PackageCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const API_BASE = "https://api.jsgallor.com/api/luxury";
const TOKEN_KEY = "luxury_auth_token";

type OrderItem = {
  productId?: string;
  name: string;
  image?: string;
  color?: string;
  price: number;
  quantity: number;
  lineTotal?: number;
};

type LuxuryOrder = {
  _id: string;
  orderNumber: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  pricing: {
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
  };
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  shippingAddress: {
    label?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  items: OrderItem[];
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`);
  return json;
}

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<LuxuryOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast({ title: "Please login", description: "Login required to view order", variant: "destructive" });
      navigate("/");
      return;
    }

    if (!orderId) return;

    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/orders/${orderId}`, { method: "GET" });
        setOrder(data?.order || null);
      } catch (e: any) {
        toast({ title: "Failed to load order", description: e?.message || "Try again", variant: "destructive" });
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, navigate]);

  const addr = useMemo(() => order?.shippingAddress, [order]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative">
      {/* Soft overlay for text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <Header />

      <main className="container mx-auto px-4 py-10 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/orders">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#7a5a1e]"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="p-6 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm text-white/80">
            Loading order details...
          </div>
        ) : !order ? (
          <div className="p-10 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm text-center">
            <PackageCheck className="w-16 h-16 mx-auto text-white/50 mb-4" />
            <h2 className="text-xl font-heading font-bold text-white">Order not found</h2>
            <p className="text-white/80 mt-2">This order may not exist or you don’t have access.</p>
            <Link to="/orders">
              <Button
                className="mt-5 bg-white text-[#7a5a1e] hover:bg-[#d4af37] hover:text-white border-0"
              >
                Go Back
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Top summary */}
            <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-[#d4af37]">{order.orderNumber}</h1>
                  <p className="text-sm text-white/70 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    Status: <span className="text-white font-semibold">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/70">Total</p>
                  <p className="text-2xl font-bold text-[#d4af37]">{formatPrice(order.pricing.total)}</p>
                </div>
              </div>
            </div>

            {/* Address + payment */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-white mb-3">Shipping Address</h2>
                {addr ? (
                  <div className="text-sm text-white/80 space-y-1">
                    <p className="text-white font-medium">
                      {(addr.firstName || "") + " " + (addr.lastName || "")}
                    </p>
                    {addr.phone && <p>{addr.phone}</p>}
                    {addr.email && <p>{addr.email}</p>}
                    <p>
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </p>
                    <p>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p>{addr.country || "India"}</p>
                  </div>
                ) : (
                  <p className="text-sm text-white/70">No address data</p>
                )}
              </div>

              <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-6">
                <h2 className="text-lg font-heading font-bold text-white mb-3">Payment</h2>
                <div className="text-sm text-white/80 space-y-2">
                  <p>
                    Method:{" "}
                    <span className="text-white font-medium">{order.payment.method?.toUpperCase()}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="text-white font-medium">{order.payment.status}</span>
                  </p>
                  {order.payment.transactionId ? (
                    <p>Transaction ID: {order.payment.transactionId}</p>
                  ) : null}
                </div>

                <div className="mt-5 border-t border-white/10 pt-4 text-sm text-white/70 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">{formatPrice(order.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-white">
                      {order.pricing.shipping === 0 ? "Free" : formatPrice(order.pricing.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-white">
                    <span>Total</span>
                    <span className="text-[#d4af37]">{formatPrice(order.pricing.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm p-6">
              <h2 className="text-lg font-heading font-bold text-white mb-4">Items</h2>

              <div className="space-y-4">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={it.image || "https://via.placeholder.com/80"}
                      alt={it.name}
                      className="w-20 h-20 rounded-lg object-cover bg-white/5"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{it.name}</p>
                      <p className="text-sm text-white/70 mt-1">
                        Qty: {it.quantity} • Price: {formatPrice(it.price)}
                        {it.color ? ` • Color: ${it.color}` : ""}
                      </p>
                      {it.productId && (
                        <p className="text-xs text-white/50 mt-1">
                          Product ID: {it.productId}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-[#d4af37]">
                        {formatPrice((it.lineTotal ?? it.price * it.quantity) || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetails;