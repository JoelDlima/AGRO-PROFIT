import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  Mic,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Truck
} from "lucide-react";
import { chatSuggestions } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/services/groqService";
import { useTheme } from "@/hooks/useTheme";
import { getMarketRecommendation, getPricePrediction } from "@/services/aiRecommendationService";

const CHAT_STORAGE_KEY = "agroprofit-chat-history";

// Structured markdown formatter for crisp, well-formatted responses
function formatMarkdown(text: string): string {
  if (!text) return "";

  const lines = text.split("\n");
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return `<h3 class="text-sm font-bold text-primary mt-2 mb-1">${trimmed.slice(4)}</h3>`;
    }
    if (trimmed.startsWith("## ")) {
      return `<h2 class="text-base font-bold text-primary mt-2.5 mb-1">${trimmed.slice(3)}</h2>`;
    }
    if (trimmed.startsWith("# ")) {
      return `<h1 class="text-base font-bold text-primary mt-3 mb-1.5">${trimmed.slice(2)}</h1>`;
    }
    if (/^[•\-\*]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[•\-\*]\s+/, "");
      return `<div class="flex items-start gap-2 my-1 leading-relaxed"><span class="text-primary font-bold select-none">•</span><span class="flex-1">${itemText}</span></div>`;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+(.*)/);
      if (match) {
        return `<div class="flex items-start gap-2 my-1 leading-relaxed"><span class="text-primary font-semibold select-none">${match[1]}</span><span class="flex-1">${match[2]}</span></div>`;
      }
    }
    return trimmed;
  });

  let html = formattedLines.join("\n");
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n\n+/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br/>');

  return html;
}
import { getCurrentWeather, formatWeatherForChatbot } from "@/services/weatherService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const getInitialMessages = (): Message[] => {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (error) {
    console.error("Error loading chat history:", error);
  }
  return [
    {
      id: "1",
      role: "assistant",
      content: "Namaste!\n\nI'm AgroProfit AI, your farming assistant. I can help with:\n\n**Market Prices** - Compare mandi rates\n**Selling Advice** - Best time and place to sell\n**Crop Information** - Varieties and best practices\n**Weather Impact** - How weather affects your decisions\n**Government Schemes** - Available benefits and subsidies\n\nPlease ask me anything specific about your farming needs!",
      timestamp: new Date(),
    },
  ];
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);
  const recognitionRef = useRef<any>(null);
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const { t, language } = useTheme();
  const [weatherData, setWeatherData] = useState<any>(null);

  // Fetch weather data on mount
  useEffect(() => {
    if (profile?.state) {
      getCurrentWeather(profile.state).then(setWeatherData);
    }
  }, [profile?.state]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // If user is more than 80px from bottom, they intentionally scrolled up
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 80;
  };

  const scrollToBottom = (force = false) => {
    if (!chatContainerRef.current) return;
    if (force || !isUserScrolledUp.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      // Only save if there's more than the initial message
      if (messages.length > 0) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // Map language codes to speech recognition locale
      const langMap: Record<string, string> = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN',
        'kok': 'kok-IN'
      };
      recognitionRef.current.lang = langMap[language] || 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: "Error",
          description: "Could not capture voice. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language, toast]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    isUserScrolledUp.current = false;
    setTimeout(() => scrollToBottom(true), 50);

    try {
      // Fetch weather data if user has a state
      let weatherContext = "";
      if (profile?.state) {
        const weather = await getCurrentWeather(profile.state);
        if (weather) {
          weatherContext = formatWeatherForChatbot(profile.state, weather);
        }
      }

      // Create a streaming message placeholder
      const assistantId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setTimeout(() => scrollToBottom(), 50);

      // Call Groq API with user context including weather
      const response = await sendChatMessage(messageText, {
        userState: profile?.state,
        userCrops: profile?.crops,
        weatherData: weatherContext,
        language: language,
      });

      // Stream response in smooth chunks (3 words at a time) without freezing UI or locking page
      const words = response.split(' ');
      const chunkSize = 3;
      for (let i = 0; i < words.length; i += chunkSize) {
        const partialContent = words.slice(0, i + chunkSize).join(' ');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: partialContent, isStreaming: i + chunkSize < words.length }
              : msg
          )
        );
        scrollToBottom();
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try:\n\n• Check the Price Comparison page for live market data\n• Visit the Profile page to update your crop preferences\n• Try asking your question again in a moment\n\nSorry for the inconvenience!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-hero text-primary-foreground flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("chatbot.title")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("chatbot.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: AI Market Intelligence */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t("ai.marketIntelligence")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile?.crops && profile.crops.length > 0 ? (
                  <>
                    {profile.crops.slice(0, 3).map((cropName, idx) => {
                      const recommendation = getMarketRecommendation(
                        cropName, 
                        100, 
                        profile?.state || 'Maharashtra',
                        weatherData?.description?.toLowerCase().includes('rain') ? 'rainy' : 'sunny'
                      );
                      const prediction = getPricePrediction(cropName);
                      
                      // Get translated crop name
                      const getCropDisplayName = (crop: string) => {
                        const cropKey = `crop.${crop.toLowerCase()}`;
                        const translated = t(cropKey);
                        return translated !== cropKey ? translated : crop;
                      };
                      
                      return (
                        <div key={idx} className="p-3 rounded-lg border bg-card/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{getCropDisplayName(cropName)}</span>
                            <div className={cn("text-xs px-2 py-0.5 rounded-full", {
                              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400": prediction.trend === 'rising',
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": prediction.trend === 'falling',
                              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400": prediction.trend === 'stable',
                            })}>
                              {prediction.trend === 'rising' ? `📈 ${t("ai.rising")}` : prediction.trend === 'falling' ? `📉 ${t("ai.falling")}` : `➡️ ${t("ai.stable")}`}
                            </div>
                          </div>
                          
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("ai.current")}:</span>
                              <span className="font-semibold">₹{recommendation.currentPrice.toFixed(2)}/kg</span>
                            </div>
                            {recommendation.predictedPrice && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">{t("ai.in3d")}:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">₹{recommendation.predictedPrice.toFixed(2)}/kg</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("ai.bestMarket")}:</span>
                              <span className="font-semibold truncate max-w-[120px]">{recommendation.bestMarket.split(' ')[0]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("ai.transport")}:</span>
                              <span className="font-semibold text-orange-600 dark:text-orange-400">₹{recommendation.transportCost}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t("ai.netProfit")}:</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">₹{recommendation.netProfit?.toFixed(0)}</span>
                            </div>
                          </div>
                          
                          <div className={cn("text-[10px] p-2 rounded", {
                            "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400": recommendation.action === 'wait',
                            "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400": recommendation.action === 'sell_now',
                            "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400": recommendation.action === 'sell_specific_market',
                          })}>
                            {recommendation.action === 'wait' && `⏳ ${t("ai.waitForBetterPrices")}`}
                            {recommendation.action === 'sell_now' && `⚡ ${t("ai.sellImmediately")}`}
                            {recommendation.action === 'sell_specific_market' && `📊 ${t("ai.sellAtRecommended")}`}
                          </div>
                        </div>
                      );
                    })}
                    
                    <div className="text-xs text-center text-muted-foreground pt-2 border-t">
                      <div className="flex items-center justify-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span>{t("ai.confidence")}: 85-90%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    <p>{t("ai.addCropsForRecommendations")}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.href = '/profile'}>
                      {t("ai.goToProfile")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 7-Day Price Forecast */}
            {profile?.crops && profile.crops.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {t("ai.7dayForecast")}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{profile.crops[0]}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getPricePrediction(profile.crops[0]).predictedPrices.slice(0, 7).map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">₹{p.price}/kg</span>
                          <span className={cn("text-[10px]", 
                            p.change > 0 ? "text-green-600 dark:text-green-400" : 
                            p.change < 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400")}>
                            {p.change > 0 ? '▲' : p.change < 0 ? '▼' : '●'} {Math.abs(p.change)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Chat Interface */}
          <div className="lg:col-span-2">
            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 mb-4 animate-slide-up">
          {chatSuggestions.slice(0, 4).map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => handleSend(suggestion)}
              className="text-xs"
              disabled={isLoading}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Chat Container */}
        <Card className="mb-4 animate-slide-up delay-100">
          <CardContent className="p-4">
            <div ref={chatContainerRef} onScroll={handleScroll} className="h-[400px] md:h-[500px] overflow-y-auto space-y-4 pr-2">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-slide-up",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    message.role === "assistant" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={cn(
                    "flex-1 max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "assistant" 
                      ? "bg-muted text-foreground rounded-tl-sm" 
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  )}>
                    <div className={cn(
                          "text-sm leading-relaxed max-w-none",
                          message.role === "assistant" 
                            ? "prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-1.5" 
                            : "whitespace-pre-wrap"
                        )} 
                         dangerouslySetInnerHTML={{ 
                           __html: message.role === "assistant" 
                             ? formatMarkdown(message.content)
                             : message.content 
                         }} 
                    />
                    <p className={cn(
                      "text-[10px] mt-2",
                      message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}>
                      {message.timestamp.toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t("chatbot.thinking")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input Area */}
        <div className="flex gap-2 animate-slide-up delay-200">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("chatbot.placeholder")}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleVoiceInput}
            disabled={isLoading}
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            className="shrink-0"
          >
            <Mic className={cn("h-4 w-4", isRecording && "animate-pulse")} />
          </Button>
          <Button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center mt-4 mb-4">
          {t("chatbot.disclaimer")}
        </p>
        
        {/* Transport & Mandi Comparison - Side by Side Below Chat */}
        {profile?.crops && profile.crops.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* Transport Cost Analysis */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  {t("ai.transportCostAnalysis")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const rec = getMarketRecommendation(profile.crops[0], 100, profile?.state || 'Maharashtra');
                  return (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-muted-foreground text-xs mb-1">{t("ai.bestMarket")}</div>
                          <div className="font-semibold text-sm">{rec.bestMarket}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-muted-foreground text-xs mb-1">{t("ai.distance")}</div>
                          <div className="font-semibold">{rec.alternativeMarkets?.[0]?.distance || '45 km'}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                          <div className="font-bold text-orange-600 dark:text-orange-400 text-lg">₹{rec.transportCost}</div>
                          <div className="text-muted-foreground text-xs">{t("ai.transportCost")}</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <div className="font-bold text-green-600 dark:text-green-400 text-lg">₹{rec.netProfit?.toFixed(0)}</div>
                          <div className="text-muted-foreground text-xs">{t("ai.netProfit")}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            
            {/* Mandi Comparison with Reasoning */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t("ai.mandiComparison")}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{profile.crops[0]} - 100kg</p>
              </CardHeader>
              <CardContent>
                {(() => {
                  const rec = getMarketRecommendation(profile.crops[0], 100, profile?.state || 'Maharashtra');
                  return (
                    <div className="space-y-2">
                      {/* Best Market Highlight */}
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-green-700 dark:text-green-400">🏆 {rec.bestMarket}</span>
                          <span className="text-green-600 dark:text-green-400 font-bold text-sm">₹{rec.currentPrice}/kg</span>
                        </div>
                      </div>
                      
                      {/* Alternative Markets */}
                      {rec.alternativeMarkets?.slice(0, 2).map((market, idx) => (
                        <div key={idx} className="p-2 bg-muted/30 rounded-lg text-xs flex justify-between items-center">
                          <span className="font-medium">{market.name}</span>
                          <span className={market.profitDifference > 0 ? "text-green-600" : "text-red-600"}>
                            {market.profitDifference > 0 ? '+' : ''}{market.profitDifference.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                      
                      {/* AI Reasoning */}
                      <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg mt-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-semibold text-primary">{t("ai.aiReasoning")}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                          {rec.reasoning}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
