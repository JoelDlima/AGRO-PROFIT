/**
 * Resources Page - AgroProfit
 * Crop cultivation guides with real YouTube videos
 * Data from crop_cultivation_data.json (87 verified videos across 10 categories)
 */

import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Play, ExternalLink, Search, ChevronDown, ChevronUp
} from "lucide-react";
import guides from "@/data/crop_cultivation_data.json";

/* ── Types ── */
type VideoGuide = {
  video_id?: number;
  title: string;
  url: string;
  duration_approx?: string;
  focus?: string;
  language?: string;
};

type CropGuide = {
  crop_id?: string;
  crop_name: string;
  local_names?: string[];
  videos?: VideoGuide[];
  best_season?: string;
  soil_type?: string;
  water_requirement?: string;
  profit_potential?: string;
};

type CategoryGuide = {
  category_name: string;
  crops: CropGuide[];
};

type GuidesJson = {
  metadata?: {
    title?: string;
    total_crops?: number;
    total_video_links?: number;
    created_date?: string;
  };
  categories: Record<string, CategoryGuide>;
};

/* ── Component ── */
export default function Resources() {
  const { user } = useAuth();
  const { language } = useTheme();

  const data = guides as unknown as GuidesJson;
  const isHindi = language === 'hi';

  /* Parse categories from JSON */
  const categories = useMemo(() => {
    return Object.entries(data.categories ?? {})
      .map(([key, value]) => ({
        key,
        name: value.category_name,
        crops: value.crops ?? [],
        videoCount: (value.crops ?? []).reduce((sum, c) => sum + (c.videos?.length ?? 0), 0),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.categories]);

  const [activeCategoryKey, setActiveCategoryKey] = useState(() => categories[0]?.key ?? '');
  const [search, setSearch] = useState('');

  const activeCategory = useMemo(
    () => categories.find((c) => c.key === activeCategoryKey) ?? categories[0],
    [activeCategoryKey, categories]
  );

  const normalized = search.trim().toLowerCase();

  const visibleCrops = useMemo(() => {
    const crops = activeCategory?.crops ?? [];
    if (!normalized) return crops;
    return crops.filter((c) => {
      const name = (c.crop_name ?? '').toLowerCase();
      const locals = (c.local_names ?? []).join(' ').toLowerCase();
      return name.includes(normalized) || locals.includes(normalized);
    });
  }, [activeCategory?.crops, normalized]);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            {isHindi ? 'फसल गाइड और वीडियो' : 'Crop Guides & Videos'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isHindi
              ? `${data.metadata?.total_video_links ?? 87} वीडियो • ${data.metadata?.total_crops ?? 90} फसलें • 10 श्रेणियां`
              : `${data.metadata?.total_video_links ?? 87} videos • ${data.metadata?.total_crops ?? 90} crops • 10 categories`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <Card className="border-border/50">
              <CardContent className="p-3">
                <p className="text-sm font-semibold text-muted-foreground px-2 py-2">
                  {isHindi ? 'श्रेणियां' : 'Categories'}
                </p>

                {/* Mobile dropdown */}
                <div className="lg:hidden mb-2">
                  <select
                    aria-label={isHindi ? 'श्रेणी चुनें' : 'Choose category'}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={activeCategoryKey}
                    onChange={(e) => setActiveCategoryKey(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.name} ({c.videoCount})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Desktop list */}
                <div className="hidden lg:flex flex-col gap-1">
                  {categories.map((c) => {
                    const isActive = c.key === activeCategoryKey;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                        onClick={() => setActiveCategoryKey(c.key)}
                      >
                        <div className="flex items-center justify-between">
                          <span>{c.name}</span>
                          <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {c.videoCount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right Content - Crops & Videos */}
          <section className="flex-1 min-w-0">
            {/* Search + info bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">{activeCategory?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {isHindi
                    ? `${visibleCrops.length} फसलें दिख रही हैं`
                    : `Showing ${visibleCrops.length} crop${visibleCrops.length !== 1 ? 's' : ''}`}
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label={isHindi ? 'फसल खोजें' : 'Search crops'}
                  placeholder={isHindi ? 'फसल खोजें...' : 'Search crops...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Crop Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {visibleCrops.map((crop) => (
                <CropCard
                  key={crop.crop_id || crop.crop_name}
                  crop={crop}
                />
              ))}

              {!visibleCrops.length && (
                <Card className="border-border/50 border-dashed col-span-full">
                  <CardContent className="p-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold">{isHindi ? 'कोई फसल नहीं मिली' : 'No crops found'}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isHindi ? 'दूसरी श्रेणी या खोज शब्द आज़माएं' : 'Try another category or search term'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>

      </div>
    </AppLayout>
  );
}

/* ── Crop Card Component ── */
function CropCard({ crop }: { crop: CropGuide }) {
  const [open, setOpen] = useState(false);
  const videos = crop.videos ?? [];
  const locals = (crop.local_names ?? []).filter(Boolean);

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Crop header (click to expand) */}
      <button
        type="button"
        aria-expanded={open}
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0">
          <p className="font-semibold truncate">{crop.crop_name}</p>
          {locals.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Also: {locals.join(', ')}
            </p>
          )}
          {crop.best_season && (
            <p className="text-xs text-muted-foreground mt-0.5">🗓️ {crop.best_season}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">
            <Play className="h-3 w-3 mr-1" /> {videos.length}
          </Badge>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Video list (expanded) */}
      {open && (
        <div className="p-4 pt-0 space-y-2">
          {videos.length > 0 ? (
            videos.map((v) => (
                <div
                  key={String(v.video_id ?? v.url)}
                  className="group rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors p-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Local placeholder: no external media is loaded. */}
                    <div className="shrink-0 rounded-md w-28 h-16 bg-muted flex items-center justify-center" aria-hidden="true">
                      <Play className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {v.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {v.language && <span>{v.language}</span>}
                        {v.duration_approx && <span>• {v.duration_approx}</span>}
                      </div>
                      {v.focus && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{v.focus}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <a href={v.url} target="_blank" rel="noopener noreferrer"
                        aria-label={`Open ${v.title} on YouTube (opens in a new tab)`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" aria-hidden="true" /> Open on YouTube
                      </a>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground py-2">No videos available yet for this crop.</p>
          )}
        </div>
      )}
    </Card>
  );
}
