import { forwardRef } from "react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer
      ref={ref}
      className="bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] relative border-t border-white/10"
    >
      {/* Soft overlay for better text contrast */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Top Section */}
        <div className="py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand Column */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-lg tracking-wider mb-6">
              JS GALLOR
            </h1>
            <p className="text-white/80 text-sm mb-4">Customer care service</p>
            <a
              href="tel:8800222-5764"
              className="text-2xl font-heading font-bold text-white hover:text-[#d4af37] transition-colors drop-shadow"
            >
              8 800 222-57-64
            </a>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-white/70 uppercase tracking-wider">
                MON – SUN FROM 9 TO 20
              </span>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-6 text-white">
              Information for buyers
            </h3>
            <ul className="space-y-3">
              {[
                "Delivery and assembly",
                "Guarantee",
                "About the project",
                "Showroom in Hyderabad",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
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
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/50 outline-none focus:border-white transition-colors"
              />
              <button className="px-4 py-2 bg-white text-[#7a5a1e] rounded-lg font-medium hover:bg-[#d4af37] hover:text-white transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/70">
              © JS GALLOR. 2025
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                Return Policy
              </a>
            </div>
          </div>
          <div className="text-center mt-4">
            <a
              href="#"
              className="text-xs text-white/50 hover:text-white transition-colors"
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