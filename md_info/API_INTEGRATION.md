/**
 * API Integration Guide for AgroProfit
 * 
 * This document explains how the real APIs are integrated and how to test them.
 */

# API Integration Overview

## 1. Gemini AI Service (`src/services/geminiService.ts`)

### Purpose
Powers the intelligent chatbot assistant that helps farmers with:
- Market price queries
- Selling recommendations
- Government scheme information
- Farming advice

### How It Works
```typescript
import { sendChatMessage } from '@/services/geminiService';

// Send a message with user context
const response = await sendChatMessage(
  "What's the best price for tomatoes?",
  {
    userState: "Maharashtra",
    userCrops: ["Tomato", "Onion"],
    language: "en"
  }
);
```

### Setup Required
1. Get API key from: https://makersuite.google.com/app/apikey
2. Add to `.env`: `VITE_GEMINI_API_KEY="your-key"`
3. Restart dev server

### Fallback Behavior
If API key is not configured, the service provides pre-programmed helpful responses as fallback.

---

## 2. Agmarknet Service (`src/services/agmarknetService.ts`)

### Purpose
Fetches real-time mandi (market) prices from Government of India databases.

### How It Works
```typescript
import { fetchMandiPrices } from '@/services/agmarknetService';

// Fetch prices for a commodity
const data = await fetchMandiPrices("Tomato", {
  state: "Maharashtra",
  district: "Nashik",
  limit: 20
});

// Returns:
// {
//   records: [
//     {
//       state: "Maharashtra",
//       market: "Lasalgaon",
//       commodity: "Tomato",
//       modal_price: "45",
//       min_price: "35",
//       max_price: "55",
//       arrival_date: "2025-12-08"
//     }
//   ]
// }
```

### Setup Required
1. Register at: https://data.gov.in/user/register
2. Get your API key from profile page
3. Add to `.env`: `VITE_DATA_GOV_API_KEY="your-key"`
4. Restart dev server

### Usage in Components
```typescript
import { useMandiPrices } from '@/hooks/useMandiPrices';

function PriceComponent() {
  const { markets, averagePrice, isLoading } = useTransformedMarkets("Tomato", "Maharashtra");
  
  return (
    <div>
      {markets.map(market => (
        <div key={market.id}>
          {market.name}: ₹{market.price}/kg
        </div>
      ))}
    </div>
  );
}
```

---

## 3. React Query Integration

Both services are integrated with React Query for:
- Automatic caching
- Background refetching
- Loading states
- Error handling

### Configuration
```typescript
// In main.tsx or app component
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes
      retry: 2,
    },
  },
});
```

---

## 4. Testing APIs

### Test Gemini AI (Chatbot)
1. Navigate to `/chatbot` page
2. Ask questions like:
   - "What's the tomato price today?"
   - "Where should I sell onions?"
   - "Tell me about PM-KISAN"

**Expected Behavior:**
- With API key: Real AI responses
- Without API key: Helpful fallback responses

### Test Agmarknet (Price Data)
1. Navigate to `/prices` page
2. Select a crop from dropdown
3. View real market prices

**Expected Behavior:**
- With API key: Real government data
- Without API key: Mock data (from mockData.ts)

---

## 5. Error Handling

### Gemini Service
```typescript
try {
  const response = await sendChatMessage(message);
} catch (error) {
  // Falls back to pre-programmed responses
  // Shows toast notification to user
}
```

### Agmarknet Service
```typescript
try {
  const data = await fetchMandiPrices(commodity);
} catch (error) {
  // React Query handles retry logic
  // Component shows error state
  // Falls back to cached data if available
}
```

---

## 6. Rate Limits & Best Practices

### Gemini API
- Free tier: 60 requests/minute, 1500/day
- Caching: Responses cached for 5 minutes
- Strategy: Use for chat only, not bulk operations

### Agmarknet API
- Free tier: 1000 requests/day
- Caching: Data cached for 15 minutes
- Auto-refresh: Every 30 minutes in background
- Strategy: Batch requests, use filters wisely

---

## 7. Environment Variables

### Required for Full Functionality
```env
# AI Chatbot
VITE_GEMINI_API_KEY="your-gemini-key"

# Market Prices
VITE_DATA_GOV_API_KEY="your-data-gov-key"

# Already Configured
VITE_SUPABASE_URL="https://vkroiucdsnpeaiksenzm.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-key"
```

---

## 8. Debugging

### Check if API keys are loaded
```typescript
console.log('Gemini Key:', import.meta.env.VITE_GEMINI_API_KEY);
console.log('Data.gov Key:', import.meta.env.VITE_DATA_GOV_API_KEY);
```

### Check API responses
```typescript
// In browser console
localStorage.debug = '*'; // Enable React Query devtools
```

### Common Issues

**Issue:** "API Key not configured"
- **Fix:** Add key to `.env`, restart server

**Issue:** "403 Forbidden"
- **Fix:** Verify API key is correct

**Issue:** "Too many requests"
- **Fix:** Wait, or reduce request frequency

**Issue:** No data showing
- **Fix:** Check browser Network tab, verify API endpoint

---

## 9. Extending the APIs

### Add New Crop
```typescript
// In mockData.ts
export const crops: Crop[] = [
  // ... existing crops
  { 
    id: 'mango', 
    name: 'Mango', 
    nameHi: 'आम', 
    icon: '🥭', 
    unit: 'kg' 
  },
];
```

### Add Price Prediction
```typescript
// In services/agmarknetService.ts
export async function predictFuturePrice(
  commodity: string,
  days: number
): Promise<number> {
  // Fetch historical data
  // Apply simple moving average or ML model
  // Return predicted price
}
```

### Add Weather Integration
```typescript
// New file: services/weatherService.ts
export async function getWeatherImpact(
  location: string
): Promise<{
  temperature: number;
  rainfall: number;
  recommendation: string;
}> {
  // Call OpenWeatherMap API
  // Analyze impact on crops
  // Return advice
}
```

---

## 10. Production Checklist

Before deploying to production:

- [ ] All API keys added to deployment platform (Netlify/Vercel)
- [ ] Environment variables prefixed with `VITE_`
- [ ] API rate limits configured in code
- [ ] Error boundaries implemented
- [ ] Loading states for all API calls
- [ ] Fallback data for offline mode
- [ ] Analytics tracking added
- [ ] CORS configured properly
- [ ] API keys secured (never in frontend code directly)
- [ ] Cache strategy optimized

---

## 11. Monitoring & Analytics

### Track API Usage
```typescript
// Add to services
const logAPICall = (service: string, success: boolean) => {
  // Send to analytics platform
  analytics.track('api_call', {
    service,
    success,
    timestamp: new Date(),
  });
};
```

### Monitor Errors
```typescript
// In error handlers
Sentry.captureException(error, {
  tags: {
    service: 'gemini',
    user_state: userState,
  },
});
```

---

## Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Data.gov.in API Guide](https://data.gov.in/help/how-use-datasets-apis)
- [React Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)

---

**Last Updated:** December 8, 2025
