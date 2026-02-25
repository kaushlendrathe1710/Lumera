import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SupportedCountry } from "@shared/schema";
import { AdminDashboardLayout } from "@/components/dashboard-layout";

const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }
  return response.json();
};

export default function Countries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<SupportedCountry | null>(null);
  const [countryToDelete, setCountryToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    isoCode: "",
    dialCode: "",
    phoneLength: "",
  });

  const { data: countries, isLoading } = useQuery<SupportedCountry[]>({
    queryKey: ["/api/countries"],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("/api/admin/countries", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          phoneLength: parseInt(data.phoneLength),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Country created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      apiRequest(`/api/admin/countries/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          phoneLength: parseInt(data.phoneLength),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Country updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/countries/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/countries"] });
      setIsDeleteDialogOpen(false);
      setCountryToDelete(null);
      toast({
        title: "Success",
        description: "Country deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      isoCode: "",
      dialCode: "",
      phoneLength: "",
    });
    setEditingCountry(null);
  };

  const handleOpenDialog = (country?: SupportedCountry) => {
    if (country) {
      setEditingCountry(country);
      setFormData({
        name: country.name,
        isoCode: country.isoCode,
        dialCode: country.dialCode,
        phoneLength: country.phoneLength.toString(),
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.isoCode || !formData.dialCode || !formData.phoneLength) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.isoCode.length !== 2) {
      toast({
        title: "Error",
        description: "ISO code must be exactly 2 characters",
        variant: "destructive",
      });
      return;
    }

    if (!formData.dialCode.startsWith("+")) {
      toast({
        title: "Error",
        description: "Dial code must start with +",
        variant: "destructive",
      });
      return;
    }

    const phoneLength = parseInt(formData.phoneLength);
    if (isNaN(phoneLength) || phoneLength <= 0) {
      toast({
        title: "Error",
        description: "Phone length must be a positive number",
        variant: "destructive",
      });
      return;
    }

    if (editingCountry) {
      updateMutation.mutate({ id: editingCountry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (countryId: string) => {
    setCountryToDelete(countryId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (countryToDelete) {
      deleteMutation.mutate(countryToDelete);
    }
  };

  const filteredCountries = countries?.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.isoCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

    return (
    <AdminDashboardLayout title="Countries">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Supported Countries</h2>
            <p className="text-muted-foreground">
              Manage countries for phone number validation
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country Name</TableHead>
                <TableHead>ISO Code</TableHead>
                <TableHead>Dial Code</TableHead>
                <TableHead>Phone Length</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredCountries && filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{country.isoCode}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{country.dialCode}</span>
                    </TableCell>
                    <TableCell>{country.phoneLength} digits</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(country)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(country.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {searchQuery ? "No countries found" : "No countries added yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCountry ? "Edit Country" : "Add Country"}
              </DialogTitle>
              <DialogDescription>
                {editingCountry
                  ? "Update the country details below"
                  : "Add a new supported country for phone validation"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Country Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., United Arab Emirates"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isoCode">ISO Code (2 letters) *</Label>
                  <Input
                    id="isoCode"
                    placeholder="e.g., AE"
                    maxLength={2}
                    value={formData.isoCode}
                    onChange={(e) =>
                      setFormData({ ...formData, isoCode: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialCode">Dial Code *</Label>
                  <Input
                    id="dialCode"
                    placeholder="e.g., +971"
                    value={formData.dialCode}
                    onChange={(e) =>
                      setFormData({ ...formData, dialCode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneLength">Phone Number Length *</Label>
                  <Input
                    id="phoneLength"
                    type="number"
                    min="1"
                    placeholder="e.g., 9"
                    value={formData.phoneLength}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneLength: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCountry ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the country. Users with this country will need to update
                their profile before they can make changes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminDashboardLayout>
  );
}
