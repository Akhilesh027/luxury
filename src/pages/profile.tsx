// src/pages/Profile.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  Loader2,
  Plus,
  Pencil,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

// ✅ match your backend base + token key
const API_BASE = "https://api.jsgallor.com/api/luxury";
const TOKEN_KEY = "luxury_auth_token";

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
  if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`);
  return json;
}

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

type OrderItem = {
  productId?: string;
  name: string;
  image?: string;
  color?: string;
  price: number;
  quantity: number;
  lineTotal?: number;
};

type Order = {
  _id: string;
  orderNumber?: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  pricing: {
    subtotal: number;
    shipping: number;
    total: number;
    currency?: string;
  };
  shippingAddress: Address & { addressLine1: string };
  payment?: { method?: string; status?: string; transactionId?: string };
  items: OrderItem[];
};

const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const formatDate = (d: string) =>
  new Date(d).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, getProfile, logout, isAuthenticated, isLoading: authLoading } =
    useAuth();

  const [tab, setTab] = useState<"profile" | "orders" | "addresses">("profile");

  // addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // address modal (add/edit)
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

  // ✅ protect page
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [authLoading, isAuthenticated, navigate]);

  // load profile
  useEffect(() => {
    if (isAuthenticated) getProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await apiFetch("/addresses", { method: "GET" });
      setAddresses(Array.isArray(data?.addresses) ? data.addresses : []);
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

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await apiFetch("/orders/my", { method: "GET" });
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (err) {
      toast({
        title: "Failed to load orders",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  // load data per-tab (lazy)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (tab === "addresses") loadAddresses();
    if (tab === "orders") loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isAuthenticated]);

  // ✅ also load minimal data for right sticky panel
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAddresses().catch(() => {});
    loadOrders().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) || null,
    [addresses]
  );

  const latestOrder = useMemo(() => (orders?.length ? orders[0] : null), [orders]);

  const openAddAddress = () => {
    setEditing(null);
    setAddressForm({
      label: "Home",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
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

  const saveAddress = async () => {
    if (
      !addressForm.addressLine1 ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.pincode
    ) {
      toast({
        title: "Missing fields",
        description: "AddressLine1, City, State, Pincode are required.",
        variant: "destructive",
      });
      return;
    }

    setSavingAddress(true);
    try {
      if (editing?._id) {
        const data = await apiFetch(`/addresses/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(addressForm),
        });
        setAddresses(Array.isArray(data?.addresses) ? data.addresses : []);
        toast({ title: "Updated", description: "Address updated successfully." });
      } else {
        const data = await apiFetch(`/addresses`, {
          method: "POST",
          body: JSON.stringify(addressForm),
        });
        setAddresses(Array.isArray(data?.addresses) ? data.addresses : []);
        toast({ title: "Saved", description: "Address added successfully." });
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-10">
        {/* ✅ 3 column layout so right can be sticky */}
        <div className="grid gap-8 lg:grid-cols-[320px_1fr_340px]">
          {/* Left sidebar (sticky) */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                  <User className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xl">
                    {user?.fullName ||
                      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                      "Customer"}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <SideBtn
                  active={tab === "profile"}
                  onClick={() => setTab("profile")}
                  icon={<User className="w-4 h-4" />}
                >
                  Profile Details
                </SideBtn>
                <SideBtn
                  active={tab === "orders"}
                  onClick={() => setTab("orders")}
                  icon={<Package className="w-4 h-4" />}
                >
                  My Orders
                </SideBtn>
                <SideBtn
                  active={tab === "addresses"}
                  onClick={() => setTab("addresses")}
                  icon={<MapPin className="w-4 h-4" />}
                >
                  My Addresses
                </SideBtn>
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <Button variant="gold" className="w-full" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          {/* Middle main content (scrolls) */}
          <section className="min-w-0">
            {tab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <CardTitle title="Profile Details" subtitle="Your account information" />

                <div className="grid md:grid-cols-2 gap-4">
                  <InfoCard label="First Name" value={user?.firstName || "—"} />
                  <InfoCard label="Last Name" value={user?.lastName || "—"} />
                  <InfoCard label="Email" value={user?.email || "—"} />
                  <InfoCard label="Phone" value={user?.phone || "—"} />
                  <InfoCard label="Platform" value={user?.platform || "luxury"} />
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6">
                  <h3 className="font-heading font-bold text-lg mb-3">Default Address</h3>
                  {defaultAddress ? (
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      <p className="font-medium text-foreground mb-1">
                        {defaultAddress.label || "Home"}
                      </p>
                      <p>
                        {defaultAddress.addressLine1}
                        {defaultAddress.addressLine2
                          ? `, ${defaultAddress.addressLine2}`
                          : ""}
                      </p>
                      <p>
                        {defaultAddress.city}, {defaultAddress.state} -{" "}
                        {defaultAddress.pincode}
                      </p>
                      <p>{defaultAddress.country || "India"}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setTab("addresses")}
                      >
                        Manage Addresses <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No address saved yet.
                      <div className="mt-3">
                        <Button variant="gold" onClick={() => setTab("addresses")}>
                          Add Address
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "orders" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <CardTitle title="My Orders" subtitle="Track your purchases" />

                {loadingOrders ? (
                  <LoadingBox text="Loading orders..." />
                ) : orders.length === 0 ? (
                  <EmptyBox
                    title="No orders yet"
                    desc="When you place an order, it will appear here."
                    action={
                      <Link to="/catalog">
                        <Button variant="gold">Start Shopping</Button>
                      </Link>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <div key={o._id} className="bg-card rounded-2xl border border-border/50 p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="font-heading font-bold text-lg">
                              {o.orderNumber || `Order #${o._id.slice(-6).toUpperCase()}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(o.createdAt)} • Payment: {o.payment?.method || "—"} • Status:{" "}
                              <span className="text-foreground font-medium">{o.status}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-lg font-bold text-gold">{formatMoney(o.pricing?.total)}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid md:grid-cols-2 gap-4">
                          <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                            <p className="text-sm font-medium mb-2">Delivery Address</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {o.shippingAddress?.addressLine1}
                              {o.shippingAddress?.addressLine2 ? `, ${o.shippingAddress.addressLine2}` : ""}
                              <br />
                              {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}
                              <br />
                              {o.shippingAddress?.country || "India"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                            <p className="text-sm font-medium mb-2">Pricing</p>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <Row label="Subtotal" value={formatMoney(o.pricing?.subtotal)} />
                              <Row label="Shipping" value={formatMoney(o.pricing?.shipping)} />
                              <Row label="Total" value={formatMoney(o.pricing?.total)} strong />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "addresses" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <CardTitle title="My Addresses" subtitle="Manage shipping addresses" />
                  <Button variant="gold" onClick={openAddAddress}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>

                {loadingAddresses ? (
                  <LoadingBox text="Loading addresses..." />
                ) : addresses.length === 0 ? (
                  <EmptyBox
                    title="No addresses"
                    desc="Add your first address to speed up checkout."
                    action={
                      <Button variant="gold" onClick={openAddAddress}>
                        Add Address
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                      <div key={a._id} className="bg-card rounded-2xl border border-border/50 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-heading font-bold">{a.label || "Address"}</p>
                              {a.isDefault && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                              {a.addressLine1}
                              {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                              <br />
                              {a.city}, {a.state} - {a.pincode}
                              <br />
                              {a.country || "India"}
                            </p>
                          </div>

                          <Button variant="outline" onClick={() => openEditAddress(a)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </section>

          {/* ✅ Right sticky panel (won't move) */}
          <aside className="hidden lg:block lg:sticky lg:top-24 h-fit">
            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-5">
              <div>
                <p className="text-xs text-muted-foreground">Quick Summary</p>
                <p className="font-heading font-bold text-lg mt-1">
                  {user?.fullName ||
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "Customer"}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground">{user?.phone}</p>
              </div>

              <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                <p className="text-sm font-medium mb-2">Default Address</p>
                {defaultAddress ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {defaultAddress.addressLine1}
                    {defaultAddress.addressLine2 ? `, ${defaultAddress.addressLine2}` : ""}
                    <br />
                    {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No address saved.</p>
                )}

                <Button variant="outline" className="w-full mt-3" onClick={() => setTab("addresses")}>
                  Manage Addresses
                </Button>
              </div>

              <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                <p className="text-sm font-medium mb-2">Latest Order</p>
                {loadingOrders ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                  </div>
                ) : latestOrder ? (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="text-foreground font-medium">
                      {latestOrder.orderNumber || `#${latestOrder._id.slice(-6).toUpperCase()}`}
                    </p>
                    <p>{formatDate(latestOrder.createdAt)}</p>
                    <p>Status: <span className="text-foreground font-medium">{latestOrder.status}</span></p>
                    <p className="text-gold font-bold">{formatMoney(latestOrder.pricing?.total)}</p>
                    <Button variant="outline" className="w-full mt-3" onClick={() => setTab("orders")}>
                      View All Orders
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No orders yet.
                    <Link to="/catalog">
                      <Button variant="gold" className="w-full mt-3">Shop Now</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Address Modal (same as your code) */}
      {showAddressForm && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-card rounded-2xl border border-border/50 shadow-elevated overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold">{editing ? "Edit Address" : "Add New Address"}</h3>
              <Button variant="ghost" onClick={() => setShowAddressForm(false)}>
                Close
              </Button>
            </div>

            <div className="p-5 space-y-4">
              <InputField label="Label (Home/Office)" value={addressForm.label} onChange={(v) => setAddressForm({ ...addressForm, label: v })} />
              <InputField label="Address Line 1" value={addressForm.addressLine1} onChange={(v) => setAddressForm({ ...addressForm, addressLine1: v })} required />
              <InputField label="City" value={addressForm.city} onChange={(v) => setAddressForm({ ...addressForm, city: v })} required />
              <InputField label="State" value={addressForm.state} onChange={(v) => setAddressForm({ ...addressForm, state: v })} required />
              <InputField label="PIN Code" value={addressForm.pincode} onChange={(v) => setAddressForm({ ...addressForm, pincode: v })} required />

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

// ----- small UI helpers (same as before) -----
function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-heading font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

function SideBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors ${
        active
          ? "border-gold bg-gold/10 text-foreground"
          : "border-border/50 bg-secondary/10 text-muted-foreground hover:bg-secondary/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-gold" : "text-muted-foreground"}>{icon}</span>
        <span className="text-sm font-medium">{children}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-60" />
    </button>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-medium mt-1">{value}</p>
    </div>
  );
}

function LoadingBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6 flex items-center gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function EmptyBox({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6">
      <p className="font-heading font-bold text-lg">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "font-medium text-foreground" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InputField({
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
}) {
  return (
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
}

export default ProfilePage;
