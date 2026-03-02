import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, User, Heart, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import MegaMenu from "./MegaMenu";
import MobileDrawer from "./MobileDrawer";
import LocationPanel from "./LocationPanel";
import UserPanel from "./UserPanel";
import CartPanel from "./CartPanel";
import logo from "../../public/JSGALORE.png";

type MenuKey = "catalog" | "concepts" | "rooms";

const API_BASE = "https://api.jsgallor.com/api";

// ✅ set current website segment here
const WEBSITE_SEGMENT: "all" | "luxury" = "luxury";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  segment: string;
  parentId: string | null;
  status: "active" | "hidden" | "disabled";
  order: number;
  showOnWebsite: boolean;
  showInNavbar: boolean;
  featured: boolean;
  allowProducts: boolean;
  productCount: number;
};

type CategoriesResponse = {
  success: boolean;
  data: {
    items: CategoryItem[];
    stats?: any;
    page?: number;
    limit?: number;
    totalItems?: number;
  };
};

async function apiGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // ✅ IMPORTANT: remove credentials to avoid strict CORS
    // credentials: "include",
    signal,
  });

  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

function buildMegaMenuData(parent: CategoryItem, children: CategoryItem[]) {
  return {
    title: parent.name,
    columns: [
      {
        heading: "Sub Categories",
        links: children.map((c) => ({
          label: c.name,
href: `/catalog/${parent.slug}/${c.slug}`        })),
      },
    ],
  };
}

const Header = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("catalog");
  const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
  const [showSecondRow, setShowSecondRow] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { totalItems } = useCart();
  const { favorites } = useFavorites();

  // ✅ realtime categories
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleMenuClick = useCallback(
    (menu: MenuKey) => {
      if (activeMenu === menu) setShowSecondRow((v) => !v);
      else {
        setActiveMenu(menu);
        setShowSecondRow(true);
      }
      setHoveredParentId(null);
    },
    [activeMenu]
  );

  // ✅ fetch categories
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await apiGet<CategoriesResponse>(
          `${API_BASE}/admin/categories?segment=all&status=all&level=all&sort=order&page=1&limit=200`,
          ac.signal
        );

        setItems(res?.data?.items || []);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // ✅ segment allow list (luxury website shows: all + luxury)
  const allowedSegments = useMemo(() => {
    if (WEBSITE_SEGMENT === "all") return ["all"];
    return ["all", WEBSITE_SEGMENT];
  }, [WEBSITE_SEGMENT]);

  // ✅ apply filters based on your data fields
  const filteredItems = useMemo(() => {
    return (items || []).filter((x) => {
      const seg = String(x.segment || "all").toLowerCase();
      return x.status === "active" && x.showOnWebsite === true && allowedSegments.includes(seg);
    });
  }, [items, allowedSegments]);

  // ✅ navbar parents
  const parents = useMemo(() => {
    return filteredItems
      .filter((x) => x.parentId === null && x.showInNavbar === true)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [filteredItems]);

  // ✅ children map
  const childrenByParent = useMemo(() => {
    const map = new Map<string, CategoryItem[]>();
    for (const x of filteredItems) {
      if (!x.parentId) continue;
      const arr = map.get(x.parentId) || [];
      arr.push(x);
      map.set(x.parentId, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      map.set(k, arr);
    }
    return map;
  }, [filteredItems]);

  const hoveredParent = useMemo(() => {
    return parents.find((p) => p.id === hoveredParentId) || null;
  }, [parents, hoveredParentId]);

  const hoveredChildren = useMemo(() => {
    if (!hoveredParentId) return [];
    return childrenByParent.get(hoveredParentId) || [];
  }, [childrenByParent, hoveredParentId]);

  const megaData = useMemo(() => {
    if (!hoveredParent) return null;
    return buildMegaMenuData(hoveredParent, hoveredChildren);
  }, [hoveredParent, hoveredChildren]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        {/* Top Row */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-8">
              <img src={logo} alt="JSGALORE" className="h-8 lg:h-10 object-contain" />

              <a href="/" className="text-2xl lg:text-3xl font-heading font-bold text-gold tracking-wider">
                JS GALLOR
              </a>

              <nav className="hidden lg:flex items-center gap-1">
                {(["catalog", "concepts", "rooms"] as MenuKey[]).map((menu) => (
                  <Button
                    key={menu}
                    variant="nav"
                    className={`px-4 py-2 capitalize ${activeMenu === menu && showSecondRow ? "text-gold" : ""}`}
                    onClick={() => handleMenuClick(menu)}
                  >
                    {menu === "rooms" ? "Select a room" : menu}
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        activeMenu === menu && showSecondRow ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-2 border border-border/50">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="I want to find..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-40 lg:w-56 placeholder:text-muted-foreground"
                />
              </div>

              <Button
                variant="icon"
                size="icon"
                onClick={() => {
                  setLocationOpen(!locationOpen);
                  setUserOpen(false);
                  setCartOpen(false);
                }}
                className={locationOpen ? "text-gold" : ""}
              >
                <MapPin className="h-5 w-5" />
              </Button>

              <Button
                variant="icon"
                size="icon"
                onClick={() => {
                  setUserOpen(!userOpen);
                  setLocationOpen(false);
                  setCartOpen(false);
                }}
                className={userOpen ? "text-gold" : ""}
              >
                <User className="h-5 w-5" />
              </Button>

              <Link to="/favorites">
                <Button variant="icon" size="icon" className="hidden sm:flex relative">
                  <Heart className="h-5 w-5" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Button
                variant="icon"
                size="icon"
                onClick={() => {
                  setCartOpen(!cartOpen);
                  setLocationOpen(false);
                  setUserOpen(false);
                }}
                className={`relative ${cartOpen ? "text-gold" : ""}`}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Button>

              <Button variant="icon" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <AnimatePresence>
          {showSecondRow && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block border-t border-border/30 overflow-hidden"
            >
              <div className="container mx-auto px-4">
                <nav className="flex items-center gap-6 py-3">
                  {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
                  {err && <span className="text-sm text-red-400">{err}</span>}

                  {!loading &&
                    !err &&
                    parents.map((p) => (
                      <button
                        key={p.id}
                        className={`text-sm transition-colors duration-200 hover:text-gold ${
                          hoveredParentId === p.id ? "text-gold" : "text-muted-foreground"
                        }`}
                        onMouseEnter={() => setHoveredParentId(p.id)}
                      >
                        {p.name}
                      </button>
                    ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mega Menu */}
        <AnimatePresence>
          {hoveredParentId && showSecondRow && megaData && (
            <MegaMenu data={megaData} onClose={() => setHoveredParentId(null)} />
          )}
        </AnimatePresence>
      </header>

      {/* Panels */}
      <AnimatePresence>{locationOpen && <LocationPanel onClose={() => setLocationOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{userOpen && <UserPanel onClose={() => setUserOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{cartOpen && <CartPanel onClose={() => setCartOpen(false)} />}</AnimatePresence>

      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Header;