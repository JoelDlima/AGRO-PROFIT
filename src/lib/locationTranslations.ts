// Location translations for Indian states and common districts
export type Language = "en" | "hi" | "mr" | "kok";

interface StateTranslation {
  en: string;
  hi: string;
  mr: string;
  kok: string;
}

// State translations
export const stateTranslations: Record<string, StateTranslation> = {
  "Maharashtra": { en: "Maharashtra", hi: "महाराष्ट्र", mr: "महाराष्ट्र", kok: "महाराष्ट्र" },
  "Karnataka": { en: "Karnataka", hi: "कर्नाटक", mr: "कर्नाटक", kok: "कर्नाटक" },
  "Tamil Nadu": { en: "Tamil Nadu", hi: "तमिलनाडु", mr: "तामिळनाडू", kok: "तामिळनाडू" },
  "Kerala": { en: "Kerala", hi: "केरल", mr: "केरळ", kok: "केरळ" },
  "Andhra Pradesh": { en: "Andhra Pradesh", hi: "आंध्र प्रदेश", mr: "आंध्र प्रदेश", kok: "आंध्र प्रदेश" },
  "Telangana": { en: "Telangana", hi: "तेलंगाना", mr: "तेलंगाना", kok: "तेलंगाना" },
  "Gujarat": { en: "Gujarat", hi: "गुजरात", mr: "गुजरात", kok: "गुजरात" },
  "Rajasthan": { en: "Rajasthan", hi: "राजस्थान", mr: "राजस्थान", kok: "राजस्थान" },
  "Madhya Pradesh": { en: "Madhya Pradesh", hi: "मध्य प्रदेश", mr: "मध्य प्रदेश", kok: "मध्य प्रदेश" },
  "Uttar Pradesh": { en: "Uttar Pradesh", hi: "उत्तर प्रदेश", mr: "उत्तर प्रदेश", kok: "उत्तर प्रदेश" },
  "Bihar": { en: "Bihar", hi: "बिहार", mr: "बिहार", kok: "बिहार" },
  "West Bengal": { en: "West Bengal", hi: "पश्चिम बंगाल", mr: "पश्चिम बंगाल", kok: "पश्चिम बंगाल" },
  "Odisha": { en: "Odisha", hi: "ओडिशा", mr: "ओडिशा", kok: "ओडिशा" },
  "Punjab": { en: "Punjab", hi: "पंजाब", mr: "पंजाब", kok: "पंजाब" },
  "Haryana": { en: "Haryana", hi: "हरियाणा", mr: "हरियाणा", kok: "हरियाणा" },
  "Jharkhand": { en: "Jharkhand", hi: "झारखंड", mr: "झारखंड", kok: "झारखंड" },
  "Chhattisgarh": { en: "Chhattisgarh", hi: "छत्तीसगढ़", mr: "छत्तीसगढ", kok: "छत्तीसगढ" },
  "Uttarakhand": { en: "Uttarakhand", hi: "उत्तराखंड", mr: "उत्तराखंड", kok: "उत्तराखंड" },
  "Himachal Pradesh": { en: "Himachal Pradesh", hi: "हिमाचल प्रदेश", mr: "हिमाचल प्रदेश", kok: "हिमाचल प्रदेश" },
  "Jammu and Kashmir": { en: "Jammu and Kashmir", hi: "जम्मू और कश्मीर", mr: "जम्मू आणि काश्मीर", kok: "जम्मू आनी काश्मीर" },
  "Delhi": { en: "Delhi", hi: "दिल्ली", mr: "दिल्ली", kok: "दिल्ली" },
  "Goa": { en: "Goa", hi: "गोवा", mr: "गोवा", kok: "गोंय" },
  "Assam": { en: "Assam", hi: "असम", mr: "आसाम", kok: "आसाम" },
  "Meghalaya": { en: "Meghalaya", hi: "मेघालय", mr: "मेघालय", kok: "मेघालय" },
  "Manipur": { en: "Manipur", hi: "मणिपुर", mr: "मणिपूर", kok: "मणिपूर" },
  "Mizoram": { en: "Mizoram", hi: "मिजोरम", mr: "मिझोरम", kok: "मिझोरम" },
  "Nagaland": { en: "Nagaland", hi: "नागालैंड", mr: "नागालँड", kok: "नागालँड" },
  "Tripura": { en: "Tripura", hi: "त्रिपुरा", mr: "त्रिपुरा", kok: "त्रिपुरा" },
  "Sikkim": { en: "Sikkim", hi: "सिक्किम", mr: "सिक्किम", kok: "सिक्किम" },
  "Arunachal Pradesh": { en: "Arunachal Pradesh", hi: "अरुणाचल प्रदेश", mr: "अरुणाचल प्रदेश", kok: "अरुणाचल प्रदेश" },
  "Ladakh": { en: "Ladakh", hi: "लद्दाख", mr: "लडाख", kok: "लडाख" },
  "Puducherry": { en: "Puducherry", hi: "पुडुचेरी", mr: "पुदुचेरी", kok: "पुदुचेरी" },
  "Chandigarh": { en: "Chandigarh", hi: "चंडीगढ़", mr: "चंदीगढ", kok: "चंदीगढ" },
  "Andaman and Nicobar": { en: "Andaman and Nicobar", hi: "अंडमान और निकोबार", mr: "अंदमान आणि निकोबार", kok: "अंदमान आनी निकोबार" },
};

// Common district translations (can be expanded as needed)
export const districtTranslations: Record<string, StateTranslation> = {
  // Kerala districts
  "Kottayam": { en: "Kottayam", hi: "कोट्टायम", mr: "कोट्टायम", kok: "कोट्टायम" },
  "Ernakulam": { en: "Ernakulam", hi: "एर्नाकुलम", mr: "एर्नाकुलम", kok: "एर्नाकुलम" },
  "Thiruvananthapuram": { en: "Thiruvananthapuram", hi: "तिरुवनंतपुरम", mr: "तिरुवनंतपुरम", kok: "तिरुवनंतपुरम" },
  "Kozhikode": { en: "Kozhikode", hi: "कोझिकोड", mr: "कोझिकोड", kok: "कोझिकोड" },
  
  // Tamil Nadu districts
  "Chengalpattu": { en: "Chengalpattu", hi: "चेंगलपट्टु", mr: "चेंगलपट्टू", kok: "चेंगलपट्टू" },
  "Chennai": { en: "Chennai", hi: "चेन्नई", mr: "चेन्नई", kok: "चेन्नई" },
  "Coimbatore": { en: "Coimbatore", hi: "कोयंबटूर", mr: "कोयंबटूर", kok: "कोयंबटूर" },
  
  // Maharashtra districts
  "Mumbai": { en: "Mumbai", hi: "मुंबई", mr: "मुंबई", kok: "मुंबय" },
  "Pune": { en: "Pune", hi: "पुणे", mr: "पुणे", kok: "पुणें" },
  "Nagpur": { en: "Nagpur", hi: "नागपुर", mr: "नागपूर", kok: "नागपूर" },
  "Nashik": { en: "Nashik", hi: "नासिक", mr: "नाशिक", kok: "नाशिक" },
  "Aurangabad": { en: "Aurangabad", hi: "औरंगाबाद", mr: "औरंगाबाद", kok: "औरंगाबाद" },
  "Solapur": { en: "Solapur", hi: "सोलापुर", mr: "सोलापूर", kok: "सोलापूर" },
  "Thane": { en: "Thane", hi: "ठाणे", mr: "ठाणे", kok: "ठाणें" },
  "Raigad": { en: "Raigad", hi: "रायगड", mr: "रायगड", kok: "रायगड" },
  "Navi Mumbai": { en: "Navi Mumbai", hi: "नवी मुंबई", mr: "नवी मुंबई", kok: "नवें मुंबय" },
  
  // Karnataka districts
  "Bangalore": { en: "Bangalore", hi: "बेंगलुरु", mr: "बेंगलुरु", kok: "बेंगलुरु" },
  "Mysore": { en: "Mysore", hi: "मैसूर", mr: "मैसूर", kok: "मैसूर" },
  "Hubli": { en: "Hubli", hi: "हुबली", mr: "हुबळी", kok: "हुबळी" },
  
  // Gujarat districts
  "Ahmedabad": { en: "Ahmedabad", hi: "अहमदाबाद", mr: "अहमदाबाद", kok: "अहमदाबाद" },
  "Surat": { en: "Surat", hi: "सूरत", mr: "सूरत", kok: "सूरत" },
  "Vadodara": { en: "Vadodara", hi: "वडोदरा", mr: "वडोदरा", kok: "वडोदरा" },
  
  // Delhi
  "North Delhi": { en: "North Delhi", hi: "उत्तरी दिल्ली", mr: "उत्तर दिल्ली", kok: "उत्तर दिल्ली" },
  "South Delhi": { en: "South Delhi", hi: "दक्षिण दिल्ली", mr: "दक्षिण दिल्ली", kok: "दक्षिण दिल्ली" },
  "East Delhi": { en: "East Delhi", hi: "पूर्वी दिल्ली", mr: "पूर्व दिल्ली", kok: "पूर्व दिल्ली" },
  "West Delhi": { en: "West Delhi", hi: "पश्चिमी दिल्ली", mr: "पश्चिम दिल्ली", kok: "पश्चिम दिल्ली" },
  
  // Rajasthan districts
  "Jaipur": { en: "Jaipur", hi: "जयपुर", mr: "जयपूर", kok: "जयपूर" },
  "Jodhpur": { en: "Jodhpur", hi: "जोधपुर", mr: "जोधपूर", kok: "जोधपूर" },
  "Udaipur": { en: "Udaipur", hi: "उदयपुर", mr: "उदयपूर", kok: "उदयपूर" },
  
  // Uttar Pradesh districts
  "Lucknow": { en: "Lucknow", hi: "लखनऊ", mr: "लखनौ", kok: "लखनौ" },
  "Kanpur": { en: "Kanpur", hi: "कानपुर", mr: "कानपूर", kok: "कानपूर" },
  "Agra": { en: "Agra", hi: "आगरा", mr: "आग्रा", kok: "आग्रा" },
  "Varanasi": { en: "Varanasi", hi: "वाराणसी", mr: "वाराणसी", kok: "वाराणसी" },
  
  // Punjab districts
  "Amritsar": { en: "Amritsar", hi: "अमृतसर", mr: "अमृतसर", kok: "अमृतसर" },
  "Ludhiana": { en: "Ludhiana", hi: "लुधियाना", mr: "लुधियाना", kok: "लुधियाना" },
  "Jalandhar": { en: "Jalandhar", hi: "जालंधर", mr: "जालंधर", kok: "जालंधर" },
  
  // Haryana districts
  "Gurgaon": { en: "Gurgaon", hi: "गुड़गांव", mr: "गुडगाव", kok: "गुडगाव" },
  "Faridabad": { en: "Faridabad", hi: "फरीदाबाद", mr: "फरीदाबाद", kok: "फरीदाबाद" },
  "Panipat": { en: "Panipat", hi: "पानीपत", mr: "पानीपत", kok: "पानीपत" },
  
  // West Bengal districts
  "Kolkata": { en: "Kolkata", hi: "कोलकाता", mr: "कोलकाता", kok: "कोलकाता" },
  "Howrah": { en: "Howrah", hi: "हावड़ा", mr: "हावडा", kok: "हावडा" },
  
  // Nagaland
  "Kohima": { en: "Kohima", hi: "कोहिमा", mr: "कोहिमा", kok: "कोहिमा" },
  "Dimapur": { en: "Dimapur", hi: "दिमापुर", mr: "दिमापूर", kok: "दिमापूर" },
};

// Helper function to get translated state name
export function getStateTranslation(stateName: string, language: Language): string {
  const translation = stateTranslations[stateName];
  if (translation && translation[language]) {
    return translation[language];
  }
  return stateName; // Fallback to original name
}

// Helper function to get translated district name
export function getDistrictTranslation(districtName: string, language: Language): string {
  const translation = districtTranslations[districtName];
  if (translation && translation[language]) {
    return translation[language];
  }
  return districtName; // Fallback to original name
}

// Helper function to translate full location string (e.g., "Kottayam, Kerala")
export function translateLocation(location: string, language: Language): string {
  if (language === "en") return location;
  
  const parts = location.split(",").map(part => part.trim());
  const translatedParts = parts.map(part => {
    // Try district translation first, then state translation
    return getDistrictTranslation(part, language) || getStateTranslation(part, language) || part;
  });
  
  return translatedParts.join(", ");
}

// Helper function to translate market/mandi names
export function translateMarketName(marketName: string, language: Language): string {
  if (language === "en") return marketName;
  
  // APMC translations
  const apmcTranslations: Record<Language, string> = {
    en: "APMC",
    hi: "एपीएमसी",
    mr: "एपीएमसी",
    kok: "एपीएमसी"
  };
  
  // Mandi translations
  const mandiTranslations: Record<Language, string> = {
    en: "Mandi",
    hi: "मंडी",
    mr: "मंडी",
    kok: "मंडी"
  };
  
  // Market translations
  const marketTranslations: Record<Language, string> = {
    en: "Market",
    hi: "बाजार",
    mr: "बाजार",
    kok: "बाजार"
  };
  
  // Uzhavar Sandhai (Farmers Market in Tamil)
  const uzhavorSandhaiTranslations: Record<Language, string> = {
    en: "Uzhavar Sandhai",
    hi: "किसान बाजार",
    mr: "शेतकरी बाजार",
    kok: "शेतकारांचो बाजार"
  };
  
  let translatedName = marketName;
  
  // Replace APMC
  if (marketName.includes("APMC")) {
    translatedName = translatedName.replace(/APMC/g, apmcTranslations[language]);
  }
  
  // Replace Mandi
  if (marketName.includes("Mandi")) {
    translatedName = translatedName.replace(/Mandi/g, mandiTranslations[language]);
  }
  
  // Replace Market
  if (marketName.includes("Market")) {
    translatedName = translatedName.replace(/Market/g, marketTranslations[language]);
  }
  
  // Replace Uzhavar Sandhai (Tamil farmers market)
  if (marketName.includes("Uzhavar Sandhai")) {
    translatedName = translatedName.replace(/Uzhavar Sandhai/g, uzhavorSandhaiTranslations[language]);
  }
  
  // Replace parenthetical content like (Uzhavar Sandhai)
  if (marketName.includes("(Uzhavar Sandhai)")) {
    translatedName = translatedName.replace(/\(Uzhavar Sandhai\)/g, `(${uzhavorSandhaiTranslations[language]})`);
  }
  
  return translatedName;
}
