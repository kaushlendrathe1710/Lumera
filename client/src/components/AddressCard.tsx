import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogContent,
} from "@/components/ui/confirm-dialog";
import { MapPin, Pencil, Trash2, Star } from "lucide-react";
import type { Address } from "@shared/schema";

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
  showActions?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting = false,
  isSettingDefault = false,
  showActions = true,
  isSelected = false,
  onSelect,
}: AddressCardProps) {
  const label = address.label || "Other";

  return (
    <Card
      className={`relative transition-all ${
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:shadow-md"
      } ${onSelect ? "cursor-pointer" : ""}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary"
              >
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </Badge>
              {address.isDefault && (
                <Badge variant="default" className="ml-2">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Default
                </Badge>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <ConfirmDialog>
                <ConfirmDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    disabled={isDeleting}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </ConfirmDialogTrigger>
                <ConfirmDialogContent
                  title="Delete Address"
                  description="Are you sure you want to delete this address? This action cannot be undone."
                  confirmText="Delete"
                  onConfirm={onDelete}
                />
              </ConfirmDialog>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>
              {address.city}, {address.stateRegion}
            </p>
            <p>
              {address.countryName} - {address.postalCode}
            </p>
          </div>
        </div>

        {showActions && !address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="w-full mt-3"
            onClick={(e) => {
              e.stopPropagation();
              onSetDefault();
            }}
            disabled={isSettingDefault}
          >
            <Star className="h-3 w-3 mr-2" />
            {isSettingDefault ? "Setting..." : "Set as Default"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
