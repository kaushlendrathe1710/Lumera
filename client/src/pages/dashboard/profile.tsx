import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerDashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Mail, Phone, Loader2, Save } from "lucide-react";
import type { SupportedCountry } from "@shared/schema";

export default function CustomerProfile() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    countryId: user?.countryId || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const { data: countries } = useQuery<SupportedCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = countries?.find(c => c.id === formData.countryId);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; countryId: string; phoneNumber: string }) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number format
    if (!/^\d+$/.test(formData.phoneNumber)) {
      toast({
        title: "Error",
        description: "Phone number must contain only digits",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number length
    if (selectedCountry && formData.phoneNumber.length !== selectedCountry.phoneLength) {
      toast({
        title: "Error",
        description: `Phone number must be ${selectedCountry.phoneLength} digits for ${selectedCountry.name}`,
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  return (
    <CustomerDashboardLayout title="Profile">
      <div className="max-w-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            Profile Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details. Your email cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  data-testid="input-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Country
                </Label>
                <Select
                  value={formData.countryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, countryId: value }))}
                  required
                >
                  <SelectTrigger id="country" data-testid="select-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        <span className="text-sm select-none flex gap-1 items-center">
                          <img src={`https://flagsapi.com/${country.isoCode}/flat/24.png`} alt={`${country.isoCode}`} />
                        {country.name} ({country.dialCode})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </Label>
                <div className="flex gap-2">
                  {selectedCountry && (
                    <div className="flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                      {selectedCountry.dialCode}
                    </div>
                  )}
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={selectedCountry ? `${'9'.repeat(selectedCountry.phoneLength)}` : "Phone number"}
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, "") }))
                    }
                    maxLength={selectedCountry?.phoneLength}
                    required
                    data-testid="input-phone"
                    className="flex-1"
                  />
                </div>
                {selectedCountry && (
                  <p className="text-xs text-muted-foreground">
                    Enter {selectedCountry.phoneLength} digits (without country code)
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="gap-2"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-medium text-foreground capitalize">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-medium text-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-AE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerDashboardLayout>
  );
}
