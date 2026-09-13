import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  User, 
  MapPin, 
  Phone, 
  LogOut, 
  Settings, 
  Sprout,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { crops } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTheme } from "@/hooks/useTheme";

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile, addCrop, removeCrop } = useUserProfile();
  const { t, language } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [addCropOpen, setAddCropOpen] = useState(false);
  const [newCropName, setNewCropName] = useState("");

  // Get translated crop name
  const getCropName = (crop: any) => {
    if (language === 'hi') return crop.nameHi || crop.name;
    if (language === 'mr') return crop.nameMr || crop.name;
    if (language === 'kok') return crop.nameKok || crop.name;
    return crop.name;
  };
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const isLoading = authLoading || profileLoading;

  // Get user's crops
  const userCropNames = profile?.crops || [];
  const userCrops = userCropNames.map((cropName) => {
    const crop = crops.find((c) => c.name.toLowerCase() === cropName.toLowerCase());
    return { cropName, crop };
  });

  const availableCrops = crops.filter(
    (c) => !userCropNames.some((name) => name.toLowerCase() === c.name.toLowerCase())
  );

  const handleStartEdit = () => {
    setEditName(profile?.full_name || "");
    setEditPhone(profile?.phone || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const { error } = await updateProfile({
      full_name: editName,
      phone: editPhone,
    });

    if (!error) {
      toast({ title: t("profile.updated") });
      setIsEditing(false);
    } else {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const handleAddCrop = async () => {
    if (!newCropName) return;
    
    await addCrop(newCropName);
    setNewCropName("");
    setAddCropOpen(false);
  };

  const handleRemoveCrop = async (cropName: string) => {
    await removeCrop(cropName);
  };

  const handleStateChange = async (state: string) => {
    await updateProfile({ state });
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: t("profile.loggedOut") });
    navigate("/");
  };

  const states = [
    "Maharashtra",
    "Punjab",
    "Uttar Pradesh",
    "Madhya Pradesh",
    "Karnataka",
    "Gujarat",
    "Rajasthan",
    "Haryana",
    "Tamil Nadu",
    "Andhra Pradesh",
    "Telangana",
    "West Bengal",
    "Bihar",
    "Odisha",
    "Kerala",
    "Goa",
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("profile.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("profile.subtitle")}
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 animate-slide-up">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground">
                      {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="h-4 w-4" />
                      {profile?.phone || 'No phone added'}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleStartEdit}>
                    <Edit className="h-4 w-4 mr-1" />
                    {t("profile.edit")}
                  </Button>
                </div>

                {isEditing ? (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>{t("profile.fullName")}</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("profile.phone")}</Label>
                        <Input
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit}>
                        {t("profile.save")}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        {t("profile.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border">
                    <MapPin className="h-4 w-4" />
                    {profile?.state || 'No state selected'}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* My Crops */}
        <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              {t("profile.myCrops")}
            </CardTitle>
            <Dialog open={addCropOpen} onOpenChange={setAddCropOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t("profile.addCrop")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("profile.addNewCrop")}</DialogTitle>
                  <DialogDescription>
                    {t("profile.selectCrop")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("profile.crop")}</Label>
                    <Select
                      value={newCropName}
                      onValueChange={setNewCropName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.selectPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCrops.map((crop) => (
                          <SelectItem key={crop.id} value={crop.name}>
                            <span className="flex items-center gap-2">
                              <span>{crop.icon}</span>
                              <span>{crop.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddCropOpen(false)}>
                    {t("profile.cancel")}
                  </Button>
                  <Button onClick={handleAddCrop}>{t("profile.addCrop")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {userCrops.map((item) => (
                  <div
                    key={item.cropName}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.crop?.icon || '🌱'}</span>
                      <div>
                        <p className="font-medium text-foreground">{item.cropName}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCrop(item.cropName)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {userCrops.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sprout className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t("profile.noCrops")}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t("profile.settings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{t("profile.region")}</p>
                  <p className="text-sm text-muted-foreground">{t("profile.selectState")}</p>
                </div>
              </div>
              <Select 
                value={profile?.state || ""} 
                onValueChange={handleStateChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground animate-slide-up"
          style={{ animationDelay: "0.3s" }}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("profile.logout")}
        </Button>
      </div>
    </AppLayout>
  );
}