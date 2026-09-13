import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import { crops } from "@/data/mockData";

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  state: string | null;
  crops: string[] | null;
  preferred_language: string | null;
  onboarding_completed: boolean | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Check if demo user
    if (user.id === '00000000-0000-0000-0000-000000000001' || user.email === 'demo@agroprofit.pro') {
      const storedDemo = localStorage.getItem('demo_profile');
      const allCropNames = crops.map(c => c.name);
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          // If stored demo profile has fewer crops or is outdated, ensure all crops are populated
          if (!parsed.crops || parsed.crops.length < allCropNames.length) {
            parsed.crops = allCropNames;
            localStorage.setItem('demo_profile', JSON.stringify(parsed));
          }
          setProfile(parsed);
        } catch (e) {
          setProfile(null);
        }
      } else {
        const defaultDemo: UserProfile = {
          id: user.id,
          full_name: 'Demo Farmer',
          phone: '+919876543210',
          state: 'Maharashtra',
          crops: allCropNames,
          preferred_language: 'en',
          onboarding_completed: true,
        };
        localStorage.setItem('demo_profile', JSON.stringify(defaultDemo));
        setProfile(defaultDemo);
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    if (user.id === '00000000-0000-0000-0000-000000000001' || user.email === 'demo@agroprofit.pro') {
      const allCropNames = crops.map(c => c.name);
      const current = profile || {
        id: user.id,
        full_name: 'Demo Farmer',
        phone: '+919876543210',
        state: 'Maharashtra',
        crops: allCropNames,
        preferred_language: 'en',
        onboarding_completed: true,
      };
      const updated = { ...current, ...updates };
      localStorage.setItem('demo_profile', JSON.stringify(updated));
      setProfile(updated);
      return { error: null };
    }

    try {
      console.log("Updating profile with:", updates);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Profile updated successfully");
      
      // Refresh profile from database
      await fetchProfile();
      
      return { error: null };
    } catch (err) {
      console.error("Error updating profile:", err);
      return { error: err as Error };
    }
  };

  const addCrop = async (cropName: string) => {
    if (!profile) return { error: new Error("Profile not loaded") };

    const currentCrops = profile.crops || [];
    if (currentCrops.includes(cropName)) {
      return { error: new Error("Crop already exists") };
    }

    const newCrops = [...currentCrops, cropName];
    const result = await updateProfile({ crops: newCrops });

    if (!result.error) {
      toast({ title: "Crop added successfully" });
    }

    return result;
  };

  const removeCrop = async (cropName: string) => {
    if (!profile) return { error: new Error("Profile not loaded") };

    const currentCrops = profile.crops || [];
    const newCrops = currentCrops.filter((c) => c !== cropName);
    const result = await updateProfile({ crops: newCrops });

    if (!result.error) {
      toast({ title: "Crop removed" });
    }

    return result;
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    addCrop,
    removeCrop,
    refetch: fetchProfile,
  };
}