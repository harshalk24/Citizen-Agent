"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, Phone, X, Loader2, CheckCircle, Eye } from "lucide-react";

interface Props {
  onVerified: (citizenId: string) => void;
  onClose: () => void;
  sessionId?: string;
}

export default function IdentityGate({ onVerified, onClose, sessionId }: Props) {
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  async function handleSendOTP() {
    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setDemoCode(data.demoCode || "");
      setStep("otp");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone, code, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setStep("success");
      setTimeout(() => onVerified(data.citizenId), 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Incorrect code");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleOtpInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass rounded-2xl border border-white/10 p-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "phone" && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-brand" />
            </div>
            <h2 className="text-2xl font-700 mb-2">Verify Your Identity</h2>
            <p className="text-white/50 text-sm mb-6">
              Save your action plan and track your entitlements. We only need your phone number.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-500 text-white/70 mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 glass border border-white/10 rounded-xl px-3 py-3 text-sm text-white/60 whitespace-nowrap">
                    <Phone className="w-4 h-4" />
                    +353
                  </div>
                  <input
                    type="tel"
                    placeholder="087 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                    className="flex-1 glass border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand/50 transition-colors"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                Send Verification Code
              </button>
            </div>

            <p className="text-xs text-white/30 text-center mt-4">
              Your phone is used for verification only. We never share it.
            </p>
          </div>
        )}

        {step === "otp" && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-6">
              <Phone className="w-7 h-7 text-brand" />
            </div>
            <h2 className="text-2xl font-700 mb-2">Enter Your Code</h2>
            <p className="text-white/50 text-sm mb-6">
              We sent a 6-digit code to <span className="text-white">{phone}</span>
            </p>

            {/* Demo code display */}
            {demoCode && (
              <div className="flex items-center gap-2 glass border border-brand/20 rounded-xl px-4 py-3 mb-6 text-sm">
                <Eye className="w-4 h-4 text-brand" />
                <span className="text-white/50">Demo code:</span>
                <span className="text-brand font-700 tracking-widest">{demoCode}</span>
              </div>
            )}

            {/* OTP inputs */}
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-14 text-center text-xl font-700 glass border border-white/15 rounded-xl focus:border-brand/50 focus:outline-none transition-colors text-white"
                />
              ))}
            </div>

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white py-3 rounded-xl font-600 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Save Plan"}
            </button>

            <button
              onClick={() => { setStep("phone"); setError(""); }}
              className="w-full text-center text-sm text-white/40 hover:text-white/70 mt-3 transition-colors"
            >
              Change number
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-700 mb-2">Identity Verified</h2>
            <p className="text-white/50">Your plan has been saved. Redirecting…</p>
          </div>
        )}
      </div>
    </div>
  );
}
