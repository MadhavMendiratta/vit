"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Request OTP when component loads
    requestOtp();

    // Countdown timer for resend button
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const requestOtp = async () => {
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      // Reset timer
      setTimeLeft(60);
      setCanResend(false);
    } catch (error) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleResendOtp = () => {
    if (canResend) {
      requestOtp();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Get the callback URL from search params or default to navigation
      const callbackUrl = searchParams.get("callbackUrl") || "/navigation";
      
      // Redirect to intended destination (not just home)
      router.push(callbackUrl.includes("/auth") || callbackUrl.includes("/api/auth")
        ? "/navigation" 
        : callbackUrl);
    } catch (error: any) {
      setError(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            OTP Verification
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Please enter the verification code sent to your email
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="mt-1 text-center text-xl tracking-widest"
              placeholder="******"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend}
              className={`text-primary hover:underline ${
                !canResend && "text-gray-400 cursor-not-allowed"
              }`}
            >
              {canResend ? "Resend OTP" : `Resend in ${timeLeft}s`}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}