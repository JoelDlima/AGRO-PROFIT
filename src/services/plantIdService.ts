/**
 * Plant.id API Service for AgroProfit
 * Calls Plant.id via Supabase Edge Function (plantid-detect)
 * NO API KEYS exposed on client side
 */

const PLANTID_EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plantid-detect`;

export interface PlantIdResult {
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

/** Call Plant.id Edge Function */
async function callPlantIdEdgeFunction(
  base64Image: string,
  action: 'identify' | 'health'
): Promise<any> {
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(PLANTID_EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ image: base64Image, action }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Plant.id Edge Function error:', errorText);
    throw new Error(`Edge Function error: ${response.status}`);
  }

  return await response.json();
}

/** Analyze crop image for diseases using Plant.id API (via Edge Function) */
export async function detectCropDisease(imageFile: File): Promise<PlantIdResult> {
  const base64Image = await imageToBase64(imageFile);
  console.log('[PlantID] Image converted, length:', base64Image.length);

  try {
    // Step 1: Identify the plant species
    console.log('[PlantID] Step 1: Identifying plant...');
    const identifyData = await callPlantIdEdgeFunction(base64Image, 'identify');
    const plantName = identifyData.result?.classification?.suggestions?.[0]?.name || 'Unknown Plant';
    console.log('[PlantID] Plant identified:', plantName);

    // Step 2: Check for diseases
    console.log('[PlantID] Step 2: Checking diseases...');
    await new Promise(resolve => setTimeout(resolve, 500));
    const healthData = await callPlantIdEdgeFunction(base64Image, 'health');

    return parseApiResponse(healthData, plantName, imageFile);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Plant.id analysis failed. Ensure the Edge Function 'plantid-detect' is deployed and PLANTID_API_KEY secret is set. Details: ${msg}`
    );
  }
}

/** Parse Plant.id API response */
function parseApiResponse(data: any, identifiedPlantName: string, imageFile: File): PlantIdResult {
  const isHealthy = data.result?.is_healthy?.binary ?? true;
  const disease = data.result?.disease?.suggestions?.[0];
  const diseaseName = disease?.name || null;
  const diseaseConfidence = Math.round((disease?.probability || 0) * 100);

  let severity: PlantIdResult['severity'] = 'none';
  if (!isHealthy && diseaseConfidence > 0) {
    if (diseaseConfidence >= 70) severity = 'high';
    else if (diseaseConfidence >= 50) severity = 'medium';
    else severity = 'low';
  }

  return {
    cropName: identifiedPlantName,
    diseaseName,
    confidence: diseaseConfidence,
    severity,
    isHealthy,
    imageUrl: URL.createObjectURL(imageFile),
  };
}
