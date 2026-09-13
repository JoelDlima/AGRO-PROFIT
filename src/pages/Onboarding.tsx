import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sprout, User, Phone, MapPin, Wheat, ChevronRight, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { crops } from "@/data/mockData";

const states = [
  "Maharashtra",
  "Punjab",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Karnataka",
  "Gujarat",
  "Rajasthan",
  "Haryana",
  "Tamil Nadu",
  "Andhra Pradesh",
  "Telangana",
  "West Bengal",
  "Bihar",
  "Odisha",
  "Kerala",
  "Goa",
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    // Check if onboarding is already completed
    if (user) {
      const checkProfile = async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate("/dashboard");
        } else {
          setCheckingProfile(false);
        }
      };
      checkProfile();
    }
  }, [user, loading, navigate]);

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error("No user found");
      return;
    }

    console.log("Submitting profile:", {
      user_id: user.id,
      full_name: fullName,
      phone: phone,
      state: state,
      crops: selectedCrops,
    });

    setIsLoading(true);
    const { error, data } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
        state: state,
        crops: selectedCrops,
        onboarding_completed: true,
      })
      .eq("id", user.id)
      .select();

    console.log("Update result:", { data, error });

    setIsLoading(false);

    if (error) {
      console.error("Supabase error:", error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to AgroProfit!",
        description: "Your profile has been saved.",
      });
      navigate("/dashboard");
    }
  };

  const canProceed = () => {
    if (step === 1) return fullName.trim().length > 0;
    if (step === 2) return phone.trim().length >= 10;
    if (step === 3) return state.length > 0;
    if (step === 4) return selectedCrops.length > 0;
    return false;
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Sprout className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Agro<span className="text-primary">Profit</span>
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                  step > s
                    ? "bg-primary text-primary-foreground"
                    : step === s
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={cn(
                    "w-12 sm:w-20 h-1 mx-1",
                    step > s ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">What's your name?</h1>
                <p className="text-muted-foreground">Let's get to know you better</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Phone */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Your phone number</h1>
                <p className="text-muted-foreground">We'll use this to send you price alerts</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 text-lg"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3: State */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Where are you from?</h1>
                <p className="text-muted-foreground">This helps us show nearby mandis</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Your State</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Crops */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Wheat className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">What do you grow?</h1>
                <p className="text-muted-foreground">Select all crops you want to track</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {crops.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => toggleCrop(crop.name)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      selectedCrops.includes(crop.name)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="font-medium">{crop.icon} {crop.name}</span>
                    {selectedCrops.includes(crop.name) && (
                      <Check className="h-5 w-5 text-primary float-right" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 h-14"
              >
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 h-14 gap-2"
              >
                Continue
                <ChevronRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="flex-1 h-14"
              >
                {isLoading ? "Saving..." : "Get Started"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
