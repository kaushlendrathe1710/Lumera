import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Address, InsertAddress } from "@shared/schema";

export function useAddresses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all addresses for the authenticated user
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["/api/address"],
  });

  // Create address mutation
  const createAddressMutation = useMutation({
    mutationFn: async (data: Omit<InsertAddress, "userId">) => {
      const res = await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.errors) {
          // Validation errors
          throw { validation: error.errors };
        }
        throw new Error(error.error || "Failed to create address");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/address"] });
      toast({
        title: "Address added",
        description: "Your address has been added successfully",
      });
    },
    onError: (error: any) => {
      if (error.validation) {
        // Handle validation errors in form
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add address",
      });
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAddress> }) => {
      const res = await fetch(`/api/address/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.errors) {
          throw { validation: error.errors };
        }
        throw new Error(error.error || "Failed to update address");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/address"] });
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully",
      });
    },
    onError: (error: any) => {
      if (error.validation) {
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update address",
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/address/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete address");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/address"] });
      toast({
        title: "Address deleted",
        description: "Your address has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete address",
      });
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/address/default/${id}`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to set default address");
      }

      return res.json();
    },
    onSuccess: (updatedAddresses) => {
      queryClient.setQueryData(["/api/address"], updatedAddresses);
      toast({
        title: "Default address updated",
        description: "Your default address has been changed",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to set default address",
      });
    },
  });

  const defaultAddress = addresses.find(addr => addr.isDefault);

  return {
    addresses,
    defaultAddress,
    isLoading,
    createAddress: createAddressMutation.mutateAsync,
    updateAddress: updateAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
    setDefaultAddress: setDefaultMutation.mutateAsync,
    isCreating: createAddressMutation.isPending,
    isUpdating: updateAddressMutation.isPending,
    isDeleting: deleteAddressMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
