// pages/AuthPage.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import logo from '../../public/JSGALORE.png'
const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { googleAuth, isLoading: authLoading } = useAuth();

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) return;
    try {
      await googleAuth(credential);
      toast({ title: "Success", description: "Google sign-in completed" });
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Google authentication failed", variant: "destructive" });
    }
  };

  const handleFormSuccess = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#7a5a1e] via-[#d4af37] to-[#7a5a1e] flex flex-col md:flex-row">
      {/* Left Side - Branding & Quote */}
      <div className="md:w-1/2 bg-[#6b4e1a]/30 backdrop-blur-sm flex items-center justify-center p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20 bg-repeat" />
        <div className="relative z-10 max-w-md text-center md:text-left">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl  flex items-center justify-center font-bold text-[#7a5a1e] text-2xl shadow-lg">
              <img src={logo} alt="Logo" />
            </div>
            <span className="text-2xl font-bold text-white drop-shadow-lg">Celestialiving</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Elevate Your Living Experience
          </h1>
          <p className="text-xl text-white/90 mb-8 font-light">
            Customized, premium, and trusted luxury solutions with expert site visits for a seamless experience.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-white/90">Personalized design consultation</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-white/90">Premium materials & craftsmanship</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-white/90">End‑to‑end project management</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/80 italic">
              “Transform your space with timeless elegance.”
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-white/80 text-sm">
              {activeTab === "login"
                ? "Sign in to your premium account"
                : "Join us for exclusive luxury experiences"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-white/20 mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                activeTab === "login"
                  ? "text-white border-b-2 border-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2 text-center font-medium transition-colors ${
                activeTab === "register"
                  ? "text-white border-b-2 border-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Area */}
          {activeTab === "login" ? (
            <LoginForm onSuccess={handleFormSuccess} onSwitchToRegister={() => setActiveTab("register")} />
          ) : (
            <RegisterForm onSuccess={handleFormSuccess} onSwitchToLogin={() => setActiveTab("login")} />
          )}

          {/* Google Login – shown in both tabs */}
          <div className="mt-6 pt-4 border-t border-white/20">
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/10 px-3 text-white/80 rounded-full">or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(resp) => handleGoogleSuccess(resp.credential)}
                onError={() => toast({ title: "Error", description: "Google login failed", variant: "destructive" })}
                useOneTap={false}
              />
            </div>
            {authLoading && <p className="text-xs text-center text-white/80 mt-2">Signing in...</p>}
          </div>

          {/* Footer */}
          <div className="mt-6 text-xs text-center text-white/70">
            By continuing, you agree to our{" "}
            <a href="#" className="text-white hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-white hover:underline">
              Privacy Policy
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;