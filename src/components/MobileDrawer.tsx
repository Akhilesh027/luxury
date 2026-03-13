import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { CategoryItem } from "./Header";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  childrenByParent: Map<string, CategoryItem[]>;
  loading?: boolean;
  error?: string | null;
}

type MenuKey = "catalog" | "concepts" | "rooms";

const MobileDrawer = ({
  isOpen,
  onClose,
  categories,
  childrenByParent,
  loading = false,
  error = null,
}: MobileDrawerProps) => {
  const [expandedMenu, setExpandedMenu] = useState<MenuKey | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const toggleMenu = (menu: MenuKey) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
    setExpandedParent(null);
  };

  const toggleParent = (parentId: string) => {
    setExpandedParent(expandedParent === parentId ? null : parentId);
  };

  // you can later improve this with a real "menuType" field from backend
  const groupedMenus = useMemo(() => {
    return {
      catalog: categories,
      concepts: categories,
      rooms: categories,
    };
  }, [categories]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-2xl font-heading font-bold text-gold">JS GALLOR</span>
                <Button variant="icon" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Accordions */}
              <div className="space-y-4">
                {(["catalog", "concepts", "rooms"] as MenuKey[]).map((menu) => (
                  <div key={menu} className="border-b border-border/50 pb-4">
                    <button
                      onClick={() => toggleMenu(menu)}
                      className="flex items-center justify-between w-full py-2 text-left"
                    >
                      <span className="font-medium capitalize">
                        {menu === "rooms" ? "Select a room" : menu}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedMenu === menu ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedMenu === menu && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2 pl-4 space-y-2">
                            {loading && (
                              <div className="py-2 text-sm text-muted-foreground">
                                Loading categories...
                              </div>
                            )}

                            {error && (
                              <div className="py-2 text-sm text-red-400">
                                {error}
                              </div>
                            )}

                            {!loading &&
                              !error &&
                              groupedMenus[menu].map((parent) => {
                                const children = childrenByParent.get(parent.id) || [];
                                const isParentOpen = expandedParent === parent.id;

                                return (
                                  <div key={parent.id} className="rounded-md">
                                    {children.length > 0 ? (
                                      <>
                                        <button
                                          onClick={() => toggleParent(parent.id)}
                                          className="flex items-center justify-between w-full py-2 text-left text-sm text-muted-foreground hover:text-gold transition-colors"
                                        >
                                          <span>{parent.name}</span>
                                          <ChevronDown
                                            className={`h-4 w-4 transition-transform duration-200 ${
                                              isParentOpen ? "rotate-180" : ""
                                            }`}
                                          />
                                        </button>

                                        <AnimatePresence>
                                          {isParentOpen && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="pl-4 space-y-1">
                                                <Link
                                                  to={`/catalog/${parent.slug}`}
                                                  onClick={onClose}
                                                  className="block py-2 text-sm text-gold hover:opacity-80 transition-opacity"
                                                >
                                                  View All {parent.name}
                                                </Link>

                                                {children.map((child) => (
                                                  <Link
                                                    key={child.id}
                                                    to={`/catalog/${parent.slug}/${child.slug}`}
                                                    onClick={onClose}
                                                    className="block py-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                                                  >
                                                    {child.name}
                                                  </Link>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </>
                                    ) : (
                                      <Link
                                        to={`/catalog/${parent.slug}`}
                                        onClick={onClose}
                                        className="block py-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                                      >
                                        {parent.name}
                                      </Link>
                                    )}
                                  </div>
                                );
                              })}

                            {!loading && !error && groupedMenus[menu].length === 0 && (
                              <div className="py-2 text-sm text-muted-foreground">
                                No categories found
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Shop Now Button */}
              <Link to="/catalog" onClick={onClose}>
                <Button variant="gold" className="w-full mt-8" size="lg">
                  Shop Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;