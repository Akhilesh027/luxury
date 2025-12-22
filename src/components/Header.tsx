import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, User, Heart, ShoppingBag, Menu, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { menuData, cities } from "@/data/siteData";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import MegaMenu from "./MegaMenu";
import MobileDrawer from "./MobileDrawer";
import LocationPanel from "./LocationPanel";
import UserPanel from "./UserPanel";
import CartPanel from "./CartPanel";

type MenuKey = "catalog" | "concepts" | "rooms";

const Header = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("catalog");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showSecondRow, setShowSecondRow] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { totalItems } = useCart();
  const { favorites } = useFavorites();

  const handleMenuClick = useCallback((menu: MenuKey) => {
    if (activeMenu === menu) {
      setShowSecondRow(!showSecondRow);
    } else {
      setActiveMenu(menu);
      setShowSecondRow(true);
    }
    setHoveredItem(null);
  }, [activeMenu, showSecondRow]);

  const currentMenuData = menuData[activeMenu];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        {/* Top Row */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Section */}
            <div className="flex items-center gap-8">
              <a href="/" className="text-2xl lg:text-3xl font-heading font-bold text-gold tracking-wider">
                JS GALLOR
              </a>

              {/* Desktop Navigation */}
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

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search */}
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

              {/* Icon Buttons */}
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

              {/* Mobile Menu Button */}
              <Button
                variant="icon"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Second Row - Sub Navigation */}
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
                  {currentMenuData.items.map((item) => (
                    <button
                      key={item}
                      className={`text-sm transition-colors duration-200 hover:text-gold ${
                        hoveredItem === item ? "text-gold" : "text-muted-foreground"
                      }`}
                      onMouseEnter={() => setHoveredItem(item)}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mega Menu */}
        <AnimatePresence>
          {hoveredItem && showSecondRow && currentMenuData.megas[hoveredItem] && (
            <MegaMenu
              data={currentMenuData.megas[hoveredItem]}
              onClose={() => setHoveredItem(null)}
            />
          )}
        </AnimatePresence>
      </header>

      {/* Panels */}
      <AnimatePresence>
        {locationOpen && <LocationPanel onClose={() => setLocationOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {userOpen && <UserPanel onClose={() => setUserOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {cartOpen && <CartPanel onClose={() => setCartOpen(false)} />}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Header;
