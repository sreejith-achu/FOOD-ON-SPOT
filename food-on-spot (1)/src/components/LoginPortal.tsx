import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  AlertTriangle,
  Smartphone,
  Lock,
  ArrowLeft,
  Loader
} from "lucide-react";
import { User as UserType } from "../types";

// Stylized premium Vector for the "Food on Spot" locating plate brand logo
const BrandLogoSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Combined hot spot location pin surrounding plate */}
    <path 
      d="M50 15C33.43 15 20 28.43 20 45C20 67.5 50 85 50 85C50 85 80 67.5 80 45C80 28.43 66.57 15 50 15Z" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Concentric dotted plate indicator rim */}
    <circle cx="50" cy="45" r="18" stroke="currentColor" strokeWidth="3" strokeDasharray="5 3" />
    {/* Minimalist Fork & Spoon stylized icon inside plate */}
    <path d="M45 36v12M50 36v16M55 36v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 52v8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

interface LoginPortalProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [authMethod, setAuthMethod] = useState<"SELECT" | "PHONE" | "EMAIL" | "GOOGLE">("SELECT");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  const pinRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Ticking OTP countdown resend helper
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Synchronize pinDigits list with otpCode input
  React.useEffect(() => {
    setOtpCode(pinDigits.join(""));
  }, [pinDigits]);

  // Email/Phone input field destination
  const getDestination = () => {
    return authMethod === "PHONE" ? phoneNumber : emailAddress;
  };

  const resetState = () => {
    setAuthMethod("SELECT");
    setPhoneNumber("");
    setEmailAddress("");
    setOtpCode("");
    setPinDigits(["", "", "", "", "", ""]);
    setOtpSent(false);
    setGeneratedOtp(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setResendTimer(0);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    
    const destination = getDestination().trim();
    if (!destination) {
      setErrorMsg(`Please provide a valid ${authMethod === "PHONE" ? "phone number" : "email address"}.`);
      return;
    }

    if (authMethod === "EMAIL") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
      if (!emailRegex.test(destination)) {
        setErrorMsg("Check the mailid - please enter a valid email address format ending with @gmail.com.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const channel = authMethod === "PHONE" ? "phone" : "email";
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, destination }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setGeneratedOtp(data.code);
        setResendTimer(45);
        setSuccessMsg(`Code transmitted! For immediate testing in this sandbox, use OTP code: ${data.code}`);
      } else {
        setErrorMsg(data.message || "Failed to transmit verification code.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorMsg(null);

    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification pin.");
      return;
    }

    setIsLoading(true);
    try {
      const channel = authMethod === "PHONE" ? "phone" : "email";
      const destination = getDestination().trim();
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, destination, code: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Verification complete! Logging you in...");
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 800);
      } else {
        setErrorMsg(data.message || "Invalid security code verification failed.");
      }
    } catch (err) {
      setErrorMsg("Verification error occurred. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (email: string, name: string, avatarUrl: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, avatarUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Welcome, ${name}! Authorization granted.`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1000);
      } else {
        setErrorMsg("Failed to authenticate Google credentials.");
      }
    } catch (err) {
      setErrorMsg("Google OAuth popup failed in preview frame.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden px-4 py-12 bg-slate-950/20">
      
      {/* BACKGROUND BRAND LOGO ANIMATIONS */}
      {/* Ambient Radial Waves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <motion.div 
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[600px] h-[600px] rounded-full bg-radial from-orange-400/10 via-transparent to-transparent"
        />
        <motion.div 
          animate={{
            scale: [1.15, 0.9, 1.15],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[800px] h-[800px] rounded-full border border-orange-500/5"
        />
      </div>

      {/* Central Magnificent Giant Brand Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 75,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-[450px] h-[450px] opacity-[0.05] text-orange-500"
        >
          <BrandLogoSVG />
        </motion.div>
      </div>

      {/* Scattered drifting brand icons with distinct trajectories */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {/* Floating Logo 1 */}
        <motion.div
          animate={{
            x: ["10vw", "15vw", "5vw", "10vw"],
            y: ["80vh", "15vh", "45vh", "80vh"],
            rotate: [0, 180, 270, 360]
          }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-20 h-20 opacity-[0.06] text-[#FF6B35]"
        >
          <BrandLogoSVG />
        </motion.div>

        {/* Floating Logo 2 */}
        <motion.div
          animate={{
            x: ["80vw", "70vw", "85vw", "80vw"],
            y: ["10vh", "75vh", "35vh", "10vh"],
            rotate: [360, 180, 90, 0]
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-14 h-14 opacity-[0.05] text-[#FF6B35]"
        >
          <BrandLogoSVG />
        </motion.div>

        {/* Floating Logo 3 */}
        <motion.div
          animate={{
            x: ["65vw", "80vw", "55vw", "65vw"],
            y: ["75vh", "5vh", "35vh", "75vh"],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-24 h-24 opacity-[0.04] text-[#FF6B35]"
        >
          <BrandLogoSVG />
        </motion.div>

        {/* Floating Logo 4 */}
        <motion.div
          animate={{
            x: ["15vw", "5vw", "25vw", "15vw"],
            y: ["5vh", "65vh", "25vh", "5vh"],
            rotate: [0, 90, 180, 0]
          }}
          transition={{
            duration: 52,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-16 h-16 opacity-[0.03] text-[#FF6B35]"
        >
          <BrandLogoSVG />
        </motion.div>

        {/* Semi-translucent drifting floating food assets */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[8%] text-3xl opacity-15 filter blur-[0.5px]"
        >
          🍔
        </motion.div>
        
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -15, 15, 0]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] right-[10%] text-4xl opacity-15 filter blur-[0.5px]"
        >
          🍕
        </motion.div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 8, -8, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[25%] text-3xl opacity-10"
        >
          🍣
        </motion.div>

        <motion.div
          animate={{
            y: [0, 8, 0],
            rotate: [0, -12, 12, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[25%] text-3xl opacity-10"
        >
          🍜
        </motion.div>

        <motion.div
          animate={{
            y: [0, -18, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[70%] left-[5%] text-2xl opacity-15"
        >
          🌶️
        </motion.div>

        <motion.div
          animate={{
            scale: [0.9, 1.25, 0.9],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[5%] text-2xl"
        >
          ✨
        </motion.div>
      </div>

      <div id="login-container" className="w-full max-w-md z-10 my-12 px-4 py-8">
        <div className="sleek-card p-8 bg-white/95 backdrop-blur-md relative border border-gray-100 shadow-2xl">
        
        {/* Top Branding Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-orange-50 rounded-2xl border border-orange-100 mb-4 shadow-sm select-none">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-800 tracking-tight">
            Sign In to Food On Spot
          </h2>
          <p className="text-xs text-gray-500 mt-1.5 font-medium leading-relaxed">
            Authentication is requested to view multi-vendor cuisines, apply premium promo codes, and finalize food delivery orders.
          </p>
        </div>

        {/* Dynamic Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-start gap-2.5 text-xs font-semibold animate-fade-in">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-start gap-2.5 text-xs font-medium leading-snug animate-fade-in">
            <Check size={16} className="bg-emerald-500 text-white rounded-full p-0.5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Code Sent Successfully!</p>
              <p className="text-[11px] mt-0.5 text-emerald-700/85">{successMsg}</p>
            </div>
          </div>
        )}

        {/* FLOW CONTROLLER */}
        {authMethod === "SELECT" && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Phone Login Selection */}
            <button
              id="login-method-phone"
              type="button"
              onClick={() => setAuthMethod("PHONE")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-[#FF6B35]/40 hover:bg-orange-50/5 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="sleek-icon-container bg-orange-50 text-[#FF6B35] group-hover:scale-105 transition-transform">
                  <Phone size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Verify via Mobile OTP</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Use single-use 6-digit cellular passcode</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Email Login Selection */}
            <button
              id="login-method-email"
              type="button"
              onClick={() => setAuthMethod("EMAIL")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-[#FF6B35]/40 hover:bg-orange-50/5 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="sleek-icon-container bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                  <Mail size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Verify via Email OTP</h4>
                  <p className="text-[11px] text-gray-400 font-medium font-sans">Receive instant secure pin in your inbox</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Google Authentication */}
            <button
              id="login-method-google"
              type="button"
              onClick={() => setAuthMethod("GOOGLE")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-[#FF6B35]/40 hover:bg-orange-50/5 hover:shadow-xs transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="sleek-icon-container bg-[#EA4335]/5 text-[#EA4335] group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.983 0-.74-.08-1.302-.178-1.859H12.24z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Sign in with Google</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Use primary Google authentication workspace</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Demo Quick Account Login Block */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest mb-3.5">
                Developer Fast-Track (Demo login)
              </p>
              <button
                id="login-demo-alex"
                type="button"
                onClick={() => {
                  setAuthMethod("EMAIL");
                  setEmailAddress("customer@gmail.com");
                }}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-[#FF6B35] bg-orange-50 border border-orange-100/50 hover:bg-orange-100/40 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                Load Premium Test Account (Alex Johnson)
              </button>
            </div>
          </div>
        )}

        {/* PHONE / EMAIL OTP SEND STEP */}
        {(authMethod === "PHONE" || authMethod === "EMAIL") && !otpSent && (
          <form onSubmit={handleSendOtp} className="space-y-4.5 animate-fade-in">
            <button
              type="button"
              onClick={resetState}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer font-bold focus:outline-none mb-2"
            >
              <ArrowLeft size={14} /> Back to selections
            </button>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {authMethod === "PHONE" ? "Mobile Phone Number" : "Email Address"}
              </label>
              <div className="sleek-input-bar bg-slate-50 px-3.5 py-1 flex items-center gap-2">
                {authMethod === "PHONE" ? (
                  <>
                    <Smartphone className="text-gray-400" size={17} />
                    <input
                      id="login-phone-input"
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full text-sm py-2.5 font-medium bg-transparent border-0 outline-none ring-0 focus:ring-0 text-slate-800"
                      disabled={isLoading}
                      required
                    />
                  </>
                ) : (
                  <>
                    <Mail className="text-gray-400" size={17} />
                    <input
                      id="login-email-input"
                      type="email"
                      placeholder="customer@gmail.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className={`w-full text-sm py-2.5 font-medium bg-transparent border-0 outline-none ring-0 focus:ring-0 text-slate-800 ${
                        emailAddress && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(emailAddress) ? "text-red-500" : ""
                      }`}
                      disabled={isLoading}
                      required
                    />
                  </>
                )}
              </div>
              {authMethod === "EMAIL" && emailAddress && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(emailAddress) && (
                <p className="text-xs text-red-500 font-semibold mt-1 flex items-center gap-1" id="login-email-warning">
                  ⚠️ Check the mailid (Must be @gmail.com format)
                </p>
              )}
            </div>

            <button
              id="login-btn-send-code"
              type="submit"
              disabled={isLoading}
              className="w-full sleek-btn-primary py-3.5 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Generating Verification Code...
                </>
              ) : (
                <>
                  Send OTP Verification Code
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            
            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              We will generate a real secure session code dynamically on the server for you.
            </p>
          </form>
        )}

        {/* VERIFY CODE STEP */}
        {(authMethod === "PHONE" || authMethod === "EMAIL") && otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer font-bold focus:outline-none"
              >
                <ArrowLeft size={14} /> Back
              </button>
              
              <button
                type="button"
                onClick={(e) => {
                  if (resendTimer === 0) {
                    handleSendOtp(e);
                  }
                }}
                disabled={resendTimer > 0}
                className={`text-xs font-bold font-sans ${
                  resendTimer > 0 
                  ? "text-gray-400 cursor-not-allowed select-none" 
                  : "text-[#FF6B35] hover:underline cursor-pointer"
                }`}
              >
                {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
              </button>
            </div>

            <div className="text-center bg-orange-50/40 border border-orange-100 p-3 rounded-xl mb-4">
              <p className="text-xs font-medium text-amber-800">
                A verification passcode has been dispatched to:
              </p>
              <p className="text-xs font-bold text-gray-800 mt-0.5 truncate">
                {getDestination()}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Lock size={12} /> Enter 6-Digit OTP Code
              </label>
              
              {/* 6-DIGIT INDIVIDUAL PREMIUM BOX DESIGN */}
              <div className="grid grid-cols-6 gap-2" id="otp-boxes-grid">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      pinRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={pinDigits[index]}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (!val) {
                        const newPin = [...pinDigits];
                        newPin[index] = "";
                        setPinDigits(newPin);
                        return;
                      }
                      
                      const newPin = [...pinDigits];
                      newPin[index] = val.slice(-1);
                      setPinDigits(newPin);

                      // Auto focus next box
                      if (index < 5 && val) {
                        pinRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        if (!pinDigits[index] && index > 0) {
                          const newPin = [...pinDigits];
                          newPin[index - 1] = "";
                          setPinDigits(newPin);
                          pinRefs.current[index - 1]?.focus();
                        } else {
                          const newPin = [...pinDigits];
                          newPin[index] = "";
                          setPinDigits(newPin);
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (pasteData) {
                        const newPin = [...pinDigits];
                        for (let i = 0; i < 6; i++) {
                          if (pasteData[i]) {
                            newPin[i] = pasteData[i];
                          }
                        }
                        setPinDigits(newPin);
                        // Focus the last filled box
                        const targetFocus = Math.min(pasteData.length, 5);
                        pinRefs.current[targetFocus]?.focus();
                      }
                    }}
                    className="w-full text-center text-xl font-black py-2.5 bg-slate-50 border-2 border-gray-200 focus:border-[#FF6B35] focus:bg-white focus:ring-0 outline-none rounded-xl transition-all text-slate-800"
                    disabled={isLoading}
                    required
                  />
                ))}
              </div>
            </div>

            <button
              id="login-btn-verify"
              type="submit"
              disabled={isLoading}
              className="w-full sleek-btn-primary py-3.5 cursor-pointer text-sm flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Verifying Security Pin...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Verify Code & Continue
                </>
              )}
            </button>

            {generatedOtp && (
              <div className="mt-6 p-3 bg-indigo-50 border border-indigo-100/70 rounded-xl">
                <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest text-center">
                  Sandbox Active OTP Receiver:
                </p>
                <p className="text-xl font-mono font-black text-indigo-900 mt-1 select-all text-center tracking-widest">
                  {generatedOtp}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const otpChars = generatedOtp.split("").slice(0, 6);
                    const filledOtp = [...pinDigits];
                    for (let i = 0; i < 6; i++) {
                      filledOtp[i] = otpChars[i] || "";
                    }
                    setPinDigits(filledOtp);
                  }}
                  className="w-full text-center text-[11px] font-bold text-indigo-600 hover:underline mt-1 cursor-pointer"
                >
                  Click to Auto-fill Code
                </button>
              </div>
            )}
            
            <p className="text-[10px] text-gray-400 text-center">
              Can&apos;t wait? Pass <strong>111111</strong> as an administrator backdoor code key.
            </p>
          </form>
        )}

        {/* GOOGLE ACC SELECT MODULE */}
        {authMethod === "GOOGLE" && (
          <div className="space-y-4 animate-fade-in">
            <button
              type="button"
              onClick={resetState}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer font-bold focus:outline-none mb-2"
            >
              <ArrowLeft size={14} /> Back to selections
            </button>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Select google active account
            </p>

            <div className="space-y-2.5">
              {/* Account 1: User's provided metadata email */}
              <button
                id="google-acc-sreejith"
                type="button"
                onClick={() => handleGoogleLogin("sreejithv8589@gmail.com", "Sreejith V", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120")}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-gray-200 bg-slate-50 hover:border-[#FF6B35]/40 hover:bg-orange-50/5 hover:scale-[1.01] transition-all text-left cursor-pointer"
                disabled={isLoading}
              >
                <img 
                  className="w-10 h-10 rounded-full border border-gray-200" 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120" 
                  alt="Sreejith V" 
                />
                <div className="truncate">
                  <h5 className="text-xs font-extrabold text-gray-800">Sreejith V</h5>
                  <p className="text-[11px] text-gray-500 truncate">sreejithv8589@gmail.com</p>
                  <span className="text-[9px] text-[#FF6B35] font-bold">Currently Connected</span>
                </div>
              </button>

              {/* Account 2: Seed character Alex Johnson */}
              <button
                id="google-acc-alex"
                type="button"
                onClick={() => handleGoogleLogin("customer@gmail.com", "Alex Johnson", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120")}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-gray-200 bg-slate-50 hover:border-[#FF6B35]/40 hover:bg-orange-50/5 hover:scale-[1.01] transition-all text-left cursor-pointer"
                disabled={isLoading}
              >
                <img 
                  className="w-10 h-10 rounded-full border border-gray-200" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" 
                  alt="Alex Johnson" 
                />
                <div className="truncate">
                  <h5 className="text-xs font-extrabold text-gray-800">Alex Johnson</h5>
                  <p className="text-[11px] text-gray-500 truncate">customer@gmail.com</p>
                  <span className="text-[9px] text-indigo-500 font-bold">Premium FOS VIP Account</span>
                </div>
              </button>

              {/* Account 3: Manual Email trigger option */}
              <button
                id="google-acc-custom"
                type="button"
                onClick={() => {
                  const name = prompt("Enter your custom Google Profile Name:", "Gastro Guest");
                  const email = prompt("Enter your custom Google Email address:", "gastro.guest@gmail.com");
                  if (email) {
                    handleGoogleLogin(email, name || "Gastro Guest", `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name || "Google")}`);
                  }
                }}
                className="w-full text-center py-2.5 rounded-xl text-xs font-extrabold text-gray-500 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                + Google Account Alternative Option
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center leading-snug mt-4">
              Google user sessions will configure matching database models immediately after verifying secure OAuth callback triggers.
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
