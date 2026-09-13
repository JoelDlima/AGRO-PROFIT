import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, ArrowLeft, Phone, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Auth() {
  const { user, loading, signInWithGoogle, signInWithPhone, verifyOTP, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [authMethod, setAuthMethod] = useState<"choose" | "phone" | "otp">("choose");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleDemoLogin = () => {
    loginAsDemo();
    toast({
      title: "Welcome to Demo Mode! 🌾",
      description: "Signed in as Demo Farmer with full access to all features.",
    });
    navigate("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await signInWithPhone(phoneNumber);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "OTP Sent!",
        description: `We've sent a 6-digit code to +91${phoneNumber}`,
      });
      setAuthMethod("otp");
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await verifyOTP(phoneNumber, otp);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Verification failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "You've successfully signed in",
      });
      navigate("/onboarding");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Sprout className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Agro<span className="text-primary">Profit</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome to AgroProfit
          </h1>
          <p className="text-muted-foreground mb-8">
            {authMethod === "choose" && "Sign in to get started"}
            {authMethod === "phone" && "Enter your phone number"}
            {authMethod === "otp" && `Enter the code sent to +91${phoneNumber}`}
          </p>

          {/* Choose Auth Method */}
          {authMethod === "choose" && (
            <>
              {/* Demo Mode Button - Instant Access */}
              <Button
                onClick={handleDemoLogin}
                className="w-full h-14 text-base font-semibold gap-3 mb-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                <Sprout className="h-5 w-5" />
                Demo Login (Instant Access)
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or sign in with
                  </span>
                </div>
              </div>

              {/* Phone Sign In Button */}
              <Button
                onClick={() => setAuthMethod("phone")}
                className="w-full h-14 text-base font-medium gap-3 mb-4"
              >
                <Phone className="h-5 w-5" />
                Continue with Phone Number
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full h-14 text-base font-medium gap-3 border-2 hover:bg-muted/50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          {/* Phone Number Input */}
          {authMethod === "phone" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center px-3 bg-muted rounded-md border text-sm font-medium">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1"
                    maxLength={10}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSendOTP}
                className="w-full h-12"
                disabled={phoneNumber.length !== 10 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setAuthMethod("choose")}
              >
                Back to options
              </Button>
            </div>
          )}

          {/* OTP Verification */}
          {authMethod === "otp" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-digit OTP</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                onClick={handleVerifyOTP}
                className="w-full h-12"
                disabled={otp.length !== 6 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setOtp("");
                    setAuthMethod("phone");
                  }}
                >
                  Change Number
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleSendOTP}
                  disabled={isSubmitting}
                >
                  Resend OTP
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="text-6xl mb-6">🌾</div>
          <h2 className="text-3xl font-bold mb-4">
            Know your worth, get your price
          </h2>
          <p className="text-lg opacity-90">
            Thousands of farmers are already earning more by selling at the right time and place.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/30"
                />
              ))}
            </div>
            <span className="text-sm opacity-90">50,000+ farmers trust us</span>
          </div>
        </div>
      </div>
    </div>
  );
}
