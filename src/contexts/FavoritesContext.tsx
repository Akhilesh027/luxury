import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

/* ================= TYPES ================= */

export interface FavoriteItem {
  id: string;          // product ID (MongoDB _id)
  name: string;
  price: number;
  image: string;
  type: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
}

/* ================= CONTEXT ================= */

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/* ================= CONFIG ================= */

const API_BASE = "https://api.jsgallor.com/api/luxury";
const WISHLIST_KEY = "luxury_wishlist";

/* ================= HELPERS ================= */

function safeParse<T>(v: string | null): T | null {
  if (!v) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return null;
  }
}

/* ================= PROVIDER ================= */

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();

  const [favorites, setFavorites] = useState<FavoriteItem[]>(
    () => safeParse<FavoriteItem[]>(localStorage.getItem(WISHLIST_KEY)) || []
  );

  /* ---------- API helper ---------- */
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
      if (!res.ok) throw new Error(data?.message || "Request failed");
      // Backend returns { success: true, wishlist: [...] }
      if (!data.success) throw new Error(data.message || "Operation failed");
      return data;
    },
    [token]
  );

  /* ---------- Load wishlist from backend ---------- */
  const loadWishlist = useCallback(async () => {
    if (!token) return;

    try {
      const data = await apiFetch("/wishlist", { method: "GET" });
      // The backend returns `wishlist` array where each item has:
      // productId, name, price, image, type, addedAt
      const list: FavoriteItem[] = (data.wishlist || []).map((w: any) => ({
        id: w.productId,        // product ID (string)
        name: w.name,
        price: w.price,
        image: w.image,
        type: w.type,
      }));

      setFavorites(list);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    } catch (err) {
      console.error("Failed to load wishlist", err);
      // silent fail, keep local data
    }
  }, [apiFetch, token]);

  /* ---------- Load on login ---------- */
  useEffect(() => {
    if (isAuthenticated && token) {
      loadWishlist();
    }
  }, [isAuthenticated, token, loadWishlist]);

  /* ---------- Add ---------- */
  const addFavorite = useCallback(
    async (item: FavoriteItem) => {
      if (favorites.some((f) => f.id === item.id)) return;

      // Optimistically update local state
      setFavorites((prev) => {
        const next = [...prev, item];
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
        return next;
      });

      if (!token) return;

      try {
        const data = await apiFetch("/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId: item.id }),
        });
        // Sync with server response (full updated wishlist)
        const serverList = (data.wishlist || []).map((w: any) => ({
          id: w.productId,
          name: w.name,
          price: w.price,
          image: w.image,
          type: w.type,
        }));
        setFavorites(serverList);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(serverList));
      } catch (err) {
        // Rollback optimistic update
        setFavorites((prev) => prev.filter((f) => f.id !== item.id));
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(favorites.filter((f) => f.id !== item.id)));
        toast({
          title: "Wishlist error",
          description: err instanceof Error ? err.message : "Failed to add to wishlist",
          variant: "destructive",
        });
      }
    },
    [favorites, apiFetch, token]
  );

  /* ---------- Remove ---------- */
  const removeFavorite = useCallback(
    async (id: string) => {
      // Optimistically update
      setFavorites((prev) => {
        const next = prev.filter((item) => item.id !== id);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
        return next;
      });

      if (!token) return;

      try {
        const data = await apiFetch(`/wishlist/${id}`, { method: "DELETE" });
        // Sync with server response
        const serverList = (data.wishlist || []).map((w: any) => ({
          id: w.productId,
          name: w.name,
          price: w.price,
          image: w.image,
          type: w.type,
        }));
        setFavorites(serverList);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(serverList));
      } catch (err) {
        // Rollback: re-fetch current state from server (or restore previous)
        await loadWishlist(); // re-fetch to restore correct state
        toast({
          title: "Wishlist error",
          description: err instanceof Error ? err.message : "Failed to remove from wishlist",
          variant: "destructive",
        });
      }
    },
    [apiFetch, token, loadWishlist]
  );

  /* ---------- Checks ---------- */
  const isFavorite = useCallback(
    (id: string) => favorites.some((item) => item.id === id),
    [favorites]
  );

  /* ---------- Toggle ---------- */
  const toggleFavorite = useCallback(
    async (item: FavoriteItem) => {
      if (isFavorite(item.id)) {
        await removeFavorite(item.id);
      } else {
        await addFavorite(item);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};