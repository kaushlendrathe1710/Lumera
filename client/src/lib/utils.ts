import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "secondary";
    case "processing": return "default";
    case "shipped": return "default";
    case "delivered": return "default";
    case "cancelled": return "destructive";
    case "returning": return "destructive";
    case "returned": return "secondary";
    case "refunded": return "default";
    default: return "secondary";
  }
};
