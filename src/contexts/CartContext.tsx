// src/contexts/CartContext.tsx
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
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  gst: number;
  priceIncludesGst?: boolean;
  isCustomized: boolean;
  image: string;
  variantId?: string | null;
  attributes?: {
    size?: string | null;
    color?: string | null;
    fabric?: string | null;
  };
  quantity: number;
  cartItemId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalGst: number;
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
  _id?: string;
  productId: string | { _id: string; name?: string; price?: number; images?: any };
  variantId?: string | null;
  attributes?: {
    size?: string | null;
    color?: string | null;
    fabric?: string | null;
  };
  name?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  gst?: number;
  priceIncludesGst?: boolean;
  isCustomized?: boolean;
  image?: string;
  quantity: number;
};

const getItemMatchKey = (item: CartItem): string => {
  const base = item.id;
  const variant = item.variantId || "null";
  const color = item.attributes?.color || "null";
  const size = item.attributes?.size || "null";
  const fabric = item.attributes?.fabric || "null";
  return `${base}::${variant}::${color}::${size}::${fabric}`;
};

const calculateLineGst = (item: CartItem) => {
  const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);
  const gstPercent = Number(item.gst || 0);
  const priceIncludesGst = item.priceIncludesGst ?? true;

  if (!gstPercent || !lineTotal) return 0;

  return priceIncludesGst
    ? lineTotal - lineTotal / (1 + gstPercent / 100)
    : lineTotal * (gstPercent / 100);
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  const normalizeServerItems = useCallback((serverItems: ServerCartItem[]): CartItem[] => {
    return (serverItems || [])
      .map((it) => {
        const prod =
          typeof it.productId === "object" && it.productId ? it.productId : null;

        const productId =
          typeof it.productId === "string" ? it.productId : prod?._id;

        if (!productId) return null;

        const image =
          it.image ||
          (typeof prod?.images === "string"
            ? prod.images
            : Array.isArray(prod?.images)
            ? prod?.images?.[0]
            : "");

        return {
          id: productId,
          name: it.name || prod?.name || "",
          price: Number(it.price ?? prod?.price ?? 0),
          originalPrice: Number(it.originalPrice ?? it.price ?? prod?.price ?? 0),
          discountPercent: Number(it.discountPercent ?? 0),
          gst: Number(it.gst ?? 0),
          priceIncludesGst: it.priceIncludesGst ?? true,
          isCustomized: Boolean(it.isCustomized ?? false),
          image: image || "",
          variantId: it.variantId || null,
          attributes: it.attributes || {},
          quantity: Number(it.quantity || 1),
          cartItemId: it._id,
        } as CartItem;
      })
      .filter(Boolean) as CartItem[];
  }, []);

  const toServerPayload = useCallback((localItems: CartItem[]) => {
    return (localItems || []).map((it) => ({
      productId: it.id,
      variantId: it.variantId || null,
      attributes: it.attributes || {},
      name: it.name,
      price: it.price,
      originalPrice: it.originalPrice,
      discountPercent: it.discountPercent,
      gst: it.gst,
      priceIncludesGst: it.priceIncludesGst ?? true,
      isCustomized: it.isCustomized,
      image: it.image,
      quantity: it.quantity,
    }));
  }, []);

  const loadServerCart = useCallback(async () => {
    if (!token) return;

    const data = await apiFetch("/cart", { method: "GET" });
    const serverItems: ServerCartItem[] = Array.isArray(data?.items) ? data.items : [];
    const normalized = normalizeServerItems(serverItems);

    setItems(normalized);
    persistLocal(normalized);
  }, [apiFetch, normalizeServerItems, persistLocal, token]);

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

      const mergedServerItems: ServerCartItem[] = Array.isArray(merged?.items)
        ? merged.items
        : [];

      const normalized = mergedServerItems.length
        ? normalizeServerItems(mergedServerItems)
        : localItems;

      setItems(normalized);
      persistLocal(normalized);
    } catch {
      await apiFetch("/cart", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await loadServerCart();
    }
  }, [apiFetch, loadServerCart, normalizeServerItems, toServerPayload, token]);

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

  const syncNow = useCallback(async () => {
    if (!token) return;

    await apiFetch("/cart", {
      method: "PUT",
      body: JSON.stringify({ items: toServerPayload(items) }),
    });
  }, [apiFetch, items, token, toServerPayload]);

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

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity">, qty: number = 1) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (!newItem.id) {
        toast({
          title: "Error",
          description: "ProductId (_id) is missing",
          variant: "destructive",
        });
        return;
      }

      const quantityToAdd = Math.max(1, Number(qty) || 1);

      setItems((prev) => {
        const normalizedItem = {
          ...newItem,
          priceIncludesGst: newItem.priceIncludesGst ?? true,
          quantity: 1,
        } as CartItem;

        const matchKey = getItemMatchKey(normalizedItem);
        const idx = prev.findIndex((it) => getItemMatchKey(it) === matchKey);

        if (idx !== -1) {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            priceIncludesGst: copy[idx].priceIncludesGst ?? true,
            quantity: copy[idx].quantity + quantityToAdd,
          };
          return copy;
        }

        return [
          ...prev,
          {
            ...newItem,
            priceIncludesGst: newItem.priceIncludesGst ?? true,
            quantity: quantityToAdd,
          },
        ];
      });

      toast({
        title: "Added to cart",
        description: `${newItem.name} (x${quantityToAdd}) added.`,
      });
    },
    [isAuthenticated, navigate]
  );

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.filter((item) => {
        const matchKey = getItemMatchKey(item);
        const matches = (item.cartItemId && item.cartItemId === itemId) || matchKey === itemId;
        return !matches;
      })
    );
  }, []);

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      const q = Math.max(0, Number(quantity) || 0);

      if (q < 1) {
        removeItem(itemId);
        return;
      }

      setItems((prev) => {
        const idx = prev.findIndex((item) => {
          const matchKey = getItemMatchKey(item);
          return (item.cartItemId && item.cartItemId === itemId) || matchKey === itemId;
        });

        if (idx === -1) return prev;

        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          priceIncludesGst: copy[idx].priceIncludesGst ?? true,
          quantity: q,
        };

        return copy;
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);

    if (token) {
      apiFetch("/cart", {
        method: "PUT",
        body: JSON.stringify({ items: [] }),
      }).catch(() => {});
    }
  }, [apiFetch, token]);

  const totalItems = useMemo(
    () => items.reduce((s, i) => s + Number(i.quantity || 0), 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce((s, i) => {
        const lineTotal = Number(i.price || 0) * Number(i.quantity || 1);
        return s + lineTotal;
      }, 0),
    [items]
  );

  const totalGst = useMemo(
    () => items.reduce((s, i) => s + calculateLineGst(i), 0),
    [items]
  );

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
        totalGst,
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