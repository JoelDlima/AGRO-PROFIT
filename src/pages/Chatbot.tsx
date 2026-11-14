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
  Mic
} from "lucide-react";
import { chatSuggestions } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/services/groqService";
import { useTheme } from "@/hooks/useTheme";

const CHAT_STORAGE_KEY = "agroprofit-chat-history";

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
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);

  // Fetch weather data on mount
  useEffect(() => {
    let active = true;
    setWeatherUnavailable(false);
    if (profile?.state) {
      getCurrentWeather(profile.state)
        .then((weather) => {
          if (active) {
            setWeatherUnavailable(!weather);
          }
        })
        .catch(() => {
          if (active) setWeatherUnavailable(true);
        });
    }
    return () => { active = false; };
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
        try {
          const weather = await getCurrentWeather(profile.state);
          weatherContext = weather
            ? formatWeatherForChatbot(profile.state, weather)
            : "Weather data is unavailable. Do not assume current weather conditions.";
          if (!weather) {
            setWeatherUnavailable(true);
          }
        } catch (error) {
          weatherContext = "Weather data is unavailable. Do not assume current weather conditions.";
          setWeatherUnavailable(true);
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
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Market recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p role="status">Recommendations are unavailable. Check official sources for current market prices and advice before making decisions.</p>
                {weatherUnavailable && (
                  <p role="status">Weather data is unavailable right now.</p>
                )}
              </CardContent>
            </Card>
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
                    <div className="text-sm leading-relaxed max-w-none whitespace-pre-wrap">
                      {message.content}
                    </div>
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
        
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
