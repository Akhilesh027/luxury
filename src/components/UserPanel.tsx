// UserPanel.tsx (simplified)
import { useState } from "react";
import { motion } from "framer-motion";
import { X, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";

interface UserPanelProps {
  onClose: () => void;
}

export const UserPanel = ({ onClose }: UserPanelProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { user, logout, isLoading: authLoading, isAuthenticated } = useAuth();

  const handleSuccess = () => onClose();

  if (isAuthenticated) {
    // Show profile as before
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-card/98 backdrop-blur-xl border-l border-gold/20 z-50 overflow-y-auto"
      >
        {/* header same as before */}
        <div className="sticky top-0 bg-card/95 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-gold">My Profile</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {/* profile info and logout button */}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-0 right-0 h-full w-full max-w-md bg-card/98 backdrop-blur-xl border-l border-gold/20 z-50 overflow-y-auto"
    >
      <div className="sticky top-0 bg-card/95 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gold">
            {mode === "login" ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Sign in to access your account" : "Create your luxury account"}
          </p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {mode === "login" ? (
          <LoginForm onSuccess={handleSuccess} onSwitchToRegister={() => setMode("signup")} />
        ) : (
          <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={() => setMode("login")} />
        )}
      </div>

      <div className="p-6 border-t border-border/30">
        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </motion.div>
  );
};

export default UserPanel;