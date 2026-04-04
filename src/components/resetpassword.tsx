import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔐 Get token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (!tokenFromUrl) {
      toast({
        title: "Invalid link",
        description: "Reset link is invalid or expired",
      });
      return;
    }

    setToken(tokenFromUrl);
  }, []);

  // 🔥 Submit
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({ title: "Error", description: "Please fill all fields" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://api.jsgallor.com/api/luxury/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: data.message || "Reset failed",
        });
      }

    } catch {
      toast({
        title: "Error",
        description: "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-yellow-400/20 blur-[150px] rounded-full"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">

        <h2 className="text-2xl font-semibold text-white mb-2 text-center">
          Reset Password
        </h2>

        <p className="text-white/70 text-sm text-center mb-6">
          Create a new secure password for your account
        </p>

        <form onSubmit={handleReset} className="space-y-4">

          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/60 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70"
            >
              {showConfirm ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Submit */}
          <Button
            variant="gold"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;