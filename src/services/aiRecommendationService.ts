/**
 * AI Recommendation Service
 * Provides AI-powered market intelligence and selling recommendations
 */

export interface MarketRecommendation {
  action: 'sell_now' | 'wait' | 'sell_specific_market';
  confidence: number; // 0-100
  bestMarket: string;
  currentPrice: number;
  predictedPrice?: number;
  priceChange?: number; // percentage
  daysToWait?: number;
  profitIncrease?: number; // percentage
  transportCost?: number;
  netProfit?: number;
  reasoning: string;
  alternativeMarkets?: Array<{
    name: string;
    price: number;
    distance: string;
    profitDifference: number;
  }>;
}

export interface PricePrediction {
  crop: string;
  currentPrice: number;
  predictedPrices: Array<{
    date: string;
    price: number;
    change: number;
  }>;
  trend: 'rising' | 'falling' | 'stable';
  recommendation: string;
}

// Market data for recommendations
const MARKET_DATABASE: Record<string, {
  states: string[];
  markets: Array<{
    name: string;
    basePrice: number;
    priceVariation: number;
    distance: string;
    transportCost: number;
  }>;
  seasonality: {
    month: number;
    priceMultiplier: number;
  }[];
  predictions: {
    days3: number;
    days7: number;
    trend: 'rising' | 'falling' | 'stable';
  };
}> = {
  'Tomato': {
    states: ['Maharashtra', 'Karnataka', 'Gujarat'],
    markets: [
      { name: 'Nashik APMC', basePrice: 30, priceVariation: 5, distance: '45 km', transportCost: 500 },
      { name: 'Pune Market Yard', basePrice: 28, priceVariation: 4, distance: '120 km', transportCost: 1200 },
      { name: 'Mumbai Vashi', basePrice: 35, priceVariation: 6, distance: '180 km', transportCost: 1800 },
      { name: 'Local Mandi', basePrice: 25, priceVariation: 3, distance: '5 km', transportCost: 100 },
    ],
    seasonality: [
      { month: 1, priceMultiplier: 1.2 },
      { month: 2, priceMultiplier: 1.15 },
      { month: 3, priceMultiplier: 1.0 },
      { month: 4, priceMultiplier: 0.9 },
      { month: 5, priceMultiplier: 0.85 },
      { month: 6, priceMultiplier: 0.95 },
    ],
    predictions: {
      days3: 8,
      days7: 12,
      trend: 'rising'
    }
  },
  'Onion': {
    states: ['Maharashtra', 'Gujarat', 'Rajasthan'],
    markets: [
      { name: 'Lasalgaon APMC', basePrice: 45, priceVariation: 8, distance: '60 km', transportCost: 600 },
      { name: 'Pune Market Yard', basePrice: 42, priceVariation: 6, distance: '100 km', transportCost: 1000 },
      { name: 'Mumbai Vashi', basePrice: 50, priceVariation: 10, distance: '190 km', transportCost: 1900 },
      { name: 'Local Mandi', basePrice: 38, priceVariation: 5, distance: '8 km', transportCost: 150 },
    ],
    seasonality: [],
    predictions: {
      days3: -5,
      days7: -8,
      trend: 'falling'
    }
  },
  'Wheat': {
    states: ['Punjab', 'Haryana', 'Uttar Pradesh'],
    markets: [
      { name: 'Ludhiana Grain Market', basePrice: 22, priceVariation: 2, distance: '50 km', transportCost: 800 },
      { name: 'Amritsar APMC', basePrice: 23, priceVariation: 1.5, distance: '90 km', transportCost: 1100 },
      { name: 'Chandigarh Mandi', basePrice: 21, priceVariation: 1.8, distance: '120 km', transportCost: 1400 },
      { name: 'Local Mandi', basePrice: 20, priceVariation: 1, distance: '10 km', transportCost: 200 },
    ],
    seasonality: [],
    predictions: {
      days3: 0,
      days7: 2,
      trend: 'stable'
    }
  },
  'Rice': {
    states: ['Andhra Pradesh', 'Telangana', 'West Bengal'],
    markets: [
      { name: 'Vijayawada Rice Market', basePrice: 28, priceVariation: 3, distance: '40 km', transportCost: 600 },
      { name: 'Hyderabad APMC', basePrice: 27, priceVariation: 2.5, distance: '110 km', transportCost: 1300 },
      { name: 'Guntur Market', basePrice: 29, priceVariation: 3.5, distance: '80 km', transportCost: 950 },
      { name: 'Local Mandi', basePrice: 25, priceVariation: 2, distance: '12 km', transportCost: 250 },
    ],
    seasonality: [],
    predictions: {
      days3: 3,
      days7: 5,
      trend: 'rising'
    }
  },
  'Potato': {
    states: ['Uttar Pradesh', 'West Bengal', 'Bihar'],
    markets: [
      { name: 'Agra Mandi', basePrice: 18, priceVariation: 3, distance: '55 km', transportCost: 550 },
      { name: 'Delhi Azadpur', basePrice: 20, priceVariation: 4, distance: '160 km', transportCost: 1600 },
      { name: 'Kanpur Market', basePrice: 17, priceVariation: 2.5, distance: '90 km', transportCost: 900 },
      { name: 'Local Mandi', basePrice: 15, priceVariation: 2, distance: '8 km', transportCost: 150 },
    ],
    seasonality: [],
    predictions: {
      days3: 4,
      days7: 7,
      trend: 'rising'
    }
  },
  'Capsicum': {
    states: ['Maharashtra', 'Karnataka', 'Tamil Nadu'],
    markets: [
      { name: 'Nashik APMC', basePrice: 32, priceVariation: 6, distance: '50 km', transportCost: 550 },
      { name: 'Pune Market Yard', basePrice: 30, priceVariation: 5, distance: '110 km', transportCost: 1100 },
      { name: 'Mumbai Vashi', basePrice: 38, priceVariation: 8, distance: '175 km', transportCost: 1750 },
      { name: 'Local Mandi', basePrice: 27, priceVariation: 4, distance: '8 km', transportCost: 120 },
    ],
    seasonality: [],
    predictions: {
      days3: -6,
      days7: -12,
      trend: 'falling'
    }
  },
  'Peas': {
    states: ['Uttar Pradesh', 'Madhya Pradesh', 'Punjab'],
    markets: [
      { name: 'Lucknow Mandi', basePrice: 45, priceVariation: 5, distance: '60 km', transportCost: 650 },
      { name: 'Kanpur APMC', basePrice: 42, priceVariation: 4, distance: '100 km', transportCost: 1000 },
      { name: 'Delhi Azadpur', basePrice: 50, priceVariation: 7, distance: '200 km', transportCost: 2000 },
      { name: 'Local Mandi', basePrice: 38, priceVariation: 3, distance: '10 km', transportCost: 180 },
    ],
    seasonality: [],
    predictions: {
      days3: 5,
      days7: 9,
      trend: 'rising'
    }
  },
};

/**
 * Get AI-powered market recommendation for a crop
 */
export function getMarketRecommendation(
  crop: string,
  quantity: number = 100,
  userState: string = 'Maharashtra',
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy'
): MarketRecommendation {
  const cropData = MARKET_DATABASE[crop] || MARKET_DATABASE['Tomato'];
  const currentMonth = new Date().getMonth() + 1;
  
  const seasonData = cropData.seasonality.find(s => s.month === currentMonth);
  const seasonMultiplier = seasonData?.priceMultiplier || 1.0;
  
  const marketAnalysis = cropData.markets.map(market => {
    const adjustedPrice = market.basePrice * seasonMultiplier;
    const revenue = adjustedPrice * quantity;
    const netProfit = revenue - market.transportCost;
    const profitPerKg = netProfit / quantity;
    
    return {
      ...market,
      adjustedPrice,
      revenue,
      netProfit,
      profitPerKg
    };
  }).sort((a, b) => b.netProfit - a.netProfit);
  
  const bestMarket = marketAnalysis[0];
  const localMarket = marketAnalysis.find(m => m.name.includes('Local')) || marketAnalysis[marketAnalysis.length - 1];
  
  const profitDifference = bestMarket.netProfit - localMarket.netProfit;
  const profitIncreasePercent = ((profitDifference / localMarket.netProfit) * 100).toFixed(1);
  
  let weatherAdvice = '';
  if (weatherCondition) {
    weatherAdvice = '\n\n⛅ ' + getWeatherBasedAdvice(crop, weatherCondition);
  }
  
  const prediction = cropData.predictions;
  let action: 'sell_now' | 'wait' | 'sell_specific_market' = 'sell_specific_market';
  let reasoning = '';
  let daysToWait = 0;
  let predictedPrice = bestMarket.adjustedPrice;
  
  if (prediction.trend === 'rising' && prediction.days3 > 5) {
    action = 'wait';
    daysToWait = 3;
    predictedPrice = bestMarket.adjustedPrice * (1 + prediction.days3 / 100);
    reasoning = `${crop} prices are expected to rise by ${prediction.days3}% in the next 3 days. Selling in ${bestMarket.name} after waiting will yield approximately ₹${((predictedPrice * quantity) - bestMarket.transportCost).toFixed(0)} (${prediction.days3}% more profit than selling today).${weatherAdvice}`;
  } else if (prediction.trend === 'falling') {
    action = 'sell_now';
    reasoning = `${crop} prices are expected to fall by ${Math.abs(prediction.days3)}% in the next 3 days. Sell immediately at ${bestMarket.name} for ₹${bestMarket.adjustedPrice.toFixed(2)}/kg to avoid losses. Current market price is favorable.${weatherAdvice}`;
  } else {
    action = 'sell_specific_market';
    reasoning = `Selling ${quantity}kg of ${crop} at ${bestMarket.name} will yield ₹${bestMarket.netProfit.toFixed(0)} net profit (after ₹${bestMarket.transportCost} transport). This is ${profitIncreasePercent}% higher than your local market.${weatherAdvice}`;
  }
  
  return {
    action,
    confidence: prediction.trend === 'stable' ? 75 : 90,
    bestMarket: bestMarket.name,
    currentPrice: bestMarket.adjustedPrice,
    predictedPrice: action === 'wait' ? predictedPrice : undefined,
    priceChange: prediction.days3,
    daysToWait: action === 'wait' ? daysToWait : undefined,
    profitIncrease: parseFloat(profitIncreasePercent),
    transportCost: bestMarket.transportCost,
    netProfit: bestMarket.netProfit,
    reasoning,
    alternativeMarkets: marketAnalysis.slice(1, 4).map(m => ({
      name: m.name,
      price: m.adjustedPrice,
      distance: m.distance,
      profitDifference: ((m.netProfit - localMarket.netProfit) / localMarket.netProfit * 100)
    }))
  };
}

/**
 * Get short-term price prediction (3-7 days)
 */
export function getPricePrediction(crop: string): PricePrediction {
  const cropData = MARKET_DATABASE[crop] || MARKET_DATABASE['Tomato'];
  const bestMarket = cropData.markets[0];
  const currentPrice = bestMarket.basePrice;
  const prediction = cropData.predictions;
  
  const today = new Date();
  const predictedPrices = [];
  
  const dailyVariations = prediction.trend === 'falling' 
    ? [1.2, -2.5, -1.8, -3.2, -0.5, -2.8, -1.4]
    : prediction.trend === 'rising'
    ? [1.7, 3.4, 1.2, -0.8, 2.1, 1.5, 3.2]
    : [0.5, -0.3, 0.8, -0.6, 0.2, -0.4, 0.7];
  
  let cumulativeChange = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i + 1);
    
    cumulativeChange += dailyVariations[i];
    
    predictedPrices.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat((currentPrice * (1 + cumulativeChange / 100)).toFixed(2)),
      change: parseFloat(dailyVariations[i].toFixed(1))
    });
  }
  
  let recommendation = '';
  if (prediction.trend === 'rising') {
    recommendation = `Wait 3-7 days for better prices. Expected increase: ${prediction.days7}%`;
  } else if (prediction.trend === 'falling') {
    recommendation = `Sell immediately. Prices expected to fall by ${Math.abs(prediction.days7)}%`;
  } else {
    recommendation = `Prices are stable. Sell at your convenience in the next week`;
  }
  
  return {
    crop,
    currentPrice,
    predictedPrices,
    trend: prediction.trend,
    recommendation
  };
}

/**
 * Get weather-based selling advice
 */
export function getWeatherBasedAdvice(
  crop: string,
  weatherCondition: 'sunny' | 'rainy' | 'cloudy' = 'sunny'
): string {
  const perishableCrops = ['Tomato', 'Potato', 'Onion', 'Cabbage', 'Cauliflower'];
  const isPerishable = perishableCrops.includes(crop);
  
  if (weatherCondition === 'rainy' && isPerishable) {
    return `Heavy rains expected. ${crop} quality may deteriorate. Consider selling within 48 hours to avoid spoilage losses.`;
  } else if (weatherCondition === 'sunny' && isPerishable) {
    return `Clear weather conditions favorable for transport. Good time to sell at distant markets with higher prices.`;
  } else {
    return `Weather conditions are suitable for storage and transport. You have flexibility in timing your sale.`;
  }
}

/**
 * Get formatted AI recommendation message
 */
export function getFormattedRecommendation(crop: string, quantity: number = 100): string {
  const rec = getMarketRecommendation(crop, quantity);
  
  if (rec.action === 'wait') {
    return `💡 AI Recommendation: ${crop} prices are expected to rise in the next ${rec.daysToWait} days. Selling in ${rec.bestMarket} may yield ${rec.profitIncrease}% higher profit than your local market.`;
  } else if (rec.action === 'sell_now') {
    return `⚡ AI Recommendation: Sell ${crop} immediately at ${rec.bestMarket} (₹${rec.currentPrice.toFixed(2)}/kg). Prices expected to fall by ${Math.abs(rec.priceChange!)}% soon.`;
  } else {
    return `📊 AI Recommendation: Best market for ${crop} is ${rec.bestMarket} (₹${rec.currentPrice.toFixed(2)}/kg). Expected profit: ₹${rec.netProfit?.toFixed(0)} for ${quantity}kg.`;
  }
}
