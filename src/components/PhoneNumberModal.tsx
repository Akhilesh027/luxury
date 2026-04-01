import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Phone, User } from "lucide-react";

interface PhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhoneNumberModal = ({ open, onOpenChange }: PhoneNumberModalProps) => {
  const { user, updateProfile, getProfile } = useAuth();
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Determine which fields are missing
  const missingFirstName = !user?.firstName;
  const missingLastName = !user?.lastName;
  const missingPhone = !user?.phone;

  // Pre-fill if user already has some data
  useEffect(() => {
    if (user) {
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (missingFirstName && !firstName.trim()) {
      toast({
        title: "First Name Required",
        description: "Please enter your first name.",
        variant: "destructive",
      });
      return;
    }
    if (missingLastName && !lastName.trim()) {
      toast({
        title: "Last Name Required",
        description: "Please enter your last name.",
        variant: "destructive",
      });
      return;
    }
    if (missingPhone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid 10-digit phone number",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const updateData: any = {};
      
      if (missingFirstName && firstName.trim()) updateData.firstName = firstName.trim();
      if (missingLastName && lastName.trim()) updateData.lastName = lastName.trim();
      if (missingPhone && phone.trim()) updateData.phone = phone.trim();

      if (Object.keys(updateData).length === 0) {
        // Nothing to update – just close (shouldn't happen if missing fields exist)
        onOpenChange(false);
        return;
      }

      const updated = await updateProfile(updateData);
      if (updated) {
        toast({
          title: "Profile Updated",
          description: "Your information has been saved successfully.",
        });
        onOpenChange(false); // Close modal only after successful save
        await getProfile(); // Refresh user data
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no missing fields or modal not open
  if (!open || !user || (!missingFirstName && !missingLastName && !missingPhone)) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-black border border-gold-500/20 rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gold-500 mb-2">Complete Your Profile</h2>
        <p className="text-sm text-white/60 mb-6">
          Please provide the following information to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          {missingFirstName && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-gold-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Last Name */}
          {missingLastName && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-gold-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Phone Number */}
          {missingPhone && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-gold-500"
                  required
                  disabled={loading}
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-white/40">We'll never share your phone number.</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gold-500 text-white hover:bg-gold-600 w-full sm:w-auto"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};