import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertAddressSchema, type InsertAddress, type Address } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { z } from "zod";

// Omit userId from the form schema
const formSchema = insertAddressSchema.omit({ userId: true });
type FormData = z.infer<typeof formSchema>;

interface Country {
  id: number;
  code: string;
  name: string;
  phone_code: string;
  currency: string;
  timezone: string;
}

interface LocationData {
  country: {
    id: number;
    code: string;
    name: string;
    phone_code: string;
  };
  states: Record<string, [number, string, Record<string, string>]>;
}

interface AddressFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<InsertAddress, "userId">) => Promise<void>;
  address?: Address;
  isLoading?: boolean;
}

export function AddressFormModal({
  open,
  onOpenChange,
  onSubmit,
  address,
  isLoading = false,
}: AddressFormModalProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addressLine1: address?.addressLine1 || "",
      addressLine2: address?.addressLine2 || "",
      city: address?.city || "",
      stateRegion: address?.stateRegion || "",
      postalCode: address?.postalCode || "",
      countryName: address?.countryName || "",
      label: address?.label || "home",
      isDefault: address?.isDefault || false,
    },
  });

  // Fetch countries with TanStack Query
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const res = await fetch("/api/locations/countries");
      if (!res.ok) throw new Error("Failed to fetch countries");
      return res.json();
    },
  });

  // Fetch location data (states & cities) for selected country - cached by country code
  const { data: locationData, isLoading: loadingLocations } = useQuery<LocationData>({
    queryKey: ["locations", selectedCountryCode],
    queryFn: async () => {
      const res = await fetch(`/api/locations/states/${selectedCountryCode}`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      return res.json();
    },
    enabled: !!selectedCountryCode, // Only fetch when country is selected
  });

  // Extract states from cached location data
  const states = useMemo(() => {
    if (!locationData?.states) return [];
    return Object.entries(locationData.states).map(([code, [_, name]]) => ({
      code,
      name,
    }));
  }, [locationData]);

  // Extract cities from cached location data based on selected state
  const cities = useMemo(() => {
    if (!locationData?.states || !selectedStateCode) return [];
    const stateData = locationData.states[selectedStateCode];
    if (!stateData || !stateData[2]) return [];
    return Object.entries(stateData[2]).map(([code, name]) => ({
      code,
      name,
    }));
  }, [locationData, selectedStateCode]);

  // Handle country change
  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    if (!country) return;

    setSelectedCountryCode(country.code);
    form.setValue("countryName", countryName);
    form.setValue("stateRegion", "");
    form.setValue("city", "");
    setSelectedStateCode(""); // Reset state selection
  };

  // Handle state change
  const handleStateChange = (stateName: string) => {
    const state = states.find(s => s.name === stateName);
    if (!state) return;

    setSelectedStateCode(state.code);
    form.setValue("stateRegion", stateName);
    form.setValue("city", "");
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      // Handle validation errors from server
      if (error.validation) {
        Object.entries(error.validation).forEach(([field, message]) => {
          form.setError(field as any, { message: message as string });
        });
      }
    }
  };

  // Prevent submit event from bubbling to parent forms (avoid triggering outer form validation)
  const onSubmitWrapper = (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // forward to react-hook-form handler
    form.handleSubmit(handleSubmit)(e as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            {address
              ? "Update your address details below"
              : "Fill in the details to add a new address"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmitWrapper} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Home, Office, College"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Street address, building name, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="countryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCountryChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stateRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Region *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleStateChange(value);
                      }}
                      defaultValue={field.value}
                      disabled={!selectedCountryCode || loadingLocations}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.code} value={state.name}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedStateCode || cities.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.code} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal/ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as default address</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This address will be used by default for orders
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {address ? "Update Address" : "Add Address"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
