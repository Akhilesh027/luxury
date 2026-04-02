import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  // 🔥 Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Login failed. Please check credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Forgot Password API
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email",
      });
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/luxury/forgot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Reset link sent",
        });

        setShowForgotModal(false);
        setResetEmail("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send link",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Server error",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email */}
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

        {/* Password */}
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

        {/* 🔥 Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <Button variant="gold" type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </span>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Register */}
        <p className="text-center text-sm text-white/80 mt-6">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-white font-bold hover:underline transition-colors"
          >
            Sign Up
          </button>
        </p>
      </form>

      {/* 🔥 Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 w-[350px] backdrop-blur-xl shadow-2xl">
            
            <h3 className="text-lg font-semibold text-white mb-2">
              Reset Password
            </h3>

            <p className="text-sm text-white/70 mb-4">
              Enter your email to receive a reset link
            </p>

            <input
              type="email"
              placeholder="you@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={resetLoading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 mb-4 outline-none"
            />

            <Button
              variant="gold"
              className="w-full"
              onClick={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <button
              onClick={() => setShowForgotModal(false)}
              disabled={resetLoading}
              className="w-full mt-3 text-sm text-white/70 hover:text-white"
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </>
  );
};