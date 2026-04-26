import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "./contexts/auth-context";
import { useEffect } from "react";

import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ProfilePage from "./pages/profile";
import AuthPage from "./components/Authpage";
import ResetPassword from "./components/resetpassword";

// Legal page imports
import About from "./pages/legal/About.tsx";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsConditions from "./pages/legal/TermsConditions";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ShippingPolicy from "./pages/legal/ShippingPolicy";
import DeliveryPolicy from "./pages/legal/DeliveryPolicy";
import WarrantyRefund from "./pages/legal/WarrantyRefund";
import ReplacementPolicy from "./pages/legal/ReplacementPolicy";
import ShippingInfo from "./pages/legal/ShippingInfo";
import FAQ from "./pages/legal/FAQ";
import Contact from "./pages/legal/Contact";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Floating WhatsApp component with pre‑filled quotation request
const FloatingWhatsApp = () => {
  const whatsappNumber = "917075848516";
  const message = encodeURIComponent(
    "Hello, I would like to request a customized quotation for your products. " +
    "Please provide me with the best offer based on my requirements. Thank you!"
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 rounded-full p-3 shadow-lg hover:bg-green-600 transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      aria-label="Request customized quotation on WhatsApp"
    >
      <img
        src="https://img.icons8.com/color/48/000000/whatsapp--v1.png"
        alt="WhatsApp"
        className="w-6 h-6 md:w-7 md:h-7"
      />
    </a>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FavoritesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartProvider>
              <ScrollToTop />
              <FloatingWhatsApp />
              <Routes>
                {/* Main shop routes */}
                <Route path="/" element={<Index />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/:categorySlug" element={<Catalog />} />
                <Route path="/catalog/:categorySlug/:subCategorySlug" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetails />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Auth routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Legal & policy pages */}
                <Route path="/about" element={<About />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/delivery-policy" element={<DeliveryPolicy />} />
                <Route path="/warranty-refund" element={<WarrantyRefund />} />
                <Route path="/replacement-policy" element={<ReplacementPolicy />} />
                <Route path="/shipping-info" element={<ShippingInfo />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />

                {/* 404 catch‑all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </BrowserRouter>
        </TooltipProvider>
      </FavoritesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;