import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudRain, Droplets, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchRainfallData, calculateAnnualRainfall, getRainfallRisk } from "@/services/rainfallService";

interface RainfallWidgetProps {
  state: string;
}

export function RainfallWidget({ state }: RainfallWidgetProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['rainfall', state],
    queryFn: () => fetchRainfallData(state),
    enabled: !!state,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (rainfall data doesn't change frequently)
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.records.length === 0) {
    return null; // Silently fail if no data available
  }

  // Use first district's data or average if multiple districts
  const rainfallRecord = data.records[0];
  const annualRainfall = calculateAnnualRainfall(rainfallRecord);
  const risk = getRainfallRisk(annualRainfall);

  // Get last 6 months data
  const currentMonth = new Date().getMonth();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    return {
      name: monthNames[monthIndex],
      rainfall: parseFloat(rainfallRecord[monthKeys[monthIndex] as keyof typeof rainfallRecord] || "0")
    };
  });

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CloudRain className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Rainfall Data</CardTitle>
        </div>
        <CardDescription>
          {state} - {rainfallRecord.year} Annual Rainfall
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Annual Rainfall */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{annualRainfall.toFixed(0)} mm</p>
              <p className="text-sm text-muted-foreground">Annual Rainfall</p>
            </div>
          </div>
          <div className={`text-right ${risk.color}`}>
            <p className="text-sm font-medium capitalize">{risk.level} Rainfall</p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div>
          <p className="text-sm font-medium mb-2">Last 6 Months</p>
          <div className="grid grid-cols-6 gap-2">
            {last6Months.map((month) => {
              const heightPercent = Math.min((month.rainfall / 500) * 100, 100);
              const minHeight = month.rainfall > 0 ? 4 : 0;
              return (
                <div key={month.name} className="text-center">
                  <div className="h-16 flex items-end justify-center">
                    {/* eslint-disable-next-line react/forbid-dom-props */}
                    <div 
                      className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all"
                      style={{ 
                        height: `${heightPercent}%`,
                        minHeight: `${minHeight}px`
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1">{month.name.substring(0, 3)}</p>
                  <p className="text-xs text-muted-foreground">{month.rainfall}mm</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Alert */}
        {(risk.level === "low" || risk.level === "excess") && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              {risk.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Data Source */}
        <p className="text-xs text-muted-foreground text-center">
          Data source: India Meteorological Department via data.gov.in
        </p>
      </CardContent>
    </Card>
  );
}
