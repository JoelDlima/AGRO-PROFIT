export interface Crop {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  nameKok: string;
  icon: string;
  unit: string;
}

export interface Market {
  id: string;
  name: string;
  district: string;
  state: string;
  distance: number;
  price: number;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface PriceTrend {
  date: string;
  price: number;
  volume: number;
}

export interface UserCrop {
  cropId: string;
  quantity: number;
  expectedPrice: number;
}

export const crops: Crop[] = [
  // Vegetables (High API availability)
  { id: 'tomato', name: 'Tomato', nameHi: 'टमाटर', nameMr: 'टोमॅटो', nameKok: 'टोमॅटो', icon: '🍅', unit: 'kg' },
  { id: 'onion', name: 'Onion', nameHi: 'प्याज', nameMr: 'कांदा', nameKok: 'कांदो', icon: '🧅', unit: 'kg' },
  { id: 'potato', name: 'Potato', nameHi: 'आलू', nameMr: 'बटाटा', nameKok: 'बटाटो', icon: '🥔', unit: 'kg' },
  { id: 'cabbage', name: 'Cabbage', nameHi: 'पत्तागोभी', nameMr: 'कोबी', nameKok: 'कोबी', icon: '🥬', unit: 'kg' },
  { id: 'cauliflower', name: 'Cauliflower', nameHi: 'फूलगोभी', nameMr: 'फ्लॉवर', nameKok: 'फ्लावर', icon: '🥦', unit: 'kg' },
  { id: 'brinjal', name: 'Brinjal', nameHi: 'बैंगन', nameMr: 'वांगी', nameKok: 'वांगें', icon: '🍆', unit: 'kg' },
  { id: 'ladyfinger', name: 'Lady Finger', nameHi: 'भिंडी', nameMr: 'भेंडी', nameKok: 'भेंडें', icon: '🫛', unit: 'kg' },
  { id: 'carrot', name: 'Carrot', nameHi: 'गाजर', nameMr: 'गाजर', nameKok: 'गाजर', icon: '🥕', unit: 'kg' },
  { id: 'peas', name: 'Peas', nameHi: 'मटर', nameMr: 'वाटाणा', nameKok: 'वाटाणां', icon: '🫛', unit: 'kg' },
  { id: 'capsicum', name: 'Capsicum', nameHi: 'शिमला मिर्च', nameMr: 'ढोबळी मिरची', nameKok: 'ढोबळी मिरसांग', icon: '🫑', unit: 'kg' },
  { id: 'greenchilli', name: 'Green Chilli', nameHi: 'हरी मिर्च', nameMr: 'हिरवी मिरची', nameKok: 'पाचवी मिरसांग', icon: '🌶️', unit: 'kg' },
  { id: 'coriander', name: 'Coriander', nameHi: 'धनिया', nameMr: 'कोथिंबीर', nameKok: 'कोथिंबीर', icon: '🌿', unit: 'kg' },
  
  // Fruits (Good API availability)
  { id: 'apple', name: 'Apple', nameHi: 'सेब', nameMr: 'सफरचंद', nameKok: 'सफरचंद', icon: '🍎', unit: 'kg' },
  { id: 'banana', name: 'Banana', nameHi: 'केला', nameMr: 'केळी', nameKok: 'केळें', icon: '🍌', unit: 'kg' },
  { id: 'mango', name: 'Mango', nameHi: 'आम', nameMr: 'आंबा', nameKok: 'आंबो', icon: '🥭', unit: 'kg' },
  { id: 'grapes', name: 'Grapes', nameHi: 'अंगूर', nameMr: 'द्राक्षे', nameKok: 'द्राक्षां', icon: '🍇', unit: 'kg' },
  { id: 'orange', name: 'Orange', nameHi: 'संतरा', nameMr: 'संत्री', nameKok: 'संत्रें', icon: '🍊', unit: 'kg' },
  { id: 'pomegranate', name: 'Pomegranate', nameHi: 'अनार', nameMr: 'डाळिंब', nameKok: 'डाळीब', icon: '🍎', unit: 'kg' },
  { id: 'watermelon', name: 'Watermelon', nameHi: 'तरबूज', nameMr: 'टरबूज', nameKok: 'कलिंगड', icon: '🍉', unit: 'kg' },
  
  // Grains & Cash Crops (Mandi staples)
  { id: 'wheat', name: 'Wheat', nameHi: 'गेहूं', nameMr: 'गहू', nameKok: 'गव', icon: '🌾', unit: 'quintal' },
  { id: 'rice', name: 'Rice', nameHi: 'चावल', nameMr: 'तांदूळ', nameKok: 'तांदूळ', icon: '🍚', unit: 'quintal' },
  { id: 'maize', name: 'Maize', nameHi: 'मक्का', nameMr: 'मका', nameKok: 'मको', icon: '🌽', unit: 'quintal' },
  { id: 'bajra', name: 'Bajra', nameHi: 'बाजरा', nameMr: 'बाजरी', nameKok: 'नाचणी', icon: '🌾', unit: 'quintal' },
  { id: 'jowar', name: 'Jowar', nameHi: 'ज्वार', nameMr: 'ज्वारी', nameKok: 'ज्वारी', icon: '🌾', unit: 'quintal' },
  { id: 'cotton', name: 'Cotton', nameHi: 'कपास', nameMr: 'कापूस', nameKok: 'कापूस', icon: '☁️', unit: 'quintal' },
  { id: 'sugarcane', name: 'Sugarcane', nameHi: 'गन्ना', nameMr: 'ऊस', nameKok: 'ऊस', icon: '🎋', unit: 'quintal' },
  { id: 'soybean', name: 'Soybean', nameHi: 'सोयाबीन', nameMr: 'सोयाबीन', nameKok: 'सोयाबीन', icon: '🫘', unit: 'quintal' },
  { id: 'groundnut', name: 'Groundnut', nameHi: 'मूंगफली', nameMr: 'भुईमूग', nameKok: 'भुंयमुग', icon: '🥜', unit: 'quintal' },
  { id: 'mustard', name: 'Mustard', nameHi: 'सरसों', nameMr: 'मोहरी', nameKok: 'मोहरी', icon: '🌼', unit: 'quintal' },
  
  // Pulses (Common in mandis)
  { id: 'gram', name: 'Gram', nameHi: 'चना', nameMr: 'हरभरा', nameKok: 'हरभरो', icon: '🫘', unit: 'quintal' },
  { id: 'tur', name: 'Tur', nameHi: 'तूर', nameMr: 'तूर', nameKok: 'तूर', icon: '🫘', unit: 'quintal' },
  { id: 'moong', name: 'Moong', nameHi: 'मूंग', nameMr: 'मूग', nameKok: 'मुगाचें', icon: '🫘', unit: 'quintal' },
  { id: 'urad', name: 'Urad', nameHi: 'उड़द', nameMr: 'उडीद', nameKok: 'उडीद', icon: '🫘', unit: 'quintal' },
];

export const markets: Market[] = [
  {
    id: 'azadpur',
    name: 'Azadpur Mandi',
    district: 'North Delhi',
    state: 'Delhi',
    distance: 15,
    price: 45,
    modalPrice: 42,
    minPrice: 35,
    maxPrice: 55,
    trend: 'up',
    lastUpdated: '2 hours ago',
  },
  {
    id: 'vashi',
    name: 'Vashi APMC',
    district: 'Navi Mumbai',
    state: 'Maharashtra',
    distance: 25,
    price: 48,
    modalPrice: 46,
    minPrice: 40,
    maxPrice: 58,
    trend: 'up',
    lastUpdated: '1 hour ago',
  },
  {
    id: 'lasalgaon',
    name: 'Lasalgaon Mandi',
    district: 'Nashik',
    state: 'Maharashtra',
    distance: 180,
    price: 52,
    modalPrice: 50,
    minPrice: 45,
    maxPrice: 62,
    trend: 'stable',
    lastUpdated: '3 hours ago',
  },
  {
    id: 'kolar',
    name: 'Kolar Market',
    district: 'Kolar',
    state: 'Karnataka',
    distance: 350,
    price: 38,
    modalPrice: 36,
    minPrice: 30,
    maxPrice: 45,
    trend: 'down',
    lastUpdated: '4 hours ago',
  },
  {
    id: 'jalandhar',
    name: 'Jalandhar Mandi',
    district: 'Jalandhar',
    state: 'Punjab',
    distance: 420,
    price: 44,
    modalPrice: 41,
    minPrice: 36,
    maxPrice: 52,
    trend: 'up',
    lastUpdated: '2 hours ago',
  },
];

export const priceTrends: PriceTrend[] = [
  { date: '2024-01-01', price: 35, volume: 1200 },
  { date: '2024-01-02', price: 38, volume: 1350 },
  { date: '2024-01-03', price: 36, volume: 1100 },
  { date: '2024-01-04', price: 40, volume: 1450 },
  { date: '2024-01-05', price: 42, volume: 1600 },
  { date: '2024-01-06', price: 45, volume: 1800 },
  { date: '2024-01-07', price: 48, volume: 2000 },
  { date: '2024-01-08', price: 46, volume: 1750 },
  { date: '2024-01-09', price: 50, volume: 2100 },
  { date: '2024-01-10', price: 52, volume: 2300 },
  { date: '2024-01-11', price: 49, volume: 1900 },
  { date: '2024-01-12', price: 51, volume: 2050 },
  { date: '2024-01-13', price: 54, volume: 2400 },
  { date: '2024-01-14', price: 52, volume: 2200 },
];

export const governmentSchemes = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    nameHi: 'पीएम-किसान',
    description: 'Direct income support of ₹6,000 per year to farmer families',
    eligibility: 'All landholding farmer families',
    link: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana',
    nameHi: 'पीएम फसल बीमा योजना',
    description: 'Crop insurance scheme to protect farmers from crop failure',
    eligibility: 'All farmers growing notified crops',
    link: 'https://pmfby.gov.in',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card',
    nameHi: 'किसान क्रेडिट कार्ड',
    description: 'Easy credit access for farming and allied activities',
    eligibility: 'Farmers, fishermen, and animal husbandry farmers',
    link: 'https://www.nabard.org',
  },
];

export const chatSuggestions = [
  "Where should I sell tomatoes today?",
  "Best time to sell onions this week?",
  "Which mandi has highest wheat prices?",
  "Tell me about PM-KISAN scheme",
  "Price forecast for next week",
];

export const userProfile = {
  name: 'Ramesh Kumar',
  phone: '+91 98765 43210',
  region: 'Nashik, Maharashtra',
  crops: [
    { cropId: 'tomato', quantity: 500, expectedPrice: 45 },
    { cropId: 'onion', quantity: 1000, expectedPrice: 25 },
  ],
  preferredLanguage: 'en',
};
