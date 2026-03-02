import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
  useRef,
} from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export interface CartItem {
  id: string;          // ✅ productId (_id)
  name: string;
  price: number;
  image: string;
  color?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  syncNow: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "luxury_cart";
const API_BASE = "https://api.jsgallor.com/api/luxury";

function safeParse<T>(v: string | null): T | null {
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

type ServerCartItem = {
  _id?: string; // cart item id (optional)
  productId?: string | { _id: string; name?: string; price?: number; images?: any };
  name?: string;
  price?: number;
  image?: string;
  color?: string;
  quantity: number;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();

  const [items, setItems] = useState<CartItem[]>(
    () => safeParse<CartItem[]>(localStorage.getItem(CART_KEY)) || []
  );

  const didInitRef = useRef(false);
  const syncTimerRef = useRef<any>(null);

  const persistLocal = useCallback((next: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }, []);

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
      return data;
    },
    [token]
  );

  // ✅ map server cart -> frontend cart
  const normalizeServerItems = useCallback((serverItems: ServerCartItem[]): CartItem[] => {
    return (serverItems || [])
      .map((it) => {
        const prod =
          typeof it.productId === "object" && it.productId
            ? it.productId
            : null;

        const productId =
          typeof it.productId === "string"
            ? it.productId
            : prod?._id;

        if (!productId) return null;

        const image =
          it.image ||
          (typeof prod?.images === "string"
            ? prod.images
            : Array.isArray(prod?.images)
            ? prod?.images?.[0]
            : "");

        return {
          id: productId, // ✅ always product _id
          name: it.name || prod?.name || "",
          price: Number(it.price ?? prod?.price ?? 0),
          image: image || "",
          color: it.color || "",
          quantity: Number(it.quantity || 1),
        } as CartItem;
      })
      .filter(Boolean) as CartItem[];
  }, []);

  // ✅ map frontend cart -> server payload (productId must be sent)
  const toServerPayload = useCallback((localItems: CartItem[]) => {
    return (localItems || []).map((it) => ({
      productId: it.id, // ✅ send product _id here
      name: it.name,
      price: it.price,
      image: it.image,
      color: it.color || "",
      quantity: it.quantity,
    }));
  }, []);

  // ---- load cart from server ----
  const loadServerCart = useCallback(async () => {
    if (!token) return;

    const data = await apiFetch("/cart", { method: "GET" });
    const serverItems: ServerCartItem[] = Array.isArray(data?.items) ? data.items : [];
    const normalized = normalizeServerItems(serverItems);

    setItems(normalized);
    persistLocal(normalized);
  }, [apiFetch, normalizeServerItems, persistLocal, token]);

  // ---- merge local -> server after login ----
  const mergeLocalToServer = useCallback(async () => {
    if (!token) return;

    const localItems = safeParse<CartItem[]>(localStorage.getItem(CART_KEY)) || [];

    if (!localItems.length) {
      await loadServerCart();
      return;
    }

    const payload = { items: toServerPayload(localItems) };

    try {
      const merged = await apiFetch("/cart/merge", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const mergedServerItems: ServerCartItem[] = Array.isArray(merged?.items) ? merged.items : [];
      const normalized = mergedServerItems.length ? normalizeServerItems(mergedServerItems) : localItems;

      setItems(normalized);
      persistLocal(normalized);
    } catch {
      // fallback overwrite
      await apiFetch("/cart", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await loadServerCart();
    }
  }, [apiFetch, loadServerCart, normalizeServerItems, toServerPayload, token]);

  // initial sync when auth becomes logged-in
  useEffect(() => {
    (async () => {
      try {
        if (!isAuthenticated || !token) {
          didInitRef.current = true;
          return;
        }
        await mergeLocalToServer();
        didInitRef.current = true;
      } catch {
        didInitRef.current = true;
      }
    })();
  }, [isAuthenticated, token, mergeLocalToServer]);

  // ---- syncNow (replace cart) ----
  const syncNow = useCallback(async () => {
    if (!token) return;
    await apiFetch("/cart", {
      method: "PUT",
      body: JSON.stringify({ items: toServerPayload(items) }),
    });
  }, [apiFetch, items, token, toServerPayload]);

  // ---- auto sync (debounced) when items change ----
  useEffect(() => {
    persistLocal(items);

    if (!token || !isAuthenticated) return;
    if (!didInitRef.current) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncNow().catch(() => {});
    }, 600);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [items, token, isAuthenticated, persistLocal, syncNow]);

  // ---- cart ops ----
  const addItem = useCallback((newItem: Omit<CartItem, "quantity">, qty: number = 1) => {
    // ✅ ensure productId exists
    if (!newItem.id) {
      toast({ title: "Error", description: "ProductId (_id) is missing", variant: "destructive" });
      return;
    }

    const quantityToAdd = Math.max(1, Number(qty) || 1);

    setItems((prev) => {
      const idx = prev.findIndex(
        (it) => it.id === newItem.id && (it.color || "") === (newItem.color || "")
      );

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + quantityToAdd };
        return copy;
      }
      return [...prev, { ...newItem, quantity: quantityToAdd }];
    });

    toast({
      title: "Added to cart",
      description: `${newItem.name} (x${quantityToAdd}) added.`,
    });
  }, []);

  const removeItem = useCallback((id: string, color?: string) => {
    setItems((prev) => prev.filter((it) => !(it.id === id && (it.color || "") === (color || ""))));
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number, color?: string) => {
      const q = Math.max(0, Number(quantity) || 0);
      if (q < 1) {
        removeItem(id, color);
        return;
      }
      setItems((prev) =>
        prev.map((it) =>
          it.id === id && (it.color || "") === (color || "")
            ? { ...it, quantity: q }
            : it
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);

    if (token) {
      apiFetch("/cart", { method: "PUT", body: JSON.stringify({ items: [] }) }).catch(() => {});
    }
  }, [apiFetch, token]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        syncNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
