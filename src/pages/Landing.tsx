import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Scale, Sprout, Wheat } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import type { Language } from "@/lib/translations";

const copy = {
  en: {
    tagline: "Your market, made clearer",
    title: "A clearer view before you sell.",
    intro: "Explore crop prices and compare markets in a simple, easy-to-read view.",
    demo: "Explore sample data",
    signIn: "Sign in",
    note: "Preview mode uses example information. It is not a live market price.",
    board: "A more useful market view",
    boardIntro: "Every price needs context. Look for these details before making a decision.",
    crop: "Your crop",
    cropDetail: "Choose what you grow",
    market: "Market",
    marketDetail: "Know where the price was reported",
    date: "Observation date",
    dateDetail: "Check when the price was recorded",
    unit: "Price and unit",
    unitDetail: "Compare the same units",
    how: "Simple steps, better context",
    howIntro: "Start with your crop. Take the time to check the details.",
    first: "Choose your crop",
    firstDetail: "Start with the crop you want to sell.",
    second: "Compare markets",
    secondDetail: "Look at the market, price, unit and date together.",
    third: "Plan your trip",
    thirdDetail: "Check transport and other costs before deciding.",
    reminder: "Prices can change. Confirm the current rate with the market before travelling.",
    official: "Visit the official Agmarknet portal",
    footer: "A clearer starting point for market decisions.",
    language: "Language",
  },
  hi: {
    tagline: "आपकी मंडी की जानकारी",
    title: "बेचने से पहले जानकारी पाएँ।",
    intro: "फसल के भाव देखें और मंडियों की जानकारी आसानी से समझें।",
    demo: "नमूना जानकारी देखें",
    signIn: "साइन इन",
    note: "इस झलक में नमूना जानकारी है। यह मंडी का लाइव भाव नहीं है।",
    board: "मंडी की जानकारी समझें",
    boardIntro: "फैसला करने से पहले भाव के साथ ये जानकारी भी देखें।",
    crop: "आपकी फसल",
    cropDetail: "अपनी फसल चुनें",
    market: "मंडी",
    marketDetail: "जानें भाव किस मंडी का है",
    date: "भाव की तारीख",
    dateDetail: "देखें भाव कब दर्ज हुआ",
    unit: "भाव और इकाई",
    unitDetail: "समान इकाइयों में तुलना करें",
    how: "आसान कदम, साफ जानकारी",
    howIntro: "अपनी फसल चुनें और विवरण ध्यान से जाँचें।",
    first: "फसल चुनें",
    firstDetail: "जिस फसल को बेचना है उसे चुनें।",
    second: "मंडियों की तुलना करें",
    secondDetail: "मंडी, भाव, इकाई और तारीख साथ देखें।",
    third: "यात्रा की योजना बनाएँ",
    thirdDetail: "फैसले से पहले ढुलाई और दूसरे खर्च जाँचें।",
    reminder: "भाव बदल सकते हैं। जाने से पहले मंडी से आज का भाव पता करें।",
    official: "आधिकारिक Agmarknet पोर्टल देखें",
    footer: "मंडी की जानकारी समझने का एक आसान तरीका।",
    language: "भाषा",
  },
  mr: {
    tagline: "तुमच्या बाजाराची स्पष्ट माहिती",
    title: "विक्रीपूर्वी अधिक माहिती मिळवा.",
    intro: "पिकांचे भाव पाहा आणि बाजारांची माहिती सोप्या पद्धतीने समजून घ्या.",
    demo: "नमुना माहिती पाहा",
    signIn: "साइन इन",
    note: "या नमुन्यातील माहिती बाजाराचा सध्याचा भाव नाही.",
    board: "बाजाराची माहिती समजून घ्या",
    boardIntro: "निर्णय घेण्यापूर्वी भावासोबत या गोष्टीही पाहा.",
    crop: "तुमचे पीक",
    cropDetail: "तुमचे पीक निवडा",
    market: "बाजार",
    marketDetail: "भाव कोणत्या बाजाराचा आहे ते पाहा",
    date: "भावाची तारीख",
    dateDetail: "भाव कधी नोंदला ते तपासा",
    unit: "भाव आणि एकक",
    unitDetail: "समान एककांत तुलना करा",
    how: "सोपे टप्पे, स्पष्ट माहिती",
    howIntro: "तुमचे पीक निवडा आणि तपशील काळजीपूर्वक पाहा.",
    first: "पीक निवडा",
    firstDetail: "विकायचे पीक निवडा.",
    second: "बाजारांची तुलना करा",
    secondDetail: "बाजार, भाव, एकक आणि तारीख एकत्र पाहा.",
    third: "प्रवासाचे नियोजन करा",
    thirdDetail: "निर्णयापूर्वी वाहतूक आणि इतर खर्च तपासा.",
    reminder: "भाव बदलू शकतात. जाण्यापूर्वी बाजारात आजचा भाव तपासा.",
    official: "अधिकृत Agmarknet पोर्टल पाहा",
    footer: "बाजाराची माहिती समजण्यासाठी एक सोपी सुरुवात.",
    language: "भाषा",
  },
} as const;

export default function Landing() {
  const { language, setLanguage } = useTheme();
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();
  // Konkani-specific copy has not yet been reviewed; show English rather than
  // presenting an unverified translation as complete.
  const text = language === "hi" || language === "mr" ? copy[language] : copy.en;

  const enterDemo = () => {
    loginAsDemo();
    navigate("/dashboard");
  };

  const details = [
    { icon: Wheat, title: text.crop, description: text.cropDetail },
    { icon: MapPin, title: text.market, description: text.marketDetail },
    { icon: CalendarDays, title: text.date, description: text.dateDetail },
    { icon: Scale, title: text.unit, description: text.unitDetail },
  ];
  const steps = [
    { title: text.first, description: text.firstDetail },
    { title: text.second, description: text.secondDetail },
    { title: text.third, description: text.thirdDetail },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" onClick={(event) => { event.preventDefault(); document.getElementById("main")?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-background focus:p-3">
        Skip to content
      </a>
      <header className="border-b border-border bg-background pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto flex min-h-[76px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2.5 font-extrabold tracking-tight" aria-label="AgroProfit home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sprout aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="text-xl">AgroProfit</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <label className="sr-only" htmlFor="landing-language">{text.language}</label>
            <select
              id="landing-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className="min-h-11 max-w-[125px] rounded-lg border border-border bg-background px-2 text-sm font-semibold text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary sm:max-w-none"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="kok">Konkani / English</option>
            </select>
            <Link to="/auth" className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              {text.signIn}
            </Link>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="relative overflow-hidden border-b border-border">
          <div className="container mx-auto grid gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-16 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-primary">
                <Sprout aria-hidden="true" className="h-4 w-4" /> {text.tagline}
              </p>
              <h1 className="max-w-[14ch] text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {text.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {text.intro}
              </p>
              <button
                type="button"
                onClick={enterDemo}
                className="group mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 text-base font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
              >
                {text.demo}
                <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </button>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">{text.note}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.1em] text-primary">AgroProfit</p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{text.board}</h2>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Sprout aria-hidden="true" className="h-6 w-6" />
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text.boardIntro}</p>
              <div className="mt-5 divide-y divide-border">
                {details.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-center gap-4 py-4">
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-bold">{title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{text.how}</h2>
            <p className="mt-3 text-lg text-muted-foreground">{text.howIntro}</p>
          </div>
          <ol className="mt-8 grid gap-6 border-t border-border pt-7 md:grid-cols-3 md:gap-10">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 text-sm font-extrabold text-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 border-l-4 border-primary bg-primary/5 px-5 py-4">
            <p className="font-semibold leading-relaxed">{text.reminder}</p>
            <a href="https://agmarknet.gov.in/" target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline underline-offset-4">
              {text.official} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground sm:px-6">
        <div className="container mx-auto flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-extrabold text-foreground">AgroProfit</span>
          <span>{text.footer}</span>
        </div>
      </footer>
    </div>
  );
}
