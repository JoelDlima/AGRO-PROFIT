import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRightLeft } from "lucide-react";
import { crops } from "@/data/mockData";
import { calculatePrice, marketPricePerKg } from "@/lib/priceMath";

interface PriceCalculatorProps {
  commodity?: string;
  marketPrice?: number;
}

export function PriceCalculator({ commodity, marketPrice }: PriceCalculatorProps) {
  const [cropOverride, setCropOverride] = useState<{ commodity?: string; crop: string } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("quintal");
  const [priceOverride, setPriceOverride] = useState<{ commodity?: string; crop: string; value: string } | null>(null);
  const [result, setResult] = useState<{ total: number; inputs: string } | null>(null);
  const selectedCrop = cropOverride && cropOverride.commodity === commodity ? cropOverride.crop : commodity || "";
  const marketPriceKg = marketPricePerKg(commodity, selectedCrop, marketPrice);
  const pricePerUnit = priceOverride && priceOverride.commodity === commodity && priceOverride.crop === selectedCrop
    ? priceOverride.value
    : marketPriceKg?.toString() || "";
  const inputs = JSON.stringify([commodity, selectedCrop, quantity, unit, pricePerUnit]);
  const calculatedTotal = result?.inputs === inputs ? result.total : null;

  const units = [
    { value: "kg", label: "Kilogram (kg)" },
    { value: "quintal", label: "Quintal (100 kg)" },
    { value: "ton", label: "Ton (1000 kg)" },
  ];

  const handleCalculate = () => {
    const total = calculatePrice(quantity, pricePerUnit, unit);
    setResult(total === null ? null : { total, inputs });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg">Price Calculator</CardTitle>
        </div>
        <CardDescription>
          Estimate total price for buying or selling crops. Actual proceeds may differ due to fees, quality and market changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Crop Selection */}
        <div className="space-y-2">
          <Label htmlFor="crop-select">Select Crop</Label>
          <Select value={selectedCrop} onValueChange={(crop) => {
            setCropOverride({ commodity, crop });
            setPriceOverride(null);
            setResult(null);
          }}>
            <SelectTrigger id="crop-select">
              <SelectValue placeholder="Choose a crop" />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop.id} value={crop.name}>
                  {crop.icon} {crop.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); setResult(null); }}
            min="0"
            step="0.01"
          />
        </div>

        {/* Unit Selection */}
        <div className="space-y-2">
          <Label htmlFor="unit-select">Unit</Label>
          <Select value={unit} onValueChange={(value) => { setUnit(value); setResult(null); }}>
            <SelectTrigger id="unit-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Per Unit */}
        <div className="space-y-2">
          <Label htmlFor="price">Price per kg (₹)</Label>
          <Input
            id="price"
            type="number"
            placeholder="Enter price per kg"
            value={pricePerUnit}
            onChange={(e) => {
              setPriceOverride({ commodity, crop: selectedCrop, value: e.target.value });
              setResult(null);
            }}
            min="0"
            step="0.01"
          />
          <p className="text-xs text-muted-foreground">
            {marketPriceKg !== null && !(priceOverride && priceOverride.commodity === commodity && priceOverride.crop === selectedCrop)
              ? "Market price converted from ₹/quintal to ₹/kg; you can edit it."
              : "Enter a price per kg for this crop."}
          </p>
        </div>

        {/* Calculate Button */}
        <Button onClick={handleCalculate} className="w-full" size="lg">
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Total
        </Button>

        {/* Result Display */}
        {calculatedTotal !== null && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(calculatedTotal)}
                </p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground">
                {quantity} {unit} × {unit === "kg" ? 1 : unit === "quintal" ? 100 : 1000} kg/{unit} × ₹{pricePerUnit}/kg = {formatCurrency(calculatedTotal)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
