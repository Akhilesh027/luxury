import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context"; // adjust path
import { PhoneNumberModal } from "@/components/PhoneNumberModal";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import PopularCategories from "@/components/PopularCategories";
import NewProducts from "@/components/NewProducts";
import IdeasSection from "@/components/IdeasSection";
import RoomsSection from "@/components/RoomsSection";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Show modal when authenticated, user has no phone, and not skipped this session
  useEffect(() => {
    if (isAuthenticated && user && !user.phone && !sessionStorage.getItem("skipPhoneModalLuxury")) {
      setShowPhoneModal(true);
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <PopularCategories />
        <NewProducts />
        <IdeasSection />
        <RoomsSection />
      </main>
      <Footer />
      <PhoneNumberModal open={showPhoneModal} onOpenChange={setShowPhoneModal} />
    </div>
  );
};

export default Index;