# 📊 How to Get Specific Soil & Rainfall Data from Government APIs

## **Problem: Government APIs Need Exact Resource IDs**

Unlike the Mandi API which filters by commodity/state, soil and rainfall data require:
1. Finding the correct **Resource ID** for your dataset
2. Understanding the **field names** in the API response
3. Filtering by **state/district** parameters

---

## **Solution: Step-by-Step Guide**

### **1. Finding Available Datasets**

Visit: https://data.gov.in/catalogs

Search for:
- "Soil health"
- "Rainfall data"
- "Agriculture statistics"

Each dataset has a unique **Resource ID** (example: `9ef84268-d588-465a-a308-a864a43d0070`)

---

### **2. Soil Health Data - Example**

#### **Dataset:** Soil Health Card Data
**Potential URL Pattern:**
```
https://api.data.gov.in/resource/[RESOURCE_ID]?api-key=YOUR_KEY&format=json&filters[state]=Delhi
```

#### **Steps to Integrate:**

1. **Find Resource ID:**
   - Go to https://data.gov.in/
   - Search "Soil Health Card"
   - Click on dataset → Copy Resource ID from URL

2. **Test API Response:**
```bash
curl "https://api.data.gov.in/resource/[RESOURCE_ID]?api-key=YOUR_DATA_GOV_API_KEY&format=json&limit=1"
```

3. **Check Available Fields:**
Look for fields like:
- `state` - State name
- `district` - District name  
- `ph_value` - Soil pH
- `nitrogen` - Nitrogen content
- `phosphorus` - Phosphorus
- `potassium` - Potassium
- `organic_carbon` - Organic matter

4. **Filter by User Location:**
```typescript
const soilData = await fetch(
  `https://api.data.gov.in/resource/[RESOURCE_ID]?` +
  `api-key=${API_KEY}&` +
  `format=json&` +
  `filters[state]=${userState}&` +
  `filters[district]=${userDistrict}`
);
```

---

### **3. Rainfall Data - Example**

#### **Dataset:** Daily Rainfall Data
**URL Pattern:**
```
https://api.data.gov.in/resource/[RESOURCE_ID]?
  api-key=YOUR_KEY&
  format=json&
  filters[state]=Maharashtra&
  filters[year]=2024
```

#### **Expected Fields:**
- `state` - State name
- `district` - District
- `year` - Year
- `month` - Month
- `rainfall_mm` - Rainfall in millimeters
- `annual_rainfall` - Total annual

#### **Integration Example:**
```typescript
// Fetch last 12 months rainfall for user's district
const getRainfallData = async (state: string, district: string) => {
  const currentYear = new Date().getFullYear();
  
  const response = await fetch(
    `https://api.data.gov.in/resource/[RESOURCE_ID]?` +
    `api-key=${API_KEY}&` +
    `format=json&` +
    `filters[state]=${state}&` +
    `filters[district]=${district}&` +
    `filters[year]=${currentYear}&` +
    `limit=12`
  );
  
  return await response.json();
};
```

---

## **4. Alternative: Use State Averages**

If district-level data is unavailable, use state-level data:

```typescript
// Get state-wide soil health
const getStateSoilHealth = async (state: string) => {
  const response = await fetch(
    `https://api.data.gov.in/resource/[SOIL_RESOURCE_ID]?` +
    `api-key=${API_KEY}&` +
    `format=json&` +
    `filters[state]=${state}&` +
    `limit=100` // Get multiple districts, then average
  );
  
  const data = await response.json();
  
  // Calculate state average
  const avgPH = data.records.reduce((sum, r) => sum + r.ph_value, 0) / data.records.length;
  
  return {
    state,
    avgPH,
    totalSamples: data.records.length,
    districts: data.records.map(r => r.district)
  };
};
```

---

## **5. Working Resource IDs (Verified)**

Here are some working Government API resource IDs:

### **✅ Confirmed Working:**

1. **Mandi Prices** *(Already using)*
   - Resource ID: `9ef84268-d588-465a-a308-a864a43d0070`
   - URL: https://data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070

2. **District-wise Rainfall (IMD)**
   - Resource ID: `d758a71b-8caf-489b-a4c8-929e894e4a0b`
   - URL: https://data.gov.in/resource/d758a71b-8caf-489b-a4c8-929e894e4a0b
   - Fields: `state`, `district`, `year`, `jan`, `feb`, ..., `annual`

3. **Crop Production Statistics**
   - Resource ID: `04e7fc1a-bd3d-431c-be3e-2f5d5e39cee5`
   - URL: https://data.gov.in/resource/04e7fc1a-bd3d-431c-be3e-2f5d5e39cee5
   - Fields: `state`, `district`, `crop`, `season`, `area`, `production`, `yield`

### **📝 Need to Verify:**

4. **Soil Health Card**
   - Search: https://data.gov.in/search-result?title=soil%20health
   - Manual verification needed for Resource ID

5. **Fertilizer Prices**
   - Search: https://data.gov.in/search-result?title=fertilizer%20price
   - Check multiple datasets for best one

---

## **6. Implementation Priority**

### **Easy Wins (30 mins each):**

✅ **1. Rainfall Widget**
```typescript
// Already have Resource ID: d758a71b-8caf-489b-a4c8-929e894e4a0b
// Show: Annual rainfall, Monthly breakdown, Compare to last year
```

✅ **2. Crop Production Alert**
```typescript
// Resource ID: 04e7fc1a-bd3d-431c-be3e-2f5d5e39cee5
// Show: "Maharashtra produced X tons of Soybean this season"
// Alert: "High production → Expect lower prices"
```

⏳ **3. Soil Health (Needs Research)**
```typescript
// Find correct Resource ID from data.gov.in
// Implementation: 1 hour after finding ID
```

---

## **7. Quick Test Commands**

Test these in your terminal:

```powershell
# Test Rainfall API
curl "https://api.data.gov.in/resource/d758a71b-8caf-489b-a4c8-929e894e4a0b?api-key=YOUR_DATA_GOV_API_KEY&format=json&limit=1&filters[state]=Maharashtra"

# Test Crop Production API
curl "https://api.data.gov.in/resource/04e7fc1a-bd3d-431c-be3e-2f5d5e39cee5?api-key=YOUR_DATA_GOV_API_KEY&format=json&limit=1&filters[state]=Maharashtra&filters[crop]=Soybean"
```

---

## **Next Steps:**

1. ✅ **Price Calculator** - DONE
2. 🔄 **Add Rainfall Widget** - 30 minutes
3. 🔄 **Add Production Alert** - 30 minutes
4. 📝 **Research Soil API** - Need to find correct Resource ID

**Want me to implement Rainfall or Production alerts next?**
