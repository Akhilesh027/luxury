import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  Gem,
  MessageCircle,
  PhoneCall,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  q: string;
  a: string;
  category: "customization" | "delivery" | "warranty" | "materials" | "experience";
}

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "customization", label: "Bespoke & Customization", icon: Sparkles },
  { id: "materials", label: "Materials & Craft", icon: Gem },
  { id: "delivery", label: "Delivery & Installation", icon: Truck },
  { id: "warranty", label: "Warranty & Guarantee", icon: ShieldCheck },
  { id: "experience", label: "Experience Centers", icon: PhoneCall },
] as const;

const FAQ_DATA: FAQItem[] = [
  {
    category: "customization",
    q: "Can I customize the dimensions, finishes, and fabrics of your luxury pieces?",
    a: "Absolutely. Every creation in our Celestia Living collection can be customized. You can select exact millimeter dimensions, handpick imported Italian marble slabs, choose from over 60 exotic natural wood veneers, and select premium top-grain Italian leathers and designer performance fabrics.",
  },
  {
    category: "customization",
    q: "Can I schedule a private one-on-one consultation with your chief architect?",
    a: "Yes. We arrange private, dedicated consultation sessions at our Banjara Hills and Madhapur studios, or directly at your site for luxury villas and penthouses. Our architects will curate mood boards, 3D renders, and finish palettes tailored to your space.",
  },
  {
    category: "materials",
    q: "What types of materials and hardware do you use?",
    a: "We exclusively source premium grade raw materials: calibrated marine-grade BWR/BWP plywood, authentic Italian and Spanish marbles, book-matched exotic veneers, PVD-coated titanium stainless steel, and certified German architectural hardware from Blum and Hettich.",
  },
  {
    category: "materials",
    q: "How should I maintain and care for Italian marble and fine veneers?",
    a: "All natural stones are treated with an invisible hydrophobic nano-sealant prior to delivery. We recommend cleaning with a soft microfiber cloth and pH-neutral cleaners. Avoid abrasive sponges, acidic substances (lemon juice, vinegar), and direct high-temperature contact.",
  },
  {
    category: "delivery",
    q: "What does your White-Glove Delivery and Assembly include?",
    a: "Our signature White-Glove Delivery is executed by certified factory technicians. We handle transport in specialized air-suspension vehicles, room-of-choice placement, complete precision assembly, acoustic dampening leveling, and removal of all packaging debris.",
  },
  {
    category: "delivery",
    q: "What is the typical production and delivery lead time?",
    a: "In-stock luxury catalog pieces are dispatched within 3–7 business days. Custom bespoke commissions involving tailored dimensions, rare veneers, or custom upholstery generally require 3 to 5 weeks from technical drawing sign-off.",
  },
  {
    category: "warranty",
    q: "What is the warranty coverage on luxury furniture and modular interiors?",
    a: "We offer up to a 10-year comprehensive structural warranty on core plywood, internal frameworks, and joinery. All German soft-close hinges, drawer runners, and lift systems carry a lifetime functional replacement warranty.",
  },
  {
    category: "warranty",
    q: "What happens if a piece arrives damaged or with transit blemishes?",
    a: "Every shipment undergoes a joint inspection between our installation team and the client. In the rare event of transit damage or manufacturing imperfections, our concierge immediately initiates an expedited replacement or on-site restoration at zero cost to you.",
  },
  {
    category: "experience",
    q: "Can I inspect full-scale mockups and sample finishes before ordering?",
    a: "Yes. Our Hyderabad Experience Center showcases full-scale modular walk-in wardrobes, island kitchens, living suites, and an extensive material atelier featuring raw marble slabs, leather swatches, and veneer flitches.",
  },
  {
    category: "experience",
    q: "Where is your flagship experience center located?",
    a: "Our prime studio is situated at Road No. 1, Bagayath Layout, 3rd Floor, Plot 288, Uppal, Hyderabad, Telangana 500039. We also host private consultations across Banjara Hills and Jubilee Hills upon appointment.",
  },
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleWhatsAppInquiry = () => {
    const msg = encodeURIComponent(
      "Hello JS GALLOR Concierge, I have an inquiry regarding your luxury furniture and bespoke services."
    );
    window.open(`https://wa.me/918143678491?text=${msg}`, "_blank");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#111111] via-[#181612] to-[#111111] text-[#f4ecd8]">
        {/* Breadcrumb */}
        <nav className="border-b border-[#7a5a1e]/30 bg-black/40 py-3 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-xs text-[#d4af37]/80">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Frequently Asked Questions</span>
            </div>
          </div>
        </nav>

        {/* Hero Banner */}
        <section className="relative overflow-hidden py-16 md:py-20 border-b border-[#7a5a1e]/30 text-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="container mx-auto px-4 relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Client Concierge & Advisory</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-wide">
              Frequently Asked Questions
            </h1>

            <p className="text-sm sm:text-base text-[#e8d5b5]/80 font-light leading-relaxed">
              Discover everything you need to know about our bespoke handcrafted furniture,
              white-glove delivery, warranties, and exclusive design atelier consultations.
            </p>

            {/* Search Input */}
            <div className="pt-4 max-w-lg mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-[#d4af37]/80 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search questions (e.g., warranty, custom size, marble)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border border-[#d4af37]/30 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <section className="py-6 border-b border-[#7a5a1e]/20 bg-black/20 sticky top-16 lg:top-20 z-30 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
              {FAQ_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenIndex(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-[#d4af37] text-black font-semibold shadow-lg shadow-[#d4af37]/20"
                        : "bg-white/5 text-[#d0c6b4] hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Accordion List */}
        <section className="py-12 md:py-16 container mx-auto px-4 max-w-4xl">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-white/5 rounded-2xl border border-white/10 p-8">
              <HelpCircle className="w-10 h-10 text-[#d4af37]/50 mx-auto" />
              <h3 className="text-lg font-heading font-semibold text-white">
                No matching questions found
              </h3>
              <p className="text-xs text-[#d0c6b4]">
                Try adjusting your search keywords or browse all categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-2 text-xs text-[#d4af37] underline hover:text-[#f3deb0]"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl transition-all duration-300 border ${
                      isOpen
                        ? "bg-[#1f1c16] border-[#d4af37]/50 shadow-lg shadow-black/40"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(idx)}
                      className="w-full p-6 text-left flex items-start justify-between gap-4 focus:outline-none"
                    >
                      <span className="font-heading font-semibold text-sm sm:text-base text-[#f4ecd8] leading-snug">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#d4af37] shrink-0 mt-0.5 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-[#d0c6b4] leading-relaxed border-t border-white/5">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Need More Assistance Banner */}
          <div className="mt-16 p-8 md:p-10 rounded-2xl bg-gradient-to-r from-[#2a2215] via-[#1a1710] to-[#2a2215] border border-[#7a5a1e]/40 text-center space-y-4 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
              Have a Specific Architectural or Bespoke Request?
            </h3>
            <p className="text-xs sm:text-sm text-[#d0c6b4] max-w-xl mx-auto leading-relaxed">
              Our dedicated design specialists and luxury furniture concierges are available
              for private consultations, architectural blueprint assessments, and custom material selections.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={handleWhatsAppInquiry}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wider uppercase transition-colors shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d4af37] hover:bg-[#bfa034] text-black text-xs font-bold tracking-wider uppercase transition-colors shadow-lg"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Book Showroom Visit</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}