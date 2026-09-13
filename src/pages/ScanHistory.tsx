/**
 * Scan History Page - AgroProfit
 * Shows all past crop scans with disease info and treatment details
 */

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History, Trash2, Leaf, Bug, CheckCircle2, AlertTriangle,
  Calendar, ChevronRight, Loader2, Camera
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getScanHistory,
  deleteScan,
  clearScanHistory,
  type ScanRecord,
} from "@/services/scanHistoryService";

export default function ScanHistory() {
  const { user } = useAuth();
  const { t } = useTheme();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  if (!user) return <Navigate to="/auth" replace />;

  useEffect(() => {
    loadScans();
  }, [user?.id]);

  const loadScans = async () => {
    setLoading(true);
    const data = await getScanHistory(user?.id);
    setScans(data);
    setLoading(false);
  };

  const handleDelete = async (scanId: string) => {
    await deleteScan(scanId, user?.id);
    setScans(prev => prev.filter(s => s.id !== scanId));
    if (selectedScan?.id === scanId) setSelectedScan(null);
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all scan history?')) return;
    await clearScanHistory(user?.id);
    setScans([]);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'healthy':
        return { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Healthy' };
      case 'small_problem':
        return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <AlertTriangle className="h-4 w-4" />, label: 'Low' };
      case 'medium_problem':
        return { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <AlertTriangle className="h-4 w-4" />, label: 'Medium' };
      case 'big_problem':
        return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <AlertTriangle className="h-4 w-4" />, label: 'High' };
      default:
        return { color: 'bg-muted text-muted-foreground', icon: null, label: status };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-7 w-7 text-primary" />
              Scan History
            </h1>
            <p className="text-muted-foreground mt-1">
              {scans.length} scan{scans.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/crop-health">
              <Button variant="default" size="sm" className="gap-2">
                <Camera className="h-4 w-4" /> New Scan
              </Button>
            </Link>
            {scans.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2 text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" /> Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && scans.length === 0 && (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="bg-primary/10 p-5 rounded-full inline-block mb-4">
                <Leaf className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">No Scans Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start scanning your crops to detect diseases early and get treatment advice.
              </p>
              <Link to="/crop-health">
                <Button className="gap-2">
                  <Camera className="h-4 w-4" /> Scan Your First Crop
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Scan List */}
        {!loading && scans.length > 0 && (
          <div className="space-y-3">
            {scans.map((scan) => {
              const statusConfig = getStatusConfig(scan.status);
              return (
                <Card
                  key={scan.id}
                  className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedScan(scan)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      {scan.image_url ? (
                        <img
                          src={scan.image_url}
                          alt={scan.crop_name}
                          className="h-16 w-16 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Leaf className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{scan.crop_name}</h3>
                          <Badge className={`${statusConfig.color} text-xs`}>
                            {statusConfig.icon} {statusConfig.label}
                          </Badge>
                        </div>
                        {scan.disease_name && (
                          <p className="text-sm text-red-400 truncate">{scan.disease_name}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(scan.created_at)}
                          </span>
                          <span>{scan.provider === 'plant_id' ? 'Plant.id' : 'Crop Health'}</span>
                          {scan.disease_confidence != null && scan.disease_confidence > 0 && (
                            <span>{scan.disease_confidence}% confidence</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(scan.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Scan Detail Dialog */}
        <Dialog open={!!selectedScan} onOpenChange={() => setSelectedScan(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            {selectedScan && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedScan.status === 'healthy'
                      ? <CheckCircle2 className="h-5 w-5 text-green-400" />
                      : <AlertTriangle className="h-5 w-5 text-red-400" />
                    }
                    {selectedScan.crop_name}
                  </DialogTitle>
                  <DialogDescription>
                    Scanned {formatDate(selectedScan.created_at)} using {selectedScan.provider === 'plant_id' ? 'Plant.id' : 'Crop Health'}
                  </DialogDescription>
                </DialogHeader>

                {selectedScan.image_url && (
                  <img
                    src={selectedScan.image_url}
                    alt={selectedScan.crop_name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={getStatusConfig(selectedScan.status).color}>
                        {getStatusConfig(selectedScan.status).label}
                      </Badge>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Confidence</p>
                      <p className="font-semibold">{selectedScan.disease_confidence || 0}%</p>
                    </div>
                  </div>

                  {selectedScan.disease_name && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground">Disease Detected</p>
                      <p className="font-semibold text-red-400">{selectedScan.disease_name}</p>
                    </div>
                  )}

                  {selectedScan.status === 'healthy' && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 font-medium">🌿 No diseases detected. Your crop is healthy!</p>
                    </div>
                  )}

                  {selectedScan.treatment_summary && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Treatment</p>
                      <p className="text-sm">{selectedScan.treatment_summary}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
