import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPriceHistory } from "@/services/forumService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

interface PriceTrendsChartProps {
  commodity: string;
  state?: string;
  days?: number;
}

export function PriceTrendsChart({ commodity, state, days = 15 }: PriceTrendsChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgPrice: 0,
    maxPrice: 0,
    minPrice: 0,
    trend: "stable" as "up" | "down" | "stable",
    change: 0,
  });

  useEffect(() => {
    loadPriceHistory();
  }, [commodity, state, days]);

  async function loadPriceHistory() {
    setLoading(true);
    try {
      const history = await getPriceHistory(commodity, state, days);
      
      if (history.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Group by date and calculate average
      const groupedData = history.reduce((acc: any, item: any) => {
        const date = item.recorded_date;
        if (!acc[date]) {
          acc[date] = {
            date,
            prices: [],
            min: item.min_price || item.modal_price,
            max: item.max_price || item.modal_price,
          };
        }
        acc[date].prices.push(item.modal_price);
        return acc;
      }, {});

      const chartData = Object.values(groupedData).map((item: any) => ({
        date: format(new Date(item.date), "MMM dd"),
        fullDate: item.date,
        avgPrice: Math.round(item.prices.reduce((a: number, b: number) => a + b, 0) / item.prices.length),
        minPrice: item.min,
        maxPrice: item.max,
      }));

      chartData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
      setData(chartData);

      // Calculate statistics
      const prices = chartData.map((d) => d.avgPrice);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      // Calculate trend (compare first and last)
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const change = ((lastPrice - firstPrice) / firstPrice) * 100;
      const trend = change > 2 ? "up" : change < -2 ? "down" : "stable";

      setStats({ avgPrice, maxPrice, minPrice, trend, change });
    } catch (error) {
      console.error("Error loading price history:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Trends</CardTitle>
          <CardDescription>
            No historical data available for {commodity}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Price data will appear here after a few days</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {commodity} Price Trends
              {state && <span className="text-muted-foreground"> - {state}</span>}
            </CardTitle>
            <CardDescription>Last {days} days price movement</CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              {stats.trend === "up" ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : stats.trend === "down" ? (
                <TrendingDown className="h-5 w-5 text-destructive" />
              ) : null}
              <span
                className={`text-lg font-bold ${
                  stats.trend === "up"
                    ? "text-success"
                    : stats.trend === "down"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {stats.change > 0 ? "+" : ""}
                {stats.change.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">vs {days} days ago</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-xl font-bold">₹{stats.avgPrice}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Highest</p>
            <p className="text-xl font-bold text-success">₹{stats.maxPrice}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Lowest</p>
            <p className="text-xl font-bold text-destructive">₹{stats.minPrice}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                label={{ value: "Price (₹/quintal)", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgPrice"
                name="Average Price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Prices are averaged across all mandis per day
        </p>
      </CardContent>
    </Card>
  );
}
