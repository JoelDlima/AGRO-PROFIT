/**
 * API Integration Test Suite
 * Run this to verify all API keys are working correctly
 */

import { fetchMandiPrices } from './services/agmarknetService';
import { sendChatMessage } from './services/groqService';
import { getCurrentWeather } from './services/weatherService';

export async function testAllAPIs() {
  console.log('🧪 Starting API Integration Tests...\n');

  const results = {
    mandi: false,
    groq: false,
    weather: false,
  };

  // Test 1: Mandi Price API
  console.log('1️⃣ Testing Mandi Price API (data.gov.in)...');
  try {
    const mandiData = await fetchMandiPrices('Tomato', { limit: 5 });
    if (mandiData && mandiData.records && mandiData.records.length > 0) {
      console.log('✅ Mandi API Working!');
      console.log(`   Found ${mandiData.records.length} markets`);
      console.log(`   Sample: ${mandiData.records[0].market}, ${mandiData.records[0].state}`);
      console.log(`   Price: ₹${mandiData.records[0].modal_price}/quintal\n`);
      results.mandi = true;
    } else {
      console.log('❌ Mandi API returned no data\n');
    }
  } catch (error) {
    console.error('❌ Mandi API Error:', error.message, '\n');
  }

  // Test 2: Groq AI API
  console.log('2️⃣ Testing Groq AI API...');
  try {
    const aiResponse = await sendChatMessage('What is the best time to sell tomatoes?');
    if (aiResponse && aiResponse.length > 50) {
      console.log('✅ Groq API Working!');
      console.log(`   Response length: ${aiResponse.length} characters`);
      console.log(`   Preview: ${aiResponse.substring(0, 100)}...\n`);
      results.groq = true;
    } else {
      console.log('❌ Groq API returned invalid response\n');
    }
  } catch (error) {
    console.error('❌ Groq API Error:', error.message, '\n');
  }

  // Test 3: Weather API
  console.log('3️⃣ Testing Weather API (OpenWeatherMap)...');
  try {
    const weatherData = await getCurrentWeather('Mumbai');
    if (weatherData && weatherData.temp !== undefined) {
      console.log('✅ Weather API Working!');
      console.log(`   Location: Mumbai`);
      console.log(`   Temperature: ${weatherData.temp}°C`);
      console.log(`   Humidity: ${weatherData.humidity}%`);
      console.log(`   Conditions: ${weatherData.description}\n`);
      results.weather = true;
    } else {
      console.log('❌ Weather API returned no data\n');
    }
  } catch (error) {
    console.error('❌ Weather API Error:', error.message, '\n');
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log('─────────────────────────────────');
  console.log(`Mandi Price API:  ${results.mandi ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Groq AI API:      ${results.groq ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Weather API:      ${results.weather ? '✅ PASS' : '❌ FAIL'}`);
  console.log('─────────────────────────────────');

  const passedTests = Object.values(results).filter(Boolean).length;
  console.log(`\n✨ ${passedTests}/3 APIs working correctly\n`);

  if (passedTests === 3) {
    console.log('🎉 All APIs are integrated and working!');
    console.log('Your AgroProfit app is ready for full functionality!\n');
  } else {
    console.log('⚠️ Some APIs need attention. Check the errors above.\n');
  }

  return results;
}

// Export individual test functions
export async function testMandiAPI() {
  console.log('Testing Mandi Price API...');
  try {
    const data = await fetchMandiPrices('Onion', { state: 'Maharashtra', limit: 10 });
    console.log('Success! Found markets:', data.records.length);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function testGroqAPI() {
  console.log('Testing Groq AI...');
  try {
    const response = await sendChatMessage('Explain the importance of modal price in simple terms');
    console.log('Success! Response:', response.substring(0, 200));
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function testWeatherAPI() {
  console.log('Testing Weather API...');
  try {
    const weather = await getCurrentWeather('Delhi');
    console.log('Success! Weather:', weather);
    return weather;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
