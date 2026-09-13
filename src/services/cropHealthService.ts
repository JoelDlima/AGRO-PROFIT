/**
 * Crop Health (Kindwise) API Service for AgroProfit
 * Calls crop.health via Supabase Edge Function (crophealth-detect)
 * NO API KEYS exposed on client side
 * 
 * crop.health combines identification + disease detection in ONE call
 */

const CROPHEALTH_EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crophealth-detect`;

export interface CropHealthResult {
  cropName: string;
  diseaseName: string | null;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'none';
  isHealthy: boolean;
  imageUrl: string;
}

/** Convert image file to base64 data URI */
async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Call crop.health Edge Function */
async function callCropHealthEdgeFunction(base64Image: string): Promise<any> {
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(CROPHEALTH_EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('crop.health Edge Function error:', errorText);
    throw new Error(`Edge Function error: ${response.status}`);
  }

  return await response.json();
}

/** Analyze crop image for diseases using crop.health API (via Edge Function) */
export async function detectCropHealth(imageFile: File): Promise<CropHealthResult> {
  const base64Image = await imageToBase64(imageFile);
  console.log('[CropHealth] Image converted, length:', base64Image.length);

  try {
    console.log('[CropHealth] Calling Edge Function...');
    const data = await callCropHealthEdgeFunction(base64Image);
    return parseApiResponse(data, imageFile);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(
      `crop.health analysis failed. Ensure Edge Function 'crophealth-detect' is deployed and CROPHEALTH_API_KEY secret is set. Details: ${msg}`
    );
  }
}

/** Parse crop.health API response */
function parseApiResponse(data: any, imageFile: File): CropHealthResult {
  const cropSuggestion = data.result?.crop?.suggestions?.[0];
  const cropName = cropSuggestion?.name || 'Unknown Crop';

  const diseaseSuggestion = data.result?.disease?.suggestions?.[0];
  const diseaseName = diseaseSuggestion?.name || null;
  const diseaseConfidence = Math.round((diseaseSuggestion?.probability || 0) * 100);

  const isHealthy = !diseaseName ||
    diseaseName.toLowerCase().includes('healthy') ||
    diseaseConfidence < 20;

  let severity: CropHealthResult['severity'] = 'none';
  if (!isHealthy && diseaseConfidence > 0) {
    if (diseaseConfidence >= 70) severity = 'high';
    else if (diseaseConfidence >= 50) severity = 'medium';
    else severity = 'low';
  }

  return {
    cropName,
    diseaseName: isHealthy ? null : diseaseName,
    confidence: diseaseConfidence,
    severity,
    isHealthy,
    imageUrl: URL.createObjectURL(imageFile),
  };
}
