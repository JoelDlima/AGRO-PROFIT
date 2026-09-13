import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crops } from "@/data/mockData";
import { useTransformedMarkets } from "@/hooks/useMandiPrices";
import { getPriceHistory } from "@/services/forumService";
import { Download, FileText, Table2, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { parse } from "papaparse";
import { getStateTranslation, getDistrictTranslation, translateMarketName } from "@/lib/locationTranslations";

// Helper to get crop name based on language
const getCropName = (crop: any, language: string) => {
  if (language === 'hi') return crop.nameHi || crop.name;
  if (language === 'mr') return crop.nameMr || crop.name;
  if (language === 'kok') return crop.nameKok || crop.name;
  return crop.name;
};

export default function ExportReport() {
  const [selectedCrop, setSelectedCrop] = useState("tomato");
  const [reportType, setReportType] = useState<"current" | "historical">("current");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTheme();

  const selectedCropData = crops.find((c) => c.id === selectedCrop);
  const { markets: currentMarkets, isLoading } = useTransformedMarkets(
    selectedCropData?.name || "",
    undefined
  );

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(34, 197, 94); // Green color
      doc.text("AgroProfit Price Report", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Crop: ${selectedCropData?.name}`, pageWidth / 2, 30, { align: "center" });
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, 37, { align: "center" });
      
      if (reportType === "current") {
        // Current Prices Report
        const topMarkets = currentMarkets?.slice(0, 20) || [];
        
        // Summary stats
        const avgPrice = Math.round(topMarkets.reduce((sum, m) => sum + m.price, 0) / topMarkets.length);
        const minPrice = Math.min(...topMarkets.map(m => m.price));
        const maxPrice = Math.max(...topMarkets.map(m => m.price));
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Summary Statistics", 14, 50);
        
        doc.setFontSize(10);
        doc.text(`Average Price: Rs.${avgPrice}/quintal`, 20, 58);
        doc.text(`Lowest Price: Rs.${minPrice}/quintal`, 20, 64);
        doc.text(`Highest Price: Rs.${maxPrice}/quintal`, 20, 70);
        doc.text(`Total Markets: ${topMarkets.length}`, 20, 76);
        
        // Market prices table
        doc.setFontSize(14);
        doc.text("Top Market Prices", 14, 90);
        
        autoTable(doc, {
          startY: 95,
          head: [["#", "Market", "District", "State", "Price (₹/quintal)", "Trend"]],
          body: topMarkets.map((market, index) => [
            (index + 1).toString(),
            translateMarketName(market.name, language),
            getDistrictTranslation(market.district, language),
            getStateTranslation(market.state, language),
            `Rs.${market.price}`,
            market.trend === "up" ? "Rising" : market.trend === "down" ? "Falling" : "Stable"
          ]),
          theme: "striped",
          headStyles: { fillColor: [34, 197, 94] },
          styles: { fontSize: 9 },
        });
        
      } else {
        // Historical Prices Report
        const historyData = await getPriceHistory(selectedCropData?.name || "", undefined, 14);
        
        if (historyData && historyData.length > 0) {
          // Group by date and calculate daily averages
          const dailyData = historyData.reduce((acc: any, record: any) => {
            const date = record.recorded_date;
            if (!acc[date]) {
              acc[date] = { prices: [], date };
            }
            acc[date].prices.push(record.modal_price);
            return acc;
          }, {});
          
          const trendData = Object.values(dailyData).map((day: any) => ({
            date: day.date,
            avgPrice: Math.round(day.prices.reduce((a: number, b: number) => a + b, 0) / day.prices.length),
            minPrice: Math.min(...day.prices),
            maxPrice: Math.max(...day.prices),
          })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          doc.setFontSize(14);
          doc.setTextColor(0);
          doc.text("14-Day Price Trend", 14, 50);
          
          autoTable(doc, {
            startY: 55,
            head: [["Date", "Avg Price", "Min Price", "Max Price", "Change"]],
            body: trendData.map((day: any, index: number) => {
              const prevDay = index > 0 ? trendData[index - 1] : null;
              const change = prevDay ? day.avgPrice - prevDay.avgPrice : 0;
              const changeStr = change > 0 ? `+Rs.${change}` : change < 0 ? `-Rs.${Math.abs(change)}` : "No change";
              
              return [
                new Date(day.date).toLocaleDateString("en-IN"),
                `Rs.${day.avgPrice}`,
                `Rs.${day.minPrice}`,
                `Rs.${day.maxPrice}`,
                changeStr
              ];
            }),
            theme: "striped",
            headStyles: { fillColor: [34, 197, 94] },
            styles: { fontSize: 9 },
          });
        }
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `AgroProfit - Sell Smart, Earn More | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }
      
      // Save PDF
      doc.save(`${selectedCropData?.name}_price_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: t("export.success"),
        description: t("export.pdfSuccess"),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("export.failed"),
        description: t("export.pdfFailed"),
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      let csvContent = "";
      
      if (reportType === "current") {
        // Current prices CSV
        const markets = currentMarkets || [];
        csvContent = "Market Name,District,State,Modal Price,Min Price,Max Price,Trend,Last Updated\n";
        
        markets.forEach(market => {
          csvContent += `"${translateMarketName(market.name, language)}","${getDistrictTranslation(market.district, language)}","${getStateTranslation(market.state, language)}",${market.modalPrice},${market.minPrice},${market.maxPrice},"${market.trend}","${market.lastUpdated}"\n`;
        });
      } else {
        // Historical prices CSV
        const historyData = await getPriceHistory(selectedCropData?.name || "", undefined, 14);
        csvContent = "Date,Market,State,Modal Price\n";
        
        historyData?.forEach((record: any) => {
          csvContent += `"${record.recorded_date}","${translateMarketName(record.market, language)}","${getStateTranslation(record.state, language)}",${record.modal_price}\n`;
        });
      }
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedCropData?.name}_price_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: t("export.success"),
        description: t("export.csvSuccess"),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("export.failed"),
        description: t("export.csvFailed"),
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("export.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("export.subtitle")}
          </p>
        </div>

        {/* Configuration Card */}
        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle>{t("export.config")}</CardTitle>
            <CardDescription>
              {t("export.configDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Crop Selector */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {t("export.selectCrop")}
              </label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{crop.icon}</span>
                        <span>{getCropName(crop, language)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Report Type */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                {t("export.reportType")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={reportType === "current" ? "default" : "outline"}
                  onClick={() => setReportType("current")}
                  className="h-auto py-4 flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Table2 className="h-4 w-4" />
                    <span className="font-semibold">{t("export.currentPrices")}</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    {t("export.currentDesc")}
                  </span>
                </Button>
                <Button
                  variant={reportType === "historical" ? "default" : "outline"}
                  onClick={() => setReportType("historical")}
                  className="h-auto py-4 flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="font-semibold">{t("export.historical")}</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    {t("export.historicalDesc")}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="mb-6 animate-slide-up delay-100">
          <CardHeader>
            <CardTitle>{t("export.format")}</CardTitle>
            <CardDescription>
              {t("export.chooseFormat")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* PDF Export */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("export.pdfReport")}</h3>
                      <p className="text-xs text-muted-foreground">{t("export.pdfDesc")}</p>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {t("export.formattedTables")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {t("export.summaryStats")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {t("export.easyPrint")}
                    </li>
                  </ul>
                  <Button
                    onClick={exportToPDF}
                    disabled={isLoading || exporting}
                    className="w-full"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("export.generating")}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {t("export.downloadPdf")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* CSV Export */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Table2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t("export.csvExport")}</h3>
                      <p className="text-xs text-muted-foreground">{t("export.csvDesc")}</p>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {t("export.excelCompat")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {t("export.easyAnalysis")}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {t("export.customProcess")}
                    </li>
                  </ul>
                  <Button
                    onClick={exportToCSV}
                    disabled={isLoading || exporting}
                    variant="outline"
                    className="w-full"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("export.generating")}
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        {t("export.downloadCsv")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50 animate-slide-up delay-200">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
              💡
            </div>
            <div>
              <p className="font-medium text-foreground">Share with Fellow Farmers</p>
              <p className="text-sm text-muted-foreground">
                These reports can be shared via WhatsApp or printed for farmer meetings and discussions about best selling strategies.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
