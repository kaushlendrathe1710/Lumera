import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const WISHLIST_STORAGE_KEY = "lumera-wishlist";

interface WishlistContextType {
  wishlistProductIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // ── Local (guest) state ──────────────────────────────────────────────────
  const [localIds, setLocalIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(localIds));
    }
  }, [localIds, isAuthenticated]);

  // ── API state (authenticated) ────────────────────────────────────────────
  const { data: apiIds = [] } = useQuery<string[]>({
    queryKey: ["/api/wishlist/product-ids"],
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/product-ids"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist/product-ids"] });
    },
  });

  // ── Sync local → DB on login ─────────────────────────────────────────────
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    const wasAuthenticated = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (!wasAuthenticated && isAuthenticated && localIds.length > 0) {
      const idsToSync = [...localIds];
      Promise.allSettled(idsToSync.map((id) => addMutation.mutateAsync(id))).then(
        () => {
          setLocalIds([]);
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
          queryClient.invalidateQueries({
            queryKey: ["/api/wishlist/product-ids"],
          });
          toast({
            title: "Wishlist synced",
            description: "Your saved items have been added to your wishlist.",
          });
        }
      );
    }
  // Run only when isAuthenticated changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Derived values ───────────────────────────────────────────────────────
  const wishlistProductIds = isAuthenticated ? apiIds : localIds;

  const isInWishlist = (productId: string) =>
    wishlistProductIds.includes(productId);

  const toggleWishlist = async (productId: string) => {
    const inList = isInWishlist(productId);

    if (!isAuthenticated) {
      if (inList) {
        setLocalIds((prev) => prev.filter((id) => id !== productId));
        toast({
          title: "Removed from wishlist",
          description: "Product has been removed from your wishlist",
        });
      } else {
        setLocalIds((prev) => [...prev, productId]);
        toast({
          title: "Added to wishlist",
          description: "Product has been saved to your wishlist",
        });
      }
      return;
    }

    try {
      if (inList) {
        await removeMutation.mutateAsync(productId);
        toast({
          title: "Removed from wishlist",
          description: "Product has been removed from your wishlist",
        });
      } else {
        await addMutation.mutateAsync(productId);
        toast({
          title: "Added to wishlist",
          description: "Product has been added to your wishlist",
        });
      }
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to update wishlist",
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistProductIds,
        isInWishlist,
        toggleWishlist,
        isLoading: addMutation.isPending || removeMutation.isPending,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlistContext must be used within WishlistProvider");
  return ctx;
}
