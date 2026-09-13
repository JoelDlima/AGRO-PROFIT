/**
 * Resources Page - AgroProfit
 * Crop cultivation guides with real YouTube videos
 * Data from crop_cultivation_data.json (87 verified videos across 10 categories)
 */

import { useMemo, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen, Play, ExternalLink, Search, ChevronDown, ChevronUp,
  X
} from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/youtube";
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

  if (!user) return <Navigate to="/auth" replace />;

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
  const [player, setPlayer] = useState<{ title: string; url: string } | null>(null);

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

  const embedUrl = useMemo(() => (player ? getYouTubeEmbedUrl(player.url) : null), [player]);

  /* Close modal on Escape */
  useEffect(() => {
    if (!player) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlayer(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [player]);

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
                  onPlay={(v) => setPlayer({ title: v.title, url: v.url })}
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

        {/* Video Player Modal */}
        {player && (
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.currentTarget === e.target) setPlayer(null); }}
          >
            <div className="w-full max-w-4xl">
              <Card className="overflow-hidden">
                {/* Modal header */}
                <div className="p-4 border-b border-border/50 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Now Playing</p>
                    <p className="font-semibold truncate">{player.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={player.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        <ExternalLink className="h-3 w-3" /> YouTube
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => setPlayer(null)} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Iframe or fallback */}
                <div className="p-4">
                  {embedUrl ? (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
                      <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title={player.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border/50 bg-muted/50 p-6 text-center">
                      <p className="font-semibold">Can't embed this video</p>
                      <p className="text-sm text-muted-foreground mt-1">Open it directly on YouTube</p>
                      <a href={player.url} target="_blank" rel="noopener noreferrer">
                        <Button className="mt-4 gap-2">
                          <ExternalLink className="h-4 w-4" /> Open on YouTube
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/* ── Crop Card Component ── */
function CropCard({ crop, onPlay }: { crop: CropGuide; onPlay: (video: VideoGuide) => void }) {
  const [open, setOpen] = useState(false);
  const videos = crop.videos ?? [];
  const locals = (crop.local_names ?? []).filter(Boolean);

  return (
    <Card className="border-border/50 overflow-hidden">
      {/* Crop header (click to expand) */}
      <button
        type="button"
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
            videos.map((v) => {
              const ytId = extractYouTubeId(v.url);
              return (
                <div
                  key={String(v.video_id ?? v.url)}
                  className="group rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors p-3"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    {ytId && (
                      <button
                        type="button"
                        className="relative shrink-0 rounded-md overflow-hidden w-28 h-16"
                        onClick={() => onPlay(v)}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                          alt={v.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-5 w-5 text-white fill-white" />
                        </div>
                      </button>
                    )}

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
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => onPlay(v)}
                      >
                        <Play className="h-3 w-3" /> Play
                      </Button>
                      <a href={v.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground py-2">No videos available yet for this crop.</p>
          )}
        </div>
      )}
    </Card>
  );
}
