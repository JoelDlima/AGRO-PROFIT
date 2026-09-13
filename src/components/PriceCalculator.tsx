import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRightLeft } from "lucide-react";
import { crops } from "@/data/mockData";

interface PriceCalculatorProps {
  commodity?: string;
  marketPrice?: number;
}

export function PriceCalculator({ commodity, marketPrice }: PriceCalculatorProps) {
  const [selectedCrop, setSelectedCrop] = useState(commodity || "");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("quintal");
  const [pricePerUnit, setPricePerUnit] = useState(marketPrice?.toString() || "");
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);

  const selectedCropData = crops.find((c) => c.name.toLowerCase() === selectedCrop.toLowerCase());
  const defaultUnit = selectedCropData?.unit || "quintal";

  const units = [
    { value: "kg", label: "Kilogram (kg)", multiplier: 1 },
    { value: "quintal", label: "Quintal (100 kg)", multiplier: 100 },
    { value: "ton", label: "Ton (1000 kg)", multiplier: 1000 },
  ];

  const handleCalculate = () => {
    const qty = parseFloat(quantity);
    const price = parseFloat(pricePerUnit);
    
    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      setCalculatedTotal(null);
      return;
    }

    const selectedUnit = units.find(u => u.value === unit);
    const qtyInKg = qty * (selectedUnit?.multiplier || 1);
    
    // Price is typically per kg in the API
    const total = qtyInKg * price;
    setCalculatedTotal(total);
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
          Calculate total price for buying or selling crops
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Crop Selection */}
        <div className="space-y-2">
          <Label htmlFor="crop-select">Select Crop</Label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
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
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        {/* Unit Selection */}
        <div className="space-y-2">
          <Label htmlFor="unit-select">Unit</Label>
          <Select value={unit} onValueChange={setUnit}>
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
            onChange={(e) => setPricePerUnit(e.target.value)}
            min="0"
            step="0.01"
          />
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
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(calculatedTotal)}
                </p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
              <p className="text-xs text-muted-foreground">
                {quantity} {unit} × ₹{pricePerUnit}/kg = {formatCurrency(calculatedTotal)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
