// LocationPanel.tsx – updated to accept onLocationSelect
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cities } from "@/data/siteData";
import { Loader2, MapPin } from "lucide-react";

interface LocationPanelProps {
  onClose: () => void;
  onLocationSelect: (city: string, pin: string) => void; // ✅ new callback
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; postcode: string }> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "JSGALORE-App/1.0" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const address = data.address || {};
  const city = address.city || address.town || address.village || address.county || "Unknown";
  const postcode = address.postcode || "";
  return { city, postcode };
}

const LocationPanel = ({ onClose, onLocationSelect }: LocationPanelProps) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<{ city: string; pin: string } | null>(null);

  const handleDetectLocation = () => {
    setDetecting(true);
    setLocationError(null);
    setDetectedLocation(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { city, postcode } = await reverseGeocode(latitude, longitude);
          setDetectedLocation({ city, pin: postcode });
        } catch (err) {
          setLocationError("Could not determine your city from location.");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        let msg = "Unable to get your location.";
        if (err.code === 1) msg = "Location access denied. Please enable permissions.";
        else if (err.code === 2) msg = "Location unavailable.";
        else if (err.code === 3) msg = "Location request timed out.";
        setLocationError(msg);
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const applyDetectedLocation = () => {
    if (detectedLocation) {
      const matchedCity = cities.find(
        (c) => c.toLowerCase() === detectedLocation.city.toLowerCase()
      );
      if (matchedCity) setSelectedCity(matchedCity);
      setPinCode(detectedLocation.pin);
    }
  };

  const handleApply = () => {
    // Determine final values: prefer manual entry, fallback to detected, fallback to selected city
    const finalCity = selectedCity || detectedLocation?.city || "";
    const finalPin = pinCode || detectedLocation?.pin || "";
    onLocationSelect(finalCity, finalPin);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-20 right-4 lg:right-20 w-80 bg-black/90 backdrop-blur-xl rounded-xl border border-[#d4af37]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 p-5"
    >
      <h3 className="text-[#d4af37] font-heading font-semibold mb-4">Pick a main city</h3>

      <Button
        variant="outline"
        className="w-full border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37] hover:text-black mb-4"
        onClick={handleDetectLocation}
        disabled={detecting}
      >
        {detecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Detecting...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            Detect my location
          </>
        )}
      </Button>

      {locationError && <p className="text-xs text-red-400 mb-2">{locationError}</p>}

      {detectedLocation && !locationError && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-[#d4af37]/30">
          <p className="text-sm text-white/80">
            Detected: <span className="text-[#d4af37] font-medium">{detectedLocation.city}</span>
            {detectedLocation.pin && ` (${detectedLocation.pin})`}
          </p>
          <Button
            variant="link"
            className="text-xs text-[#d4af37] p-0 h-auto mt-1"
            onClick={applyDetectedLocation}
          >
            Apply this location
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              selectedCity === city
                ? "bg-gradient-to-r from-[#7a5a1e] to-[#d4af37] text-white"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4">
        <label className="text-sm text-white/70">Or enter PIN code</label>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="PIN code"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/50 outline-none focus:border-[#d4af37] transition-colors"
          />
          <Button
            variant="outline"
            className="border-[#d4af37] text-[#d4af37] hover:bg-gradient-to-r hover:from-[#7a5a1e] hover:to-[#d4af37] hover:text-white"
            onClick={handleApply}
          >
            Apply
          </Button>
        </div>
      </div>

      <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white">
        ✕
      </button>
    </motion.div>
  );
};

export default LocationPanel;