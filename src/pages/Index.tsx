import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import PopularCategories from "@/components/PopularCategories";
import NewProducts from "@/components/NewProducts";
import IdeasSection from "@/components/IdeasSection";
import RoomsSection from "@/components/RoomsSection";
import Footer from "@/components/Footer";

const Index = () => {
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
    </div>
  );
};

export default Index;
