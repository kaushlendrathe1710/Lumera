import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAddresses } from "@/hooks/use-address";
import { AddressCard } from "@/components/AddressCard";
import { AddressFormModal } from "@/components/AddressFormModal";
import type { Address } from "@shared/schema";

interface CheckoutAddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address) => void;
}

export function CheckoutAddressSelector({
  selectedAddressId,
  onAddressSelect,
}: CheckoutAddressSelectorProps) {
  const {
    addresses,
    isLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isCreating,
    isUpdating,
  } = useAddresses();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setShowModal(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowModal(true);
  };

  const handleSubmit = async (data: any) => {
    let newAddress: Address;
    if (editingAddress) {
      newAddress = await updateAddress({ id: editingAddress.id, data });
    } else {
      newAddress = await createAddress(data);
      // Auto-select newly created address
      onAddressSelect(newAddress);
    }
  };

  // Auto-select default address on mount if no address is selected
  useState(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      onAddressSelect(defaultAddr);
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No saved addresses. Add one to continue.
          </p>
          <Button type="button" onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Delivery Address
          </Button>
        </div>

        <AddressFormModal
          open={showModal}
          onOpenChange={setShowModal}
          onSubmit={handleSubmit}
          address={editingAddress}
          isLoading={isCreating || isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Select Delivery Address</Label>
        <Button type="button" variant="outline" size="sm" onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <RadioGroup
        value={selectedAddressId}
        onValueChange={(id) => {
          const address = addresses.find(a => a.id === id);
          if (address) onAddressSelect(address);
        }}
        className="space-y-3"
      >
        {addresses.map((address) => (
          <div key={address.id} className="relative">
            <RadioGroupItem
              value={address.id}
              id={address.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={address.id}
              className="cursor-pointer block"
            >
              <AddressCard
                address={address}
                onEdit={() => handleEdit(address)}
                onDelete={() => deleteAddress(address.id)}
                onSetDefault={() => setDefaultAddress(address.id)}
                isSelected={selectedAddressId === address.id}
                onSelect={() => onAddressSelect(address)}
              />
            </Label>
          </div>
        ))}
      </RadioGroup>

      <AddressFormModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={handleSubmit}
        address={editingAddress}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
