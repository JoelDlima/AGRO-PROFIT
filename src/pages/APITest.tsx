import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { fetchMandiPrices } from "@/services/agmarknetService";
import { sendChatMessage } from "@/services/groqService";
import { getCurrentWeather } from "@/services/weatherService";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
  data?: any;
}

export default function APITest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Mandi Price API", status: "pending", message: "Not tested yet" },
    { name: "Groq AI API", status: "pending", message: "Not tested yet" },
    { name: "Weather API", status: "pending", message: "Not tested yet" },
  ]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const newTests: TestResult[] = [];

    // Test 1: Mandi Price API (Use Wheat - more reliable than Tomato)
    try {
      const mandiData = await fetchMandiPrices("Wheat", { limit: 5 });
      if (mandiData && mandiData.records && mandiData.records.length > 0) {
        newTests.push({
          name: "Mandi Price API",
          status: "success",
          message: `✅ Found ${mandiData.records.length} markets. Sample: ${mandiData.records[0].market}, ₹${mandiData.records[0].modal_price}`,
          data: mandiData.records.slice(0, 3),
        });
      } else {
        newTests.push({
          name: "Mandi Price API",
          status: "error",
          message: "❌ No data returned",
        });
      }
    } catch (error: any) {
      newTests.push({
        name: "Mandi Price API",
        status: "error",
        message: `❌ ${error.message.includes('timeout') || error.message.includes('responding') 
          ? 'Request timeout - API is taking too long to respond' 
          : error.message}`,
      });
    }

    // Test 2: Groq AI API
    try {
      const aiResponse = await sendChatMessage("Say hello in one sentence");
      if (aiResponse && aiResponse.length > 10) {
        newTests.push({
          name: "Groq AI API",
          status: "success",
          message: `✅ AI responded: ${aiResponse.substring(0, 100)}...`,
          data: aiResponse,
        });
      } else {
        newTests.push({
          name: "Groq AI API",
          status: "error",
          message: "❌ Invalid response",
        });
      }
    } catch (error: any) {
      newTests.push({
        name: "Groq AI API",
        status: "error",
        message: `❌ Error: ${error.message}`,
      });
    }

    // Test 3: Weather API
    try {
      const weatherData = await getCurrentWeather("Mumbai");
      if (weatherData && weatherData.temp !== undefined) {
        newTests.push({
          name: "Weather API",
          status: "success",
          message: `✅ Mumbai: ${weatherData.temp}°C, ${weatherData.humidity}% humidity, ${weatherData.description}`,
          data: weatherData,
        });
      } else {
        newTests.push({
          name: "Weather API",
          status: "error",
          message: "❌ No data returned",
        });
      }
    } catch (error: any) {
      newTests.push({
        name: "Weather API",
        status: "error",
        message: `❌ Error: ${error.message}`,
      });
    }

    setTests(newTests);
    setTesting(false);
  };

  const successCount = tests.filter((t) => t.status === "success").length;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Integration Test</h1>
          <p className="text-muted-foreground">
            Verify that all API keys are configured correctly
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {successCount}/3 APIs working
              </div>
              <Button
                onClick={runTests}
                disabled={testing}
                className="gap-2"
              >
                {testing && <Loader2 className="h-4 w-4 animate-spin" />}
                {testing ? "Testing..." : "Run Tests"}
              </Button>
            </div>

            <div className="space-y-4">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 flex items-start gap-3"
                >
                  <div className="mt-1">
                    {test.status === "pending" && (
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    )}
                    {test.status === "success" && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {test.status === "error" && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{test.name}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {test.message}
                    </p>
                    {test.data && test.status === "success" && (
                      <details className="mt-2">
                        <summary className="text-xs text-primary cursor-pointer">
                          View raw data
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {successCount === 3 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-semibold">
                  🎉 All APIs are working correctly!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your AgroProfit app is ready with full functionality.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <p>
                Visit the <strong>AI Chatbot</strong> page and ask questions
                about market prices
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <p>
                Check the <strong>Price Comparison</strong> page to see real
                mandi prices
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <p>
                Weather data is automatically included in chatbot responses for
                better advice
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
