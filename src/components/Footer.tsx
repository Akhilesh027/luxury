import { forwardRef } from "react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="bg-charcoal-dark border-t border-border/30">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand Column */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gold tracking-wider mb-6">
              JS GALLOR
            </h1>
            <p className="text-muted-foreground text-sm mb-4">Customer care service</p>
            <a
              href="tel:8800222-5764"
              className="text-2xl font-heading font-bold text-foreground hover:text-gold transition-colors"
            >
              8 800 222-57-64
            </a>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                MON – SUN FROM 9 TO 20
              </span>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-6">
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
                    className="text-muted-foreground hover:text-gold transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-lg font-heading font-semibold mb-6">
              Stay Updated
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter for exclusive offers and design inspiration.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-secondary/30 border border-border/50 rounded-lg text-sm outline-none focus:border-gold transition-colors"
              />
              <button className="px-4 py-2 bg-gold text-primary-foreground rounded-lg font-medium hover:bg-gold-light transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-6 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © JS GALLOR. 2025
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Support
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                Return Policy
              </a>
            </div>
          </div>
          <div className="text-center mt-4">
            <a
              href="#"
              className="text-xs text-muted-foreground/60 hover:text-gold transition-colors"
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
