import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Building2,
  CheckCircle2,
  Send,
  HelpCircle,
  Gem,
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "luxury_furniture",
    preferredCenter: "Banjara Hills Showroom",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const locations = [
    {
      name: "Experience Center & Office",
      badge: "Walk-In Experience Center (Furniture & Interiors)",
      subtitle: "Live Modular Mockups, Haute Couture Living, Dining & Material Library",
      address: "Road No 1, Bagayath layout, 3rd floor, Plot 288, Uppal, Hyderabad, Telangana 500039",
      phone: "+91 81436 78491 / +91 70758 48516",
      email: "support@jsgallor.com",
      timings: "Monday – Sunday: 10:00 AM – 8:30 PM",
      mapUrl: "https://maps.google.com/?q=Road+No+1+Bagayath+layout+Plot+288+Uppal+Hyderabad+Telangana+500039",
      highlights: [
        "Italian Marble & Exotic Veneer Atelier",
        "Full-Scale Modular Kitchen & Closet Mockups",
        "Private VIP Architect Consultation Suites",
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I schedule a private one-on-one consultation with your chief architect?",
      a: "Yes. We arrange private, dedicated consultation sessions at our Banjara Hills and Madhapur studios, or directly at your site for luxury villas and penthouses.",
    },
    {
      q: "Do you offer custom customization for luxury furniture?",
      a: "Every piece in our Celestia Living collection can be customized in terms of dimensions, exotic wood veneers, Italian marbles, top-grain leathers, and metal accent finishes.",
    },
    {
      q: "What is the warranty coverage on luxury furniture and modular interiors?",
      a: "We offer up to a 10-year comprehensive structural warranty on core plywood and structural joinery, with lifetime support on certified German hardware.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const text = `*New Concierge Inquiry - Celestia Living*%0A*Name:* ${encodeURIComponent(formData.name)}%0A*Phone:* ${encodeURIComponent(formData.phone)}%0A*Email:* ${encodeURIComponent(formData.email)}%0A*Interest:* ${encodeURIComponent(formData.interest)}%0A*Center:* ${encodeURIComponent(formData.preferredCenter)}%0A*Message:* ${encodeURIComponent(formData.message)}`;
    window.open(`https://wa.me/918143678491?text=${text}`, "_blank");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#111111] via-[#1a1814] to-[#111111] text-[#f4ecd8]">
        {/* Breadcrumb */}
        <nav className="border-b border-[#7a5a1e]/30 bg-black/40 py-3 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-xs text-[#d4af37]/80">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white font-medium">Experience Centers & Contact</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 border-b border-[#7a5a1e]/30">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-widest backdrop-blur-md">
              <Gem className="w-3.5 h-3.5" />
              <span>Celestia Living Concierge</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-white tracking-wide">
              Showrooms & Experience Centers
            </h1>

            <p className="text-sm sm:text-base text-[#e8d5b5]/80 font-light leading-relaxed max-w-2xl mx-auto">
              Experience the pinnacle of luxury furniture craftsmanship and turnkey interior architecture. Visit our flagship experience centers in Hyderabad & Bangalore.
            </p>

            {/* Quick action strip */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://wa.me/918143678491?text=Hi%20JS%20GALLOR%2C%20I%20would%20like%20to%20schedule%20a%20private%20Experience%20Center%20visit."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3deb0] to-[#d4af37] text-[#111111] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Book VIP Experience on WhatsApp</span>
              </a>

              <a
                href="tel:+918143678491"
                className="px-6 py-3 rounded-xl bg-white/5 border border-[#d4af37]/40 text-[#f4ecd8] font-semibold text-xs uppercase tracking-wider inline-flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <Phone className="w-4 h-4 text-[#d4af37]" />
                <span>Call +91 81436 78491</span>
              </a>
            </div>
          </div>
        </section>

        {/* Experience Centers Grid */}
        <section className="py-16 container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#d4af37]">
              <Building2 className="w-4 h-4" />
              <span>Walk-In Locations</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-bold text-white">
              Visit Our Flagship Experience Centers
            </h2>
            <p className="text-xs sm:text-sm text-[#e8d5b5]/70">
              Dedicated studios for luxury furniture curation, bespoke modular mockups, and senior architect consultations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {locations.map((loc, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-[#1c1a17] to-[#141310] rounded-3xl border border-[#7a5a1e]/40 p-6 sm:p-8 flex flex-col justify-between hover:border-[#d4af37] transition-all duration-300 shadow-xl relative overflow-hidden group"
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                      {loc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-white leading-snug">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-[#d4af37] font-medium mt-1">
                      {loc.subtitle}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-[#d0c6b4] pt-2 border-t border-white/10">
                    <div className="flex gap-3 items-start">
                      <MapPin className="w-4 h-4 mt-1 text-[#d4af37] shrink-0" />
                      <span className="leading-relaxed">{loc.address}</span>
                    </div>

                    <div className="flex gap-3 items-center">
                      <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                      <a href={`tel:${loc.phone.split('/')[0].trim()}`} className="hover:text-white transition-colors">
                        {loc.phone}
                      </a>
                    </div>

                    <div className="flex gap-3 items-center">
                      <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                      <a href={`mailto:${loc.email}`} className="hover:text-white transition-colors text-xs">
                        {loc.email}
                      </a>
                    </div>

                    <div className="flex gap-3 items-center">
                      <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
                      <span className="text-xs">{loc.timings}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-[#d4af37] tracking-wider">
                      Studio Features:
                    </div>
                    {loc.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#e8d5b5]/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3">
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/15 inline-flex items-center justify-center gap-2"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
                  </a>

                  <a
                    href={`https://wa.me/918143678491?text=${encodeURIComponent(`Hi JS GALLOR, I would like to schedule a visit to the ${loc.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black hover:brightness-110 transition-all inline-flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Book Visit</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consultation Booking Form */}
        <section className="py-16 container mx-auto px-4 max-w-5xl border-t border-[#7a5a1e]/30">
          <div className="bg-gradient-to-br from-[#1c1a17] to-[#12110f] rounded-3xl border border-[#7a5a1e]/40 p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Private Concierge</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                  Schedule a VIP Consultation
                </h2>
                <p className="text-xs sm:text-sm text-[#e8d5b5]/70 leading-relaxed">
                  Connect directly with our luxury design consultants and master architects for tailored advice on luxury furniture collections or complete bespoke home interiors.
                </p>

                <div className="space-y-3 pt-4 text-xs text-[#d0c6b4]">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#d4af37]" />
                    <span>Direct Hotline: +91 81436 78491</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                    <span>Concierge Email: luxury@jsgallor.com</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                {submitted ? (
                  <div className="p-8 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-[#d4af37] mx-auto" />
                    <h3 className="text-lg font-bold text-white">Inquiry Sent Successfully!</h3>
                    <p className="text-xs text-[#e8d5b5]">
                      Our luxury concierge team is reviewing your requirements and will connect with you immediately.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#d4af37] font-semibold block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Shiva Prasad"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#d4af37] font-semibold block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#d4af37] font-semibold block mb-1">Interest Area</label>
                        <select
                          value={formData.interest}
                          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#1a1814] border border-white/15 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="luxury_furniture">Luxury Furniture Collection</option>
                          <option value="turnkey_interiors">Turnkey Villa / Home Interiors</option>
                          <option value="custom_mockup">Bespoke Kitchen & Wardrobe Systems</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#d4af37] font-semibold block mb-1">Preferred Location</label>
                        <select
                          value={formData.preferredCenter}
                          onChange={(e) => setFormData({ ...formData, preferredCenter: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#1a1814] border border-white/15 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Banjara Hills Showroom">Banjara Hills Flagship Showroom</option>
                          <option value="Madhapur HQ Studio">Madhapur Corporate Design HQ</option>
                          <option value="Uppal Central Center">Uppal Central Experience Center</option>
                          <option value="Bangalore Pavilion">Bangalore Experience Pavilion</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[#d4af37] font-semibold block mb-1">Message / Requirements</label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Share your floorplan, timeline, or furniture requirements..."
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3deb0] to-[#d4af37] text-[#111111] font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit & Connect on WhatsApp</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 container mx-auto px-4 max-w-4xl border-t border-[#7a5a1e]/30">
          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[#d4af37]">
              <HelpCircle className="w-4 h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2"
              >
                <h3 className="font-heading font-semibold text-sm text-[#f4ecd8]">
                  {faq.q}
                </h3>
                <p className="text-xs text-[#d0c6b4] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}