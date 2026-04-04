// src/components/LoginForm.tsx
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  redirectTo?: string;
}

export const LoginForm = ({ onSuccess, onSwitchToRegister, redirectTo }: LoginFormProps) => {
  const { login, isAuthenticated } = useAuth();
  const { syncNow } = useCart();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Check for pending checkout after authentication
  useEffect(() => {
    const handlePendingCheckout = async () => {
      if (isAuthenticated && !isSyncing) {
        const pendingCart = sessionStorage.getItem('checkout_pending_cart');
        
        if (pendingCart) {
          setIsSyncing(true);
          try {
            // Just sync the current cart to server (don't merge/reload)
            await syncNow();
            
            const pendingData = JSON.parse(pendingCart);
            
            // Check if the pending data is still valid (less than 1 hour old)
            if (pendingData.timestamp && Date.now() - pendingData.timestamp < 3600000) {
              // Clear the pending cart from sessionStorage
              sessionStorage.removeItem('checkout_pending_cart');
              
              toast.success("Ready for checkout!");
              
              // Navigate to checkout with the stored state
              navigate("/checkout", {
                state: {
                  coupon: pendingData.coupon,
                  pricing: pendingData.pricing,
                },
                replace: true
              });
            } else {
              // Pending data is too old, just go to cart
              sessionStorage.removeItem('checkout_pending_cart');
              toast.info("Please review your cart before checkout");
              navigate("/cart");
            }
          } catch (error) {
            console.error("Failed to sync cart after login:", error);
            toast.error("Cart sync failed. Please refresh the page.");
            navigate("/cart");
          } finally {
            setIsSyncing(false);
          }
        } else if (redirectTo) {
          // No pending checkout, just redirect to specified page
          navigate(redirectTo);
        }
      }
    };

    handlePendingCheckout();
  }, [isAuthenticated, syncNow, navigate, redirectTo, isSyncing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await login(formData.email, formData.password);

      if (success) {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        // Let the useEffect handle the redirect
        if (onSuccess && !sessionStorage.getItem('checkout_pending_cart')) {
          setTimeout(() => {
            onSuccess();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Login failed. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch("https://api.jsgallor.com/api/luxury/forgot", {
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
          description: data.message || "Reset link sent to your email",
        });

        setShowForgotModal(false);
        setResetEmail("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset link",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Server error. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Show loading state while syncing
  if (isSyncing) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mx-auto mb-4" />
        <p className="text-white text-lg">Preparing your checkout...</p>
        <p className="text-white/70 text-sm mt-2">Please wait a moment</p>
      </div>
    );
  }

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

        {/* Forgot Password */}
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
        <Button 
          variant="gold" 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={isSubmitting}
        >
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

      {/* Forgot Password Modal */}
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 mb-4 outline-none focus:border-white/60"
            />

            <Button
              variant="gold"
              className="w-full"
              onClick={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <button
              onClick={() => setShowForgotModal(false)}
              disabled={resetLoading}
              className="w-full mt-3 text-sm text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};