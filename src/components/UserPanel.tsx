import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

interface UserPanelProps {
  onClose: () => void;
}

const UserPanel = ({ onClose }: UserPanelProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();

  const {
    user,
    login,
    signup,
    logout,
    getProfile,
    googleAuth, // ✅ added
    isLoading: authLoading,
    isAuthenticated,
  } = useAuth();

  const handleViewProfile = () => {
    navigate("/profile");
    onClose();
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ load latest profile whenever panel opens and user logged-in
  useEffect(() => {
    if (isAuthenticated) {
      getProfile().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const isLoading = authLoading || isSubmitting || isGoogleLoading;
  const showProfileLoading = isAuthenticated && !user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup" && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        await signup(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.phone,
          formData.password,
          formData.confirmPassword
        );
      } else {
        await login(formData.email, formData.password);
      }

      await getProfile().catch(() => {});

      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      onClose();
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ GOOGLE HANDLER
  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      toast({
        title: "Google Sign-in Failed",
        description: "No credential received from Google",
        variant: "destructive",
      });
      return;
    }

    setIsGoogleLoading(true);
    try {
      await googleAuth(credential);
      await getProfile().catch(() => {});
      onClose();
    } catch (err: any) {
      console.error("Google auth error:", err);
      toast({
        title: "Google Sign-in Failed",
        description: err?.message || "Google authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-card/98 backdrop-blur-xl border-l border-gold/20 shadow-elevated z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/30 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-gold">
              {isAuthenticated
                ? "My Profile"
                : mode === "login"
                ? "Welcome Back"
                : "Join Us"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isAuthenticated
                ? "View your account details"
                : mode === "login"
                ? "Sign in to access your account"
                : "Create your luxury account"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {/* ✅ PROFILE VIEW */}
          {isAuthenticated ? (
            showProfileLoading ? (
              <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading your profile...
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-base font-medium text-foreground">
                    {user?.fullName ||
                      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base font-medium text-foreground">
                    {user?.email || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-base font-medium text-foreground">
                    {user?.phone || "—"}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleViewProfile}
                    disabled={isLoading}
                  >
                    <User className="w-5 h-5 mr-2" />
                    View Profile
                  </Button>

                  <Button
                    variant="gold"
                    className="w-full"
                    size="lg"
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            )
          ) : (
            /* ✅ LOGIN/SIGNUP FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-xl outline-none focus:border-gold transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-xl outline-none focus:border-gold transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-xl outline-none focus:border-gold transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-xl outline-none focus:border-gold transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    disabled={isLoading}
                    minLength={8}
                    className="w-full pl-12 pr-12 py-3 bg-secondary/30 border border-border/50 rounded-xl outline-none focus:border-gold transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                      minLength={8}
                      className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border/50 rounded-xl outline-none focus:border-gold transition-colors text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <Button
                variant="gold"
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* ✅ Google login */}
              <div className="pt-2">
                <div className="relative mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/40" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">
                      or continue with
                    </span>
                  </div>
                </div>

                <div
                  className={`flex justify-center ${
                    isGoogleLoading ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <GoogleLogin
                    onSuccess={(resp) => handleGoogleSuccess(resp.credential)}
                    onError={() =>
                      toast({
                        title: "Google Sign-in Failed",
                        description: "Please try again",
                        variant: "destructive",
                      })
                    }
                    useOneTap
                  />
                </div>

                {isGoogleLoading && (
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Signing in with Google...
                  </p>
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "login"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  disabled={isLoading}
                  className="text-gold hover:text-gold-light font-medium transition-colors disabled:opacity-50"
                >
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/30">
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-gold hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-gold hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default UserPanel;