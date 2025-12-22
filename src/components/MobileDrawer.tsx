import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuData } from "@/data/siteData";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type MenuKey = "catalog" | "concepts" | "rooms";

const MobileDrawer = ({ isOpen, onClose }: MobileDrawerProps) => {
  const [expandedMenu, setExpandedMenu] = useState<MenuKey | null>(null);

  const toggleMenu = (menu: MenuKey) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

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
                            {menuData[menu].items.map((item) => (
                              <a
                                key={item}
                                href="#"
                                className="block py-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                              >
                                {item}
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Shop Now Button */}
              <Button variant="gold" className="w-full mt-8" size="lg">
                Shop Now
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
