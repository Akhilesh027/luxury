import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";
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

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<LuxuryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const statusBadge = (status: LuxuryOrder["status"]) => {
    const base = "text-xs px-2 py-1 rounded-full border";
    switch (status) {
      case "delivered":
        return <span className={`${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-400`}>Delivered</span>;
      case "shipped":
        return <span className={`${base} border-blue-500/40 bg-blue-500/10 text-blue-400`}>Shipped</span>;
      case "processing":
        return <span className={`${base} border-yellow-500/40 bg-yellow-500/10 text-yellow-400`}>Processing</span>;
      case "cancelled":
        return <span className={`${base} border-red-500/40 bg-red-500/10 text-red-400`}>Cancelled</span>;
      default:
        return <span className={`${base} border-gold/40 bg-gold/10 text-gold`}>Placed</span>;
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      toast({ title: "Please login", description: "Login required to view orders", variant: "destructive" });
      navigate("/");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/orders/my", { method: "GET" });
        const list = Array.isArray(data?.orders) ? data.orders : [];
        setOrders(list);
      } catch (e: any) {
        toast({ title: "Failed to load orders", description: e?.message || "Try again", variant: "destructive" });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const empty = useMemo(() => !loading && orders.length === 0, [loading, orders.length]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold">My Orders</h1>
            <p className="text-muted-foreground mt-1">Track and view your order details</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6 rounded-xl border border-border/50 bg-card text-muted-foreground">
            Loading orders...
          </div>
        ) : empty ? (
          <div className="p-10 rounded-xl border border-border/50 bg-card text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-heading font-bold">No orders yet</h2>
            <p className="text-muted-foreground mt-2">Once you place an order, it will show here.</p>
            <Link to="/catalog">
              <Button variant="gold" className="mt-5">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="rounded-xl border border-border/50 bg-card p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gold">{order.orderNumber}</p>
                      {statusBadge(order.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{formatPrice(order.pricing.total)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-border/50 pt-4">
                  <div className="text-sm text-muted-foreground">
                    {order.items?.length || 0} item(s) • Payment:{" "}
                    <span className="text-foreground font-medium">
                      {order.payment?.method?.toUpperCase()} ({order.payment?.status})
                    </span>
                  </div>

                  <Link to={`/orders/${order._id}`}>
                    <Button variant="outline">
                      View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
