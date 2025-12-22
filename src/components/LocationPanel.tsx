import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cities } from "@/data/siteData";

interface LocationPanelProps {
  onClose: () => void;
}

const LocationPanel = ({ onClose }: LocationPanelProps) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState("");

  const handleApply = () => {
    if (pinCode) {
      console.log("Applied PIN:", pinCode);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-20 right-4 lg:right-20 w-80 bg-card/98 backdrop-blur-xl rounded-xl border border-border/50 shadow-elevated z-50 p-5"
    >
      <h3 className="text-gold font-heading font-semibold mb-4">Pick a main city</h3>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              selectedCity === city
                ? "bg-gold text-primary-foreground"
                : "bg-secondary/50 text-foreground hover:bg-secondary"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      <div className="border-t border-border/50 pt-4">
        <label className="text-sm text-muted-foreground">Or enter PIN code</label>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="PIN code"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="flex-1 px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm outline-none focus:border-gold transition-colors"
          />
          <Button variant="gold" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationPanel;
