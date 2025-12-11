"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  ChevronLeft,
  Save,
  Globe,
  Shield,
  Mail,
  DollarSign,
  Bell,
  Database,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AdminSettingsPage = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Yalegn",
    siteDescription: "Ethiopian Freelancing Platform",
    maintenanceMode: false,
    registrationEnabled: true,

    // Payment Settings
    commissionRate: 5,
    minimumWithdrawal: 100,
    currency: "ETB",

    // Email Settings
    emailNotifications: true,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",

    // Security Settings
    twoFactorRequired: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,

    // Feature Flags
    chatEnabled: true,
    reviewsEnabled: true,
    walletEnabled: true,
    verificationRequired: true,
  });

  const handleSave = () => {
    // TODO: Implement with tRPC
    toast.success("Settings saved successfully!");
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-muted-foreground">
              Configure platform settings and features
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) =>
                  handleSettingChange("siteName", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) =>
                  handleSettingChange("siteDescription", e.target.value)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  handleSettingChange("maintenanceMode", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="registrationEnabled">User Registration</Label>
              <Switch
                id="registrationEnabled"
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("registrationEnabled", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                value={settings.commissionRate}
                onChange={(e) =>
                  handleSettingChange("commissionRate", Number(e.target.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="minimumWithdrawal">
                Minimum Withdrawal Amount
              </Label>
              <Input
                id="minimumWithdrawal"
                type="number"
                value={settings.minimumWithdrawal}
                onChange={(e) =>
                  handleSettingChange(
                    "minimumWithdrawal",
                    Number(e.target.value)
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) =>
                  handleSettingChange("currency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETB">Ethiopian Birr (ETB)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorRequired">Require 2FA for Admins</Label>
              <Switch
                id="twoFactorRequired"
                checked={settings.twoFactorRequired}
                onCheckedChange={(checked) =>
                  handleSettingChange("twoFactorRequired", checked)
                }
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange("sessionTimeout", Number(e.target.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) =>
                  handleSettingChange(
                    "maxLoginAttempts",
                    Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="verificationRequired">
                ID Verification Required
              </Label>
              <Switch
                id="verificationRequired"
                checked={settings.verificationRequired}
                onCheckedChange={(checked) =>
                  handleSettingChange("verificationRequired", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-500" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("emailNotifications", checked)
                }
              />
            </div>
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) =>
                  handleSettingChange("smtpHost", e.target.value)
                }
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) =>
                  handleSettingChange("smtpPort", Number(e.target.value))
                }
              />
            </div>
            <div>
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={settings.smtpUser}
                onChange={(e) =>
                  handleSettingChange("smtpUser", e.target.value)
                }
                placeholder="your-email@gmail.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Feature Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="chatEnabled">Chat System</Label>
                <Switch
                  id="chatEnabled"
                  checked={settings.chatEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange("chatEnabled", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reviewsEnabled">Reviews & Ratings</Label>
                <Switch
                  id="reviewsEnabled"
                  checked={settings.reviewsEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange("reviewsEnabled", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="walletEnabled">Wallet System</Label>
                <Switch
                  id="walletEnabled"
                  checked={settings.walletEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange("walletEnabled", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="verificationRequired">ID Verification</Label>
                <Switch
                  id="verificationRequired"
                  checked={settings.verificationRequired}
                  onCheckedChange={(checked) =>
                    handleSettingChange("verificationRequired", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-500" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-green-500">Online</p>
                <p className="text-sm text-muted-foreground">Database Status</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">v1.0.0</p>
                <p className="text-sm text-muted-foreground">
                  Platform Version
                </p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
