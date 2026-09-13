/**
 * CropHealth Page - AgroProfit
 * Crop disease detection using Plant.id or crop.health APIs
 * Upload a photo → get diagnosis → AI treatment plan
 */

import { useState, useCallback, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Camera, Loader2, AlertTriangle, CheckCircle2,
  Leaf, Bug, Shield, FlaskConical, Sprout, ChevronDown,
  ChevronUp, Trash2, RotateCcw, History
} from "lucide-react";
import { Link } from "react-router-dom";
import { detectCropDisease, type PlantIdResult } from "@/services/plantIdService";
import { detectCropHealth, type CropHealthResult } from "@/services/cropHealthService";
import { generateDiagnosis, type CropDiagnosisResult } from "@/services/cropDiagnosisService";
import { saveScanToHistory, getScanStatus } from "@/services/scanHistoryService";

type ScanProvider = 'plant_id' | 'crop_health';
type ScanState = 'idle' | 'scanning' | 'diagnosing' | 'done' | 'error';

export default function CropHealth() {
  const { user } = useAuth();
  const { t, language } = useTheme();

  const [provider, setProvider] = useState<ScanProvider>('plant_id');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanResult, setScanResult] = useState<PlantIdResult | CropHealthResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTreatment, setShowTreatment] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <Navigate to="/auth" replace />;

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Start scanning
    setScanState('scanning');
    setErrorMsg('');
    setScanResult(null);
    setDiagnosis(null);

    try {
      // Step 1: Detect disease
      let result: PlantIdResult | CropHealthResult;
      if (provider === 'plant_id') {
        result = await detectCropDisease(file);
      } else {
        result = await detectCropHealth(file);
      }
      setScanResult(result);

      // Step 2: If disease detected, get AI explanation
      if (!result.isHealthy && result.diseaseName) {
        setScanState('diagnosing');
        const langLabel = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';
        const diag = await generateDiagnosis(result, langLabel);
        setDiagnosis(diag);
      }

      setScanState('done');

      // Step 3: Save to history
      try {
        await saveScanToHistory({
          scan_type: provider === 'plant_id' ? 'plant' : 'crop',
          provider: provider,
          crop_name: result.cropName,
          location: 'Field Scan',
          image_url: result.imageUrl,
          status: getScanStatus(result.isHealthy, result.severity),
          disease_name: result.diseaseName,
          disease_severity: result.severity === 'none' ? null : result.severity,
          disease_confidence: result.confidence,
          disease_description: result.isHealthy ? null : (result.diseaseName || null),
          treatment_summary: null,
          treatment_steps: [],
          ai_explanation: {},
          ai_language: language,
        }, user.id);
      } catch (e) {
        console.warn('Failed to save scan history:', e);
      }

    } catch (error) {
      console.error('Scan failed:', error);
      setErrorMsg(error instanceof Error ? error.message : 'Scan failed. Please try again.');
      setScanState('error');
    }
  }, [provider, language, user?.id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const resetScan = () => {
    setScanState('idle');
    setScanResult(null);
    setDiagnosis(null);
    setErrorMsg('');
    setImagePreview(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy
      ? <CheckCircle2 className="h-6 w-6 text-green-400" />
      : <AlertTriangle className="h-6 w-6 text-red-400" />;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Leaf className="h-7 w-7 text-green-400" />
              {t('cropHealth.title') !== 'cropHealth.title' ? t('cropHealth.title') : 'Crop Health Scanner'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('cropHealth.subtitle') !== 'cropHealth.subtitle' ? t('cropHealth.subtitle') : 'Upload a photo of your crop to detect diseases and get treatment advice'}
            </p>
          </div>
          <Link to="/scan-history">
            <Button variant="outline" size="sm" className="gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload */}
          <div className="space-y-4">
            {/* Provider Selector */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">Detection API</p>
                <div className="flex gap-2">
                  <Button
                    variant={provider === 'plant_id' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProvider('plant_id')}
                    disabled={scanState === 'scanning' || scanState === 'diagnosing'}
                    className="flex-1"
                  >
                    <Sprout className="h-4 w-4 mr-2" />
                    Plant.id
                  </Button>
                  <Button
                    variant={provider === 'crop_health' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProvider('crop_health')}
                    disabled={scanState === 'scanning' || scanState === 'diagnosing'}
                    className="flex-1"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Crop Health
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <Card className="border-border/50">
              <CardContent className="p-0">
                {scanState === 'idle' || scanState === 'error' ? (
                  <div
                    className="relative border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors min-h-[300px] flex flex-col items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <Camera className="h-10 w-10 text-primary" />
                    </div>
                    <p className="text-lg font-medium">Take a Photo or Upload</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tap to use camera or drag & drop an image
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      📸 Tips: Good lighting • Focus on affected area • One leaf at a time
                    </p>

                    {errorMsg && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        ⚠️ {errorMsg}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Scan preview"
                        className="w-full h-[300px] object-cover rounded-lg"
                      />
                    )}
                    {(scanState === 'scanning' || scanState === 'diagnosing') && (
                      <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                        <p className="text-white font-medium">
                          {scanState === 'scanning' ? 'Detecting disease...' : 'Generating treatment plan...'}
                        </p>
                        <p className="text-white/60 text-sm mt-1">
                          Using {provider === 'plant_id' ? 'Plant.id' : 'Crop Health'} API
                        </p>
                      </div>
                    )}
                    {scanState === 'done' && (
                      <div className="absolute top-3 right-3">
                        <Button size="sm" variant="secondary" onClick={resetScan} className="gap-2">
                          <RotateCcw className="h-4 w-4" /> New Scan
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Scan Result */}
            {scanResult && scanState === 'done' && (
              <>
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(scanResult.isHealthy)}
                        {scanResult.isHealthy ? 'Healthy Crop' : 'Disease Detected'}
                      </CardTitle>
                      <Badge className={getSeverityColor(scanResult.severity)}>
                        {scanResult.severity === 'none' ? '✅ Healthy' : `⚠️ ${scanResult.severity.charAt(0).toUpperCase() + scanResult.severity.slice(1)} Severity`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Crop Identified</p>
                        <p className="font-semibold text-green-400">{scanResult.cropName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-semibold">{scanResult.confidence}%</p>
                      </div>
                    </div>
                    {scanResult.diseaseName && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-muted-foreground">Disease</p>
                        <p className="font-semibold text-red-400">{scanResult.diseaseName}</p>
                      </div>
                    )}
                    {scanResult.isHealthy && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 font-medium">
                          🌿 Your crop looks healthy! Keep up the good work with your current farming practices.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Treatment Plan */}
                {diagnosis && !scanResult.isHealthy && (
                  <Card className="border-border/50">
                    <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowTreatment(!showTreatment)}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-blue-400" />
                          Treatment Plan
                        </CardTitle>
                        {showTreatment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CardHeader>
                    {showTreatment && (
                      <CardContent className="space-y-4">
                        {/* Summary */}
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-sm font-medium text-blue-400 mb-1">📋 Summary</p>
                          <p className="text-sm">{diagnosis.summary}</p>
                        </div>

                        {/* Cause */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">🔍 Why it happens</p>
                          <p className="text-sm">{diagnosis.whyItHappens}</p>
                        </div>

                        {/* Treatment Tabs */}
                        <Tabs defaultValue="organic">
                          <TabsList className="w-full">
                            <TabsTrigger value="organic" className="flex-1 gap-1">
                              <Leaf className="h-3 w-3" /> Organic
                            </TabsTrigger>
                            <TabsTrigger value="chemical" className="flex-1 gap-1">
                              <FlaskConical className="h-3 w-3" /> Chemical
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="organic" className="mt-3 space-y-2">
                            {diagnosis.treatment.organic.map((step, i) => (
                              <div key={i} className="flex gap-3 p-2 bg-green-500/5 rounded-lg">
                                <div className="bg-green-500/20 text-green-400 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0">
                                  {step.step}
                                </div>
                                <div>
                                  <p className="text-sm">{step.action}</p>
                                  {step.timing && <p className="text-xs text-muted-foreground mt-0.5">⏰ {step.timing}</p>}
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                          <TabsContent value="chemical" className="mt-3 space-y-2">
                            {diagnosis.treatment.chemical.map((step, i) => (
                              <div key={i} className="flex gap-3 p-2 bg-amber-500/5 rounded-lg">
                                <div className="bg-amber-500/20 text-amber-400 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0">
                                  {step.step}
                                </div>
                                <div>
                                  <p className="text-sm">{step.action}</p>
                                  {step.timing && <p className="text-xs text-muted-foreground mt-0.5">⏰ {step.timing}</p>}
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                        </Tabs>

                        {/* Dosage */}
                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <p className="text-sm font-medium text-purple-400 mb-1">💊 Dosage</p>
                          <p className="text-sm">{diagnosis.dosage}</p>
                        </div>

                        {/* Safety Tips */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            <Shield className="h-4 w-4 inline mr-1" />
                            Safety Tips
                          </p>
                          <ul className="space-y-1">
                            {diagnosis.safetyTips.map((tip, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-yellow-400">⚠️</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Prevention */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">🛡️ Prevention</p>
                          <ul className="space-y-1">
                            {diagnosis.prevention.map((tip, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-400">✓</span> {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Urgency Badge */}
                        <div className="flex justify-center pt-2">
                          <Badge className={
                            diagnosis.urgency === 'immediate'
                              ? 'bg-red-500/20 text-red-400'
                              : diagnosis.urgency === 'soon'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-green-500/20 text-green-400'
                          }>
                            {diagnosis.urgency === 'immediate' ? '🚨 Act Immediately' :
                              diagnosis.urgency === 'soon' ? '⚡ Treat Soon' : '👁️ Monitor'}
                          </Badge>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}
              </>
            )}

            {/* Empty state when no scan */}
            {scanState === 'idle' && (
              <Card className="border-border/50 border-dashed">
                <CardContent className="p-8 text-center">
                  <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                    <Bug className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">How It Works</h3>
                  <div className="text-sm text-muted-foreground space-y-3 text-left max-w-sm mx-auto">
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/20 text-primary rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <p>📸 Take a clear photo of the affected crop/leaf</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/20 text-primary rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <p>🔬 AI identifies the plant and detects any diseases</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-primary/20 text-primary rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <p>💊 Get a step-by-step treatment plan (organic + chemical)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
