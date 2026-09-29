import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle, Quote, ShieldCheck, Truck, MapPin, Gem, Award } from "lucide-react";

export interface LuxuryReview {
  id: string;
  clientName: string;
  locality: string;
  city: string;
  furnitureBought: string;
  craftsmanship: string;
  rating: number;
  deliveryDate: string;
  quote: string;
  avatar: string;
}

const LUXURY_TESTIMONIALS: LuxuryReview[] = [
  {
    id: "lr-1",
    clientName: "Mr. Jayanth & Radhika Rao",
    locality: "Banjara Hills, Hyderabad",
    city: "Hyderabad",
    furnitureBought: "Calacatta Gold Italian Marble 8-Seater Dining Suite",
    craftsmanship: "Bespoke Italian Natural Marble & 24k Champagne PVD Base",
    rating: 5,
    deliveryDate: "White-Glove VIP Delivery",
    quote: "The book-matched Calacatta marble slab is breathtaking in person. Every bevel, seam, and brass inlay reflects master-level Italian craftsmanship. Celestia Living turned our dining pavilion into an art gallery.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "lr-2",
    clientName: "Vikramaditya Singhania",
    locality: "Lavelle Road, Bangalore",
    city: "Bangalore",
    furnitureBought: "Handcrafted Top-Grain Leather Chesterfield Sectional",
    craftsmanship: "Full Italian Nappa Leather & Solid Mahogany Framework",
    rating: 5,
    deliveryDate: "VIP White-Glove Handover",
    quote: "The deep-button tufting and rich patina of the Italian Nappa leather is world-class. It exudes absolute old-money sophistication. The seating comfort and lumbar support are unmatched.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "lr-3",
    clientName: "Sunita & Dr. Anand Goud",
    locality: "Jubilee Hills, Hyderabad",
    city: "Hyderabad",
    furnitureBought: "Royal Emperor King Suite with Integrated Smoked Oak Nightstands",
    craftsmanship: "Smoked Eucalyptus Veneer, Brushed Gold & Velvet Upholstery",
    rating: 5,
    deliveryDate: "White-Glove VIP Delivery",
    quote: "From the initial 3D visualization to the final installation in our master suite, JS GALLOR's luxury team demonstrated true haute couture design. The floating bedside tables with warm LED channels are stunning.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "lr-4",
    clientName: "Naveen & Gayatri Hegde",
    locality: "Sadashivanagar, Bangalore",
    city: "Bangalore",
    furnitureBought: "Bespoke Onyx Backlit Cocktail Credenza & Lounge Swivels",
    craftsmanship: "Backlit Emerald Onyx Stone & Precision CNC Brass Inlays",
    rating: 5,
    deliveryDate: "VIP White-Glove Handover",
    quote: "The backlit Onyx console is the absolute centerpiece of our penthouse lounge. The seamless soft-close motorized German joinery makes it both a visual marvel and an everyday joy to use.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  },
];

export const FurnitureTestimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-scroll every 5.5s
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % LUXURY_TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeReview = LUXURY_TESTIMONIALS[activeIndex] || LUXURY_TESTIMONIALS[0];

  return (
    <section
      id="luxury-reviews"
      className="py-16 lg:py-24 bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle overlay to enhance contrast */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-6 border-b border-white/20 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Gem className="w-3.5 h-3.5 text-white" />
              <span>Elite Homeowner Monograph</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white drop-shadow-lg tracking-wide">
              Celebrated in Grand Residences
            </h2>
            <p className="text-sm text-white/90 font-light leading-relaxed">
              Read verified feedback from owners of premier villas, penthouses, and private estates across Hyderabad & Bangalore who commissioned Celestia Living haute couture furniture.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/30 border border-white/20 shadow-xl flex items-center gap-4 self-start lg:self-end backdrop-blur-md">
            <div className="text-right">
              <div className="text-xl font-bold font-heading text-white">5.0 / 5.0</div>
              <div className="text-[11px] text-white/80">Bespoke Luxury Standard</div>
            </div>
            <div className="flex gap-1 text-white">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-white text-white" />
              ))}
            </div>
          </div>
        </div>

        {/* Master Spotlight Card & Ledger Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* Master Spotlight Card (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 rounded-3xl bg-black/35 border border-white/25 shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-xl">
            <Quote className="absolute -top-4 -right-4 w-36 h-36 text-white/5 pointer-events-none" />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-white/90 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>COMMISSION 0{activeIndex + 1} OF 0{LUXURY_TESTIMONIALS.length}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  <span>Verified Bespoke Handover</span>
                </div>
              </div>

              <blockquote className="text-xl sm:text-2xl leading-relaxed text-white font-heading font-medium mb-6 italic drop-shadow-sm">
                "{activeReview.quote}"
              </blockquote>
            </div>

            <div className="pt-6 border-t border-white/20 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={activeReview.avatar}
                  alt={activeReview.clientName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-lg"
                />
                <div>
                  <h4 className="font-heading font-bold text-white text-lg drop-shadow-sm">
                    {activeReview.clientName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-white/80 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
                    <span>{activeReview.locality}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/10 border border-white/15 text-xs">
                <div>
                  <div className="text-white/70 text-[11px] uppercase tracking-wider font-semibold">Commission:</div>
                  <div className="font-semibold text-white mt-0.5 truncate">{activeReview.furnitureBought}</div>
                </div>
                <div>
                  <div className="text-white/70 text-[11px] uppercase tracking-wider font-semibold">Craftsmanship:</div>
                  <div className="font-semibold text-white mt-0.5 truncate">{activeReview.craftsmanship}</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-white/70 text-[11px] uppercase tracking-wider font-semibold">Protocol:</div>
                  <div className="font-semibold text-emerald-300 mt-0.5">{activeReview.deliveryDate}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Ledger Stack (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between px-1 text-xs uppercase tracking-widest font-bold text-white/90">
              <span>Resident Commission Index</span>
              <span className="text-white/70 text-[11px]">Auto-scrolling</span>
            </div>

            {LUXURY_TESTIMONIALS.map((review, idx) => {
              const isCurrent = activeIndex === idx;
              return (
                <div
                  key={review.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-lg ${
                    isCurrent
                      ? "bg-black/50 border-white shadow-xl scale-[1.01]"
                      : "bg-black/20 border-white/15 hover:border-white/40 hover:bg-black/35"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white font-bold">0{idx + 1}</span>
                      <h4 className="font-heading font-semibold text-sm text-white">{review.clientName}</h4>
                    </div>
                    <div className="flex gap-0.5 text-white">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-white text-white" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-2 font-light">
                    "{review.quote}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-white/70 pt-1.5 border-t border-white/15">
                    <span className="truncate max-w-[180px]">{review.furnitureBought}</span>
                    <span className="text-white font-medium">{review.locality.split(",")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Luxury Trust Standards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/20 shadow-lg flex items-center gap-4 backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-heading font-bold text-white">White-Glove VIP Installation</div>
              <div className="text-xs text-white/80">Private enclosed transport & master assembly</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/20 shadow-lg flex items-center gap-4 backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-heading font-bold text-white">10-Year Heirloom Warranty</div>
              <div className="text-xs text-white/80">Solid hardwood joinery & certified hardware</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/20 shadow-lg flex items-center gap-4 backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-heading font-bold text-white">Haute Couture Materials</div>
              <div className="text-xs text-white/80">Italian Marbles, Exotic Veneers & Nappa Leathers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
