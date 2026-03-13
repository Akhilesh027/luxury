import { forwardRef } from "react";
import { motion } from "framer-motion";

interface MegaMenuProps {
  data: {
    id: string;
    columns: {
      title: string;
      links: { label: string; href: string }[];
    }[];
  };
  onClose: () => void;
}

const MegaMenu = forwardRef<HTMLDivElement, MegaMenuProps>(({ data, onClose }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-[#d4af37]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-40"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data.columns.map((column, idx) => (
            <div key={idx} className="space-y-4">
              <h4 className="text-[#d4af37] font-heading font-semibold text-lg">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-200 text-sm flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#d4af37]/20 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-[#d4af37]/50 group-hover:bg-[#d4af37] transition-colors" />
                      </span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;