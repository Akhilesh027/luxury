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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/orders">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="p-6 rounded-xl border border-border/50 bg-card text-muted-foreground">
            Loading order details...
          </div>
        ) : !order ? (
          <div className="p-10 rounded-xl border border-border/50 bg-card text-center">
            <PackageCheck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-heading font-bold">Order not found</h2>
            <p className="text-muted-foreground mt-2">This order may not exist or you don’t have access.</p>
            <Link to="/orders">
              <Button variant="gold" className="mt-5">Go Back</Button>
            </Link>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Top summary */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-heading font-bold text-gold">{order.orderNumber}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Status: <span className="text-foreground font-semibold">{order.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{formatPrice(order.pricing.total)}</p>
                </div>
              </div>
            </div>

            {/* Address + payment */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-lg font-heading font-bold mb-3">Shipping Address</h2>
                {addr ? (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="text-foreground font-medium">
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
                  <p className="text-sm text-muted-foreground">No address data</p>
                )}
              </div>

              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h2 className="text-lg font-heading font-bold mb-3">Payment</h2>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Method:{" "}
                    <span className="text-foreground font-medium">{order.payment.method?.toUpperCase()}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span className="text-foreground font-medium">{order.payment.status}</span>
                  </p>
                  {order.payment.transactionId ? (
                    <p>Transaction ID: {order.payment.transactionId}</p>
                  ) : null}
                </div>

                <div className="mt-5 border-t border-border/50 pt-4 text-sm text-muted-foreground space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.pricing.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{order.pricing.shipping === 0 ? "Free" : formatPrice(order.pricing.shipping)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span className="text-gold">{formatPrice(order.pricing.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-border/50 bg-card p-6">
              <h2 className="text-lg font-heading font-bold mb-4">Items</h2>

              <div className="space-y-4">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-border/50 pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={it.image || "https://via.placeholder.com/80"}
                      alt={it.name}
                      className="w-20 h-20 rounded-lg object-cover bg-secondary/30"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{it.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Qty: {it.quantity} • Price: {formatPrice(it.price)}
                        {it.color ? ` • Color: ${it.color}` : ""}
                      </p>
                      {it.productId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Product ID: {it.productId}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gold">
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