/**
 * Crop Diagnosis Service for AgroProfit
 * Generates AI-powered treatment explanations via Edge Function (crop-diagnosis)
 * Uses Groq (llama-3.3-70b) for AI-powered treatment plans
 */

import type { PlantIdResult } from './plantIdService';

const DIAGNOSIS_EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crop-diagnosis`;

// In-memory cache
const explanationCache = new Map<string, CropDiagnosisResult>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface TreatmentStep {
  step: number;
  action: string;
  timing?: string;
}

export interface CropDiagnosisResult {
  summary: string;
  whyItHappens: string;
  treatment: {
    organic: TreatmentStep[];
    chemical: TreatmentStep[];
  };
  dosage: string;
  safetyTips: string[];
  prevention: string[];
  urgency: 'immediate' | 'soon' | 'monitor';
}

/**
 * Generate crop disease explanation via Edge Function
 */
export async function generateDiagnosis(
  plantData: { cropName: string; diseaseName: string | null; confidence: number; severity: string; isHealthy: boolean },
  language: string = 'en',
  weather?: any
): Promise<CropDiagnosisResult> {
  // Check cache
  const cacheKey = `${plantData.cropName}-${plantData.diseaseName}-${language}`;
  const cached = explanationCache.get(cacheKey);
  if (cached) {
    console.log('[Diagnosis] Using cached explanation');
    return cached;
  }

  console.log('[Diagnosis] Generating AI explanation...');

  try {
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(DIAGNOSIS_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ plantData, language, weather }),
    });

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Diagnosis] Success (using ${data.apiUsed || 'AI'} API)`);

    const result = parseAIResponse(data.explanation, plantData, language);

    // Cache it
    explanationCache.set(cacheKey, result);
    setTimeout(() => explanationCache.delete(cacheKey), CACHE_DURATION);

    return result;
  } catch (error) {
    console.warn('[Diagnosis] Edge Function failed, using fallback', error);
    return getFallbackExplanation(plantData, language);
  }
}

function isHindi(language: string) {
  const l = (language || '').toLowerCase();
  return l === 'hi' || l.includes('hindi');
}

function parseAIResponse(text: string, plantData: any, language: string): CropDiagnosisResult {
  const lines = String(text || '').split('\n').map(l => l.trim()).filter(Boolean);

  const cleanLead = (s: string) =>
    s.replace(/^\*\*(.+?)\*\*:?\s*/i, '').replace(/^[-•]\s+/, '').trim();

  const extractByNumber = (num: number) => {
    const startIdx = lines.findIndex(l => new RegExp(`^\\s*${num}\\s*[).:\\-]|^\\s*${num}\\.`).test(l));
    if (startIdx < 0) return '';
    const firstLine = lines[startIdx];
    const afterNumber = cleanLead(firstLine.replace(new RegExp(`^\\s*${num}\\s*[).:\\-]?\\s*`), ''));
    const content: string[] = [];
    if (afterNumber) content.push(afterNumber);
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^\d+\s*[).:\-]/.test(lines[i]) || /^\d+\./.test(lines[i])) break;
      const cleaned = cleanLead(lines[i]);
      if (cleaned) content.push(cleaned);
    }
    return content.join(' ').trim();
  };

  const hi = isHindi(language);
  const whatIsIt = extractByNumber(1) || (hi ? 'बीमारी का पता चला है।' : 'Disease detected.');
  const cause = extractByNumber(2) || (hi ? 'मौसम और मिट्टी की स्थिति के कारण।' : 'Environmental factors.');
  const organic = extractByNumber(3) || (hi ? 'जैविक उपचार करें।' : 'Apply organic treatment.');
  const chemical = extractByNumber(4) || (hi ? 'कृषि विशेषज्ञ से सलाह लें।' : 'Consult agricultural expert.');
  const prevention = extractByNumber(5) || (hi ? 'नियमित निगरानी रखें।' : 'Regular monitoring.');

  return {
    summary: whatIsIt,
    whyItHappens: cause,
    treatment: {
      organic: [
        { step: 1, action: organic, timing: hi ? 'हर 2 सप्ताह' : 'Every 2 weeks' },
        { step: 2, action: hi ? 'जैविक मल्च डालें।' : 'Mulch with organic matter to retain moisture.', timing: hi ? 'मासिक' : 'Monthly' },
      ],
      chemical: [
        { step: 1, action: chemical, timing: hi ? 'लेबल के अनुसार' : 'As per package' },
        { step: 2, action: hi ? 'पत्तियों पर स्प्रे करें।' : 'Apply foliar spray for quick uptake.', timing: hi ? 'साप्ताहिक' : 'Weekly' },
      ],
    },
    dosage: hi
      ? 'खाद: 2–3 किग्रा/पौधा | उर्वरक: 10–15 ग्राम/पौधा | स्प्रे: 5–10 मि.ली./लीटर'
      : 'Compost: 2-3 kg/plant | Fertilizer: 10-15g/plant | Spray: 5-10ml/L',
    safetyTips: [
      hi ? 'उपचार करते समय दस्ताने पहनें।' : 'Wear gloves when handling treatments.',
      hi ? 'दोपहर की तेज़ धूप में छिड़काव से बचें।' : 'Avoid applying during midday heat.',
      hi ? 'उपचार से पहले और बाद में हल्का पानी दें।' : 'Water plants before and after application.',
    ],
    prevention: [
      prevention,
      hi ? 'मिट्टी की नियमित जांच करें।' : 'Test soil regularly.',
      hi ? 'सही सिंचाई बनाए रखें।' : 'Maintain proper watering.',
      hi ? 'फसल चक्र अपनाएं।' : 'Use crop rotation.',
    ],
    urgency: plantData.severity === 'high' ? 'immediate' : plantData.severity === 'medium' ? 'soon' : 'monitor',
  };
}

function getFallbackExplanation(plantData: any, language: string): CropDiagnosisResult {
  const hi = isHindi(language);
  return {
    summary: hi
      ? `आपकी ${plantData.cropName} फसल में ${plantData.diseaseName || 'बीमारी'} के लक्षण दिख रहे हैं।`
      : `Your ${plantData.cropName} shows signs of ${plantData.diseaseName || 'disease'}.`,
    whyItHappens: hi
      ? 'यह समस्या मौसम, मिट्टी, या पोषक तत्वों की कमी के कारण होती है।'
      : 'This typically occurs due to environmental conditions, poor soil, or lack of nutrients.',
    treatment: {
      organic: [
        { step: 1, action: hi ? 'नीम तेल का स्प्रे करें (10 मि.ली./लीटर)' : 'Apply neem oil spray (10ml/L)', timing: hi ? 'हर 7 दिन' : 'Every 7 days' },
        { step: 2, action: hi ? 'जैविक खाद डालें' : 'Add compost around the plant', timing: hi ? 'महीने में 1 बार' : 'Once a month' },
      ],
      chemical: [
        { step: 1, action: hi ? 'कॉपर-आधारित फफूंदनाशक का उपयोग करें' : 'Use copper-based fungicide', timing: hi ? 'हर 10 दिन' : 'Every 10 days' },
      ],
    },
    dosage: hi
      ? 'नीम तेल: 10 मि.ली./लीटर | कम्पोस्ट: 2–3 किग्रा/पौधा'
      : 'Neem oil: 10ml/L | Compost: 2-3kg/plant | Fungicide: As per label',
    safetyTips: [
      hi ? 'सुरक्षा दस्ताने पहनें।' : 'Wear protective gloves.',
      hi ? 'सुबह या शाम को छिड़काव करें।' : 'Apply in early morning or evening.',
    ],
    prevention: [
      hi ? 'नियमित निगरानी रखें।' : 'Regular monitoring.',
      hi ? 'सही सिंचाई बनाए रखें।' : 'Proper watering schedule.',
      hi ? 'हवा का अच्छा आवागमन रखें।' : 'Good air circulation.',
    ],
    urgency: plantData.severity === 'high' ? 'immediate' : 'soon',
  };
}
