import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Sprout, Play } from "lucide-react";

export default function Landing() {
  const { t, language } = useTheme();
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoLogin = () => {
    loginAsDemo();
    toast({
      title: "Welcome to Demo Mode! 🌾",
      description: "Signed in as Demo Farmer with all crops selected and live APIs active.",
    });
    navigate("/dashboard");
  };

  const features = [
    {
      titleKey: "landing.feature1.title",
      descKey: "landing.feature1.desc",
      gif: "/mandi_price.gif",
      fallbackEmoji: "📊",
    },
    {
      titleKey: "landing.feature2.title",
      descKey: "landing.feature2.desc",
      gif: "/price_trend.gif",
      fallbackEmoji: "📈",
    },
    {
      titleKey: "landing.feature3.title",
      descKey: "landing.feature3.desc",
      gif: "/chatbot_ai.gif",
      fallbackEmoji: "🤖",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">
              Agro<span className="text-primary">Profit</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoLogin}
              className="border-primary/50 text-primary hover:bg-primary/10 font-semibold flex items-center gap-1.5"
            >
              <Play className="h-3.5 w-3.5 fill-primary" />
              Demo Login
            </Button>
            <Link to="/auth">
              <Button size="sm">{t("landing.startFree")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero - Compact */}
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-3">
            {t("landing.hero.title")}
            <span className="text-primary"> 💰</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="hero"
              size="lg"
              className="text-base px-6 w-full sm:w-auto shadow-md flex items-center justify-center gap-2"
              onClick={handleDemoLogin}
            >
              <Play className="h-4 w-4 fill-primary-foreground" />
              Demo Login (All Crops)
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="text-base px-6 w-full sm:w-auto">
                {t("landing.hero.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Alternating Left/Right Layout */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl space-y-8">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            // On desktop: alternate layout. On mobile: always text first, then GIF
            return (
              <div 
                key={index}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-6 lg:gap-12 p-5 md:p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300`}
              >
                {/* Text Content - Always first on mobile */}
                <div className={`flex-shrink-0 lg:w-2/5 text-center ${isEven ? 'lg:text-left' : 'lg:text-right'} order-1 lg:order-none`}>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
                
                {/* GIF Container - Larger */}
                <div className="lg:w-3/5 w-full order-2 lg:order-none">
                  <div className="aspect-[16/10] relative bg-muted rounded-xl overflow-hidden shadow-lg border border-border/30">
                    <img 
                      src={feature.gif} 
                      alt={t(feature.titleKey)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="absolute inset-0 flex items-center justify-center text-7xl bg-muted">${feature.fallbackEmoji}</div>`;
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works - Compact 3 Steps */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            {t("landing.howItWorks")}
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
            {/* Step 1 */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary text-primary-foreground text-xl md:text-2xl font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <p className="font-medium text-sm md:text-base">{t("landing.step1")}</p>
            </div>
            
            <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
            <div className="h-4 w-px bg-border md:hidden" />
            
            {/* Step 2 */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary text-primary-foreground text-xl md:text-2xl font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <p className="font-medium text-sm md:text-base">{t("landing.step2")}</p>
            </div>
            
            <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
            <div className="h-4 w-px bg-border md:hidden" />
            
            {/* Step 3 */}
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-success text-success-foreground text-xl md:text-2xl font-bold flex items-center justify-center shrink-0">
                ✓
              </div>
              <p className="font-medium text-sm md:text-base">{t("landing.step3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Compact */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="text-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 md:p-8 border border-primary/20">
            <div className="text-4xl mb-3">🌾</div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              {t("landing.cta.title")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {t("landing.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="hero"
                size="lg"
                onClick={handleDemoLogin}
                className="w-full sm:w-auto shadow-md flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-primary-foreground" />
                Try Demo Login Now
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t("landing.cta.button")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer - Minimal */}
      <footer className="py-4 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sprout className="h-4 w-4 text-primary" />
            <span className="font-medium">AgroProfit</span>
          </div>
          <p className="text-xs">{t("landing.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
