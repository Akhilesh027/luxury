// components/RegisterForm.tsx
import { useState } from "react";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.phone,
        formData.password,
        formData.confirmPassword
      );
      toast({ title: "Account created!", description: "Welcome to our luxury community." });
      onSuccess?.();
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">First Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={isSubmitting}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/60 disabled:opacity-50"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Last Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={isSubmitting}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/60 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isSubmitting}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/60 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Phone</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            disabled={isSubmitting}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/60 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={isSubmitting}
            minLength={8}
            className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/60 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={isSubmitting}
            minLength={8}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/60 disabled:opacity-50"
          />
        </div>
      </div>

      <Button variant="gold" type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating account...
          </span>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      <p className="text-center text-sm text-white/80 mt-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-white font-bold hover:underline transition-colors"
        >
          Sign In
        </button>
      </p>
    </form>
  );
};