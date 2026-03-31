// Header.tsx – updated to navigate to /auth or /profile
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; // add useNavigate
import { Search, MapPin, User, Heart, ShoppingBag, Menu, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/auth-context"; // import useAuth
import MegaMenu from "./MegaMenu";
import MobileDrawer from "./MobileDrawer";
import LocationPanel from "./LocationPanel";
import CartPanel from "./CartPanel";
import logo from "../../public/JSGALORE.png";

type MenuKey = "catalog" | "concepts" | "rooms";

const API_BASE = "http://localhost:5000/api";
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
          href: `/catalog/${parent.slug}/${c.slug}`,
        })),
      },
    ],
  };
}

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // get authentication state
  const [activeMenu, setActiveMenu] = useState<MenuKey>("catalog");
  const [hoveredParentId, setHoveredParentId] = useState<string | null>(null);
  const [showSecondRow, setShowSecondRow] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ city: string; pin: string } | null>(null);

  const { totalItems } = useCart();
  const { favorites } = useFavorites();

  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleUserClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  };

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

  const allowedSegments = useMemo(() => {
    if (WEBSITE_SEGMENT === "all") return ["all"];
    return ["all", WEBSITE_SEGMENT];
  }, []);

  const filteredItems = useMemo(() => {
    return (items || []).filter((x) => {
      const seg = String(x.segment || "all").toLowerCase();
      return x.status === "active" && x.showOnWebsite === true && allowedSegments.includes(seg);
    });
  }, [items, allowedSegments]);

  const parents = useMemo(() => {
    return filteredItems
      .filter((x) => x.parentId === null && x.showInNavbar === true)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [filteredItems]);

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
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-black/20 bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] shadow-lg text-white w-full">
        {/* Top Row */}
        <div className="flex items-center justify-between px-4 lg:px-6 h-16 lg:h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <img src={logo} alt="JSGALORE" className="h-8 lg:h-10 object-contain" />
            <a
              href="/"
              className="hidden sm:block text-xl lg:text-2xl font-heading font-bold tracking-wider text-white ml-2"
            >
              JSGALLOR
            </a>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 border border-white/20">
              <Search className="h-4 w-4 text-white shrink-0" />
              <input
                type="search"
                placeholder="I want to find..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/70 text-white"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="hidden lg:flex items-center gap-1">
            {(["catalog"] as MenuKey[]).map((menu) => (
              <Button
                key={menu}
                variant="nav"
                className={`px-4 py-2 capitalize text-white hover:text-yellow-200 ${
                  activeMenu === menu && showSecondRow ? "text-yellow-200" : ""
                }`}
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

            {/* External links as buttons (using asChild) */}
            <Button asChild className="bg-[#6f5424] text-white hover:bg-[#5c451e] transition-colors">
              <a
                href="https://essentialstudio.jsgallor.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Essential Studio
              </a>
            </Button>

            <Button asChild className="bg-[#6f5424] text-white hover:bg-[#5c451e] transition-colors">
              <a
                href="https://signaturespaces.jsgallor.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Signature Spaces
              </a>
            </Button>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Location */}
            <div className="relative">
              <Button
                variant="icon"
                size="icon"
                onClick={() => {
                  setLocationOpen(!locationOpen);
                  setCartOpen(false);
                }}
                className={`${locationOpen ? "text-yellow-200" : "text-white"} hover:text-yellow-200`}
              >
                <MapPin className="h-5 w-5" />
              </Button>
              {userLocation && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] bg-black text-white px-1 rounded-full whitespace-nowrap">
                  {userLocation.city || userLocation.pin}
                </span>
              )}
            </div>

            {/* User – now navigates instead of opening panel */}
            <Button
              variant="icon"
              size="icon"
              onClick={handleUserClick}
              className="text-white hover:text-yellow-200"
            >
              <User className="h-5 w-5" />
            </Button>

            {/* Favorites */}
            <Link to="/favorites">
              <Button variant="icon" size="icon" className="hidden sm:flex relative text-white hover:text-yellow-200">
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Button
              variant="icon"
              size="icon"
              onClick={() => {
                setCartOpen(!cartOpen);
                setLocationOpen(false);
              }}
              className={`relative ${cartOpen ? "text-yellow-200" : "text-white"} hover:text-yellow-200`}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="icon"
              size="icon"
              className="lg:hidden text-white hover:text-yellow-200"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Second Row (category links) */}
        <AnimatePresence>
          {showSecondRow && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block border-t border-white/20 overflow-hidden"
            >
              <div className="px-4 lg:px-6">
                <nav className="flex items-center gap-6 py-3 text-white">
                  {loading && <span className="text-sm text-white/70">Loading...</span>}
                  {err && <span className="text-sm text-red-300">{err}</span>}
                  {!loading &&
                    !err &&
                    parents.map((p) => (
                      <button
                        key={p.id}
                        className={`text-sm transition-colors duration-200 hover:text-yellow-200 ${
                          hoveredParentId === p.id ? "text-yellow-200" : "text-white"
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
      <AnimatePresence>
        {locationOpen && (
          <LocationPanel
            onClose={() => setLocationOpen(false)}
            onLocationSelect={(city, pin) => setUserLocation({ city, pin })}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{cartOpen && <CartPanel onClose={() => setCartOpen(false)} />}</AnimatePresence>

      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        categories={parents}
        childrenByParent={childrenByParent}
        loading={loading}
        error={err}
      />
    </>
  );
};

export default Header;