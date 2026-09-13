# 🌾 Free Agriculture APIs for AgroProfit

## **Government of India APIs (No Limit, Free)**

### 1. **Data.gov.in - Soil Data**
- **URL:** https://data.gov.in/resource/soil-data-various-states-india
- **Use:** Display soil health, pH levels, nutrient content by state/district
- **Implementation:** Add "Soil Health Card" widget on Dashboard

### 2. **Data.gov.in - Rainfall Data**
- **URL:** https://data.gov.in/resource/rainfall-india-1901-2015
- **Use:** Historical rainfall patterns for yield predictions
- **Implementation:** Add to Trends page for rainfall vs price correlation

### 3. **Data.gov.in - Fertilizer Prices**
- **URL:** https://data.gov.in/resource/district-wise-season-wise-crop-wise-fertilizer-statistics
- **Use:** Show input cost trends alongside market prices
- **Implementation:** Add "Input Cost Calculator" feature

### 4. **Data.gov.in - Crop Production Statistics**
- **URL:** https://data.gov.in/resource/crop-production-statistics
- **Use:** State-wise production data for supply-demand analysis
- **Implementation:** Predict oversupply/undersupply scenarios

### 5. **India Meteorological Department (IMD)**
- **URL:** https://mausam.imd.gov.in/imd_latest/contents/api_page.php
- **Use:** Weather forecasts, monsoon predictions
- **Free:** Registration required, generous limits

---

## **International Free APIs (Good Limits)**

### 6. **Open-Meteo (Weather - UNLIMITED & FREE)**
- **URL:** https://open-meteo.com/
- **Use:** Replace WeatherAPI.com (no API key needed!)
- **Features:** 7-day forecast, historical weather, soil temperature
- **Why:** Truly unlimited, no registration required

### 7. **NASA POWER API (Agriculture)**
- **URL:** https://power.larc.nasa.gov/docs/services/api/
- **Use:** Solar radiation, evapotranspiration, growing degree days
- **Free:** Unlimited for non-commercial use
- **Implementation:** Advanced crop risk predictions

### 8. **USGS Water Services**
- **URL:** https://waterservices.usgs.gov/rest/
- **Use:** Groundwater levels, irrigation planning
- **Free:** Unlimited

### 9. **FAO Food Price Index**
- **URL:** https://www.fao.org/faostat/en/#data/PP
- **Use:** Global commodity price trends
- **Implementation:** Export opportunity indicators

---

## **ML/Prediction APIs (Free Tier)**

### 10. **Google Gemini 2.0 Flash (Current)**
- **Current Usage:** Chatbot
- **New Use:** Price prediction model
- **Free:** 1500 requests/day
- **Implementation:** Feed historical mandi data → get price forecasts

### 11. **Hugging Face Inference API**
- **URL:** https://huggingface.co/docs/api-inference/
- **Use:** Crop disease detection from images
- **Free:** 30,000 requests/month
- **Implementation:** Add image upload for pest/disease identification

---

## **Additional Data Sources**

### 12. **Reserve Bank of India - CPI (Consumer Price Index)**
- **URL:** https://rbi.org.in/Scripts/Data_api.aspx
- **Use:** Inflation-adjusted price trends
- **Free:** API access available

### 13. **NCDEX (National Commodity Exchange)**
- **URL:** https://www.ncdex.com/market-data
- **Use:** Futures prices for major crops
- **Note:** Web scraping may be needed (check ToS)

---

## **🎯 Priority Implementation Order:**

1. **Open-Meteo** (Replace WeatherAPI) - 10 min ✅
2. **Soil Health API** - Dashboard widget - 30 min
3. **Rainfall Data** - Trends correlation - 45 min
4. **NASA POWER** - Advanced predictions - 1 hour
5. **Gemini Price Forecasting** - ML predictions - 2 hours

---

## **📊 Trends Page Improvements:**

### **Option A: Real Historical Data** (Recommended)
1. Store daily mandi prices in Supabase
2. Build up 30-90 days of historical data
3. Show actual trends + predictions

**Implementation:**
```sql
CREATE TABLE price_history (
  id uuid PRIMARY KEY,
  commodity text,
  market text,
  price numeric,
  recorded_date date,
  created_at timestamp
);
```

### **Option B: Enhanced Demo with Predictions**
1. Keep current demo charts
2. Add Gemini-powered price forecasts
3. Show confidence intervals
4. Add "Coming Soon: Real Historical Data" banner

### **Option C: Hybrid Approach** (Best)
1. Use demo data for historical (30+ days back)
2. Use real API data for recent (last 7 days)
3. Use Gemini for future (next 7 days)
4. Clearly label each section

---

## **🚀 Quick Wins for Tomorrow:**

1. **Weather Widget** ✅ DONE
2. **Soil Health Card** - 30 minutes
3. **Rainfall Alert System** - 45 minutes
4. **Price Forecast with Gemini** - 1 hour
5. **Fertilizer Cost Tracker** - 30 minutes

**Total Time:** ~3 hours for 5 impactful features!
