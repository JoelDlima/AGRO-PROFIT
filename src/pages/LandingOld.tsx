import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme } from "@/hooks/useTheme";
import { 
  TrendingUp, 
  MapPin, 
  MessageCircle, 
  Shield,
  ArrowRight,
  Sprout,
  IndianRupee,
  BarChart3,
  Check,
  Zap,
  Globe,
  Clock,
  Wheat,
  CloudSun,
  Tractor,
  Leaf,
  Sun
} from "lucide-react";

export default function Landing() {
  const { t } = useTheme();

  const features = [
    {
      icon: TrendingUp,
      titleKey: "feature.prices.title",
      descKey: "feature.prices.desc",
      detailKey: "feature.prices.detail",
      color: "bg-primary",
    },
    {
      icon: MapPin,
      titleKey: "feature.market.title",
      descKey: "feature.market.desc",
      detailKey: "feature.market.detail",
      color: "bg-secondary",
    },
    {
      icon: MessageCircle,
      titleKey: "feature.ai.title",
      descKey: "feature.ai.desc",
      detailKey: "feature.ai.detail",
      color: "bg-accent",
    },
    {
      icon: Shield,
      titleKey: "feature.schemes.title",
      descKey: "feature.schemes.desc",
      detailKey: "feature.schemes.detail",
      color: "bg-success",
    },
  ];

  return (
    <AppLayout>
      {/* Global Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating agricultural icons */}
        <Wheat className="absolute top-[15%] left-[5%] w-16 h-16 text-primary/[0.07] animate-float" style={{ animationDelay: '0s' }} />
        <Leaf className="absolute top-[25%] right-[8%] w-12 h-12 text-success/[0.08] animate-float" style={{ animationDelay: '1s' }} />
        <CloudSun className="absolute top-[40%] left-[3%] w-14 h-14 text-accent/[0.08] animate-float" style={{ animationDelay: '2s' }} />
        <Tractor className="absolute bottom-[30%] right-[5%] w-16 h-16 text-secondary/[0.07] animate-float" style={{ animationDelay: '1.5s' }} />
        <Sprout className="absolute bottom-[20%] left-[8%] w-10 h-10 text-primary/[0.08] animate-float" style={{ animationDelay: '0.5s' }} />
        <Sun className="absolute top-[60%] right-[10%] w-12 h-12 text-accent/[0.06] animate-float" style={{ animationDelay: '2.5s' }} />
        <Wheat className="absolute bottom-[45%] left-[12%] w-10 h-10 text-success/[0.06] animate-float" style={{ animationDelay: '3s' }} />
        <Leaf className="absolute top-[70%] left-[15%] w-8 h-8 text-primary/[0.05] animate-float" style={{ animationDelay: '1.8s' }} />
        
        {/* Large gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-success/[0.03] rounded-full blur-[80px]" />
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        {/* Decorative shapes */}
        <div className="absolute top-32 right-[15%] w-24 h-24 border-2 border-primary/10 rounded-full" />
        <div className="absolute bottom-32 left-[10%] w-16 h-16 border-2 border-accent/15 rounded-lg rotate-45" />
        <div className="absolute top-1/3 left-[20%] w-3 h-3 bg-primary/20 rounded-full" />
        <div className="absolute top-1/4 right-[25%] w-2 h-2 bg-accent/30 rounded-full" />
        <div className="absolute bottom-1/3 right-[20%] w-4 h-4 bg-success/20 rounded-full" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in border border-primary/20 backdrop-blur-sm">
              <Sprout className="h-4 w-4" />
              <span>{t("landing.badge")}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 animate-slide-up">
              {t("landing.headline")}{" "}
              <span className="text-gradient">{t("landing.headline2")}</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {t("landing.subheadline")}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/auth">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  {t("landing.getStarted")}
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <p className="text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              🇮🇳 {t("landing.trustIndicator")}
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="relative py-20 md:py-28 bg-muted/30 overflow-hidden">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("landing.featuresTitle")}
            </h2>
            <p className="text-muted-foreground">
              {t("landing.featuresSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.titleKey}
                className="group relative p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className={`h-12 w-12 rounded-xl ${feature.color} text-primary-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(feature.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features - Scroll Section */}
      <section className="relative py-20 md:py-28 border-t border-border overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          {features.map((feature, index) => {
            const featureHighlights = [
              ["Live prices from 500+ mandis", "Historical price trends", "Price alerts & notifications"],
              ["Distance & transport cost analysis", "Profit margin calculator", "Personalized recommendations"],
              ["Voice & text support", "Crop disease identification", "Weather-based advice"],
              ["Eligibility checker", "Application deadlines", "Direct links to apply"],
            ];
            
            return (
              <div 
                key={feature.titleKey}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 mb-24 last:mb-0`}
              >
                {/* Feature Visual */}
                <div className="flex-1 w-full">
                  <div className={`relative rounded-3xl border border-border bg-card shadow-lg p-8 md:p-12 overflow-hidden`}>
                    <div className={`absolute inset-0 ${feature.color}/5`} />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                      <div className={`h-20 w-20 rounded-2xl ${feature.color} text-primary-foreground flex items-center justify-center mb-6 shadow-lg`}>
                        <feature.icon className="h-10 w-10" />
                      </div>
                      
                      {/* Feature highlights with actual content */}
                      <div className="space-y-3 mt-8">
                        {featureHighlights[index].map((highlight, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-border shadow-sm">
                            <div className="h-8 w-8 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0">
                              <Check className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Content */}
                <div className="flex-1 space-y-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card shadow-sm text-foreground text-sm font-medium`}>
                    <feature.icon className="h-4 w-4" />
                    <span>Feature {index + 1}</span>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                    {t(feature.titleKey)}
                  </h3>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t(feature.detailKey)}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-4">
                    {index === 0 && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>Updated hourly</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>500+ mandis</span>
                        </div>
                      </>
                    )}
                    {index === 1 && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <Zap className="h-4 w-4 text-secondary" />
                          <span>Smart recommendations</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <TrendingUp className="h-4 w-4 text-secondary" />
                          <span>Profit optimization</span>
                        </div>
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <Globe className="h-4 w-4 text-accent" />
                          <span>Multi-language support</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <MessageCircle className="h-4 w-4 text-accent" />
                          <span>24/7 available</span>
                        </div>
                      </>
                    )}
                    {index === 3 && (
                      <>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <Shield className="h-4 w-4 text-success" />
                          <span>Verified information</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 shadow-sm">
                          <IndianRupee className="h-4 w-4 text-success" />
                          <span>Direct application links</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 bg-muted/50 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(-45deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("landing.howItWorks")}
            </h2>
            <p className="text-muted-foreground">
              {t("landing.howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                icon: Sprout,
                titleKey: "step1.title",
                descKey: "step1.desc",
              },
              {
                step: "2",
                icon: BarChart3,
                titleKey: "step2.title",
                descKey: "step2.desc",
              },
              {
                step: "3",
                icon: IndianRupee,
                titleKey: "step3.title",
                descKey: "step3.desc",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center animate-slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-muted-foreground">
                  {t(item.descKey)}
                </p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center bg-gradient-hero rounded-3xl p-10 md:p-16 text-primary-foreground shadow-2xl border border-primary/20 relative overflow-hidden">
            {/* Inner decorative patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
            <div className="relative">
              <Sprout className="h-12 w-12 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("landing.ctaTitle")}
              </h2>
              <p className="text-lg opacity-90 mb-8">
                {t("landing.ctaSubtitle")}
              </p>
              <Link to="/auth">
                <Button variant="accent" size="xl" className="shadow-xl">
                  {t("landing.createAccount")}
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-border overflow-hidden">
        {/* Footer background decoration */}
        <div className="absolute inset-0 bg-gradient-to-t from-muted/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:24px_100%]" />
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="font-bold text-foreground">AgroProfit</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 {t("landing.footer.copyright")}
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">{t("common.privacy")}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t("common.terms")}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t("common.contact")}</a>
            </div>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}