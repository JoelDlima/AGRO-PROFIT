import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { crops } from "@/data/mockData";

// Helper to detect if running in Capacitor native app
const isNativeApp = () => Capacitor.isNativePlatform();

// Get the appropriate redirect URL based on platform
const getRedirectUrl = () => {
  if (isNativeApp()) {
    // Use custom scheme for native app deep linking
    return 'com.agroprofit.app://onboarding';
  }
  return `${window.location.origin}/onboarding`;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ error: Error | null }>;
  loginAsDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper to load mock user if present
    const loadStoredMockUser = () => {
      try {
        const storedUser = localStorage.getItem('mock_user');
        const storedSession = localStorage.getItem('mock_session');
        if (storedUser && storedSession) {
          setUser(JSON.parse(storedUser));
          setSession(JSON.parse(storedSession));
          setLoading(false);
          return true;
        }
      } catch (e) {
        console.error('Error loading mock user:', e);
      }
      return false;
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else {
          if (!loadStoredMockUser()) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } else {
        if (!loadStoredMockUser()) {
          setLoading(false);
        }
      }
    });

    // Handle deep links for OAuth callback in native app
    if (isNativeApp()) {
      App.addListener('appUrlOpen', async (event: URLOpenListenerEvent) => {
        console.log('[Auth] Deep link received:', event.url);
        
        // Handle OAuth callback - extract tokens from URL
        const url = new URL(event.url);
        
        // Check if this is an auth callback (has access_token or code)
        if (url.hash || url.searchParams.has('code')) {
          // For hash-based tokens (implicit flow)
          if (url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken) {
              console.log('[Auth] Setting session from deep link tokens');
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
            }
          }
        }
      });
    }

    return () => {
      subscription.unsubscribe();
      if (isNativeApp()) {
        App.removeAllListeners();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    const redirectUrl = getRedirectUrl();
    console.log('[Auth] Starting Google OAuth with redirect:', redirectUrl);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signInWithPhone = async (phone: string) => {
    // Format phone number to include country code if not present
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });
    return { error };
  };

  const verifyOTP = async (phone: string, otp: string) => {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });

    // If verification successful, update profile with phone number
    if (!error && data.user) {
      // Check if profile exists and update phone
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          phone: formattedPhone,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });
      
      if (profileError) {
        console.error('Error updating profile with phone:', profileError);
      }
    }
    
    return { error };
  };

  const loginAsDemo = () => {
    const demoUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo@agroprofit.pro',
      user_metadata: { full_name: 'Demo Farmer', phone: '+919876543210' },
      app_metadata: { provider: 'demo' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User;

    const demoSession = {
      user: demoUser,
      access_token: 'demo-access-token',
      refresh_token: 'demo-refresh-token',
    } as unknown as Session;

    const allCropNames = crops.map((c) => c.name);
    const demoProfile = {
      id: demoUser.id,
      full_name: 'Demo Farmer',
      phone: '+919876543210',
      state: 'Maharashtra',
      crops: allCropNames,
      preferred_language: 'en',
      onboarding_completed: true,
    };

    localStorage.setItem('demo_profile', JSON.stringify(demoProfile));
    localStorage.setItem('mock_user', JSON.stringify(demoUser));
    localStorage.setItem('mock_session', JSON.stringify(demoSession));
    setUser(demoUser);
    setSession(demoSession);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_session');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithPhone, verifyOTP, loginAsDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
