import { forwardRef } from "react";
import { Link } from "react-router-dom";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer
      ref={ref}
      className="bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative border-t border-white/10"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Top Section */}
        <div className="py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-lg tracking-wider mb-6">
              JS GALLOR
            </h1>

            <p className="text-white/80 text-sm mb-4">
              Customer care service
            </p>

            <a
              href="tel:+917075848516"
              className="text-2xl font-heading font-bold text-white hover:text-[#d4af37] transition-colors"
            >
              +91 7075848516
            </a>

            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-white/70 uppercase tracking-wider">
                MON – SUN FROM 9 TO 20
              </span>
            </div>

            <p className="text-sm text-[#fff3c4] mt-4 font-medium">
              We deal with premium manufacturers only.
            </p>
          </div>

          {/* Quick Links (formerly "Information for buyers") */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-6 text-white">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: "About Us", path: "/about" },
                { name: "FAQs", path: "/faqs" },
                { name: "Delivery & Assembly", path: "/delivery-policy" },
                { name: "Guarantee / Warranty", path: "/warranty-refund" },
                { name: "Privacy Policy", path: "/privacy-policy" },
                { name: "Replacement Policy", path: "/replacement-policy" },
                { name: "Showroom in Hyderabad", path: "/showroom" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-6 text-white">
              Our Locations
            </h3>

            <ul className="space-y-4 text-sm text-white/80">
              <li>
                WorkFlo Bizness Square, 4th Floor,  
                H No 1-98/3/5/23 to 27, Jubilee Enclave,  
                Madhapur, RR Dist, Telangana – 500081
              </li>
              <li>
                Uppal, Hyderabad, Telangana – 500039
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-6 text-white">
              Stay Updated
            </h3>

            <p className="text-white/80 text-sm mb-4">
              Subscribe to our newsletter for exclusive offers and design inspiration.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/50 outline-none focus:border-white"
              />
              <button className="px-4 py-2 bg-white text-[#7a5a1e] rounded-lg font-medium hover:bg-[#d4af37] hover:text-white transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/70">
              © JS GALLOR. 2026
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <Link to="/privacy-policy" className="text-sm text-white/70 hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/delivery-policy" className="text-sm text-white/70 hover:text-white">
                Delivery Policy
              </Link>
              <Link to="/warranty-refund" className="text-sm text-white/70 hover:text-white">
                Warranty & Refund
              </Link>
              <Link to="/about" className="text-sm text-white/70 hover:text-white">
                About
              </Link>
              <Link to="/support" className="text-sm text-white/70 hover:text-white">
                Support
              </Link>
            </div>
          </div>

          <div className="text-center mt-4">
            <a
              href="#"
              className="text-xs text-white/50 hover:text-white"
            >
              Designed & Developed by Digitalness ®
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;