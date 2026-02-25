import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Heart, X, Package, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import type { WishlistItemWithProduct } from "@shared/schema";
import { CustomerDashboardLayout } from "@/components/dashboard-layout";
import {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogContent,
} from "@/components/ui/confirm-dialog";

interface WishlistResponse {
  items: WishlistItemWithProduct[];
  total: number;
}

export default function Wishlist() {
  const { addItem } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useQuery<WishlistResponse>({
    queryKey: ["/api/wishlist", page, limit, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchQuery && { search: searchQuery }),
      });
      const res = await fetch(`/api/wishlist?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      return res.json();
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/wishlist/product-ids"],
      });
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from wishlist",
      });
    },
  });

  const handleAddToCart = async (
    product: WishlistItemWithProduct["product"],
  ) => {
    if (product.stock <= 0) {
      toast({
        variant: "destructive",
        title: "Out of stock",
        description: "This product is currently out of stock",
      });
      return;
    }

    addItem(product, 1);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  return (
    <CustomerDashboardLayout title="Wishlist">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
              My Wishlist
            </h2>
            <p className="text-muted-foreground">
              {data?.total || 0} {data?.total === 1 ? "item" : "items"}
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-full aspect-square rounded-lg mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!data?.items || data.items.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-8 mb-4">
              <Heart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery
                ? "No products match your search. Try a different search term."
                : "Start adding products you love to your wishlist!"}
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && data?.items && data.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.items.map((item) => {
                const product = item.product;
                const hasDiscount =
                  product.discountPercent && product.discountPercent > 0;
                const originalPrice = parseFloat(product.price);
                const discountedPrice = hasDiscount
                  ? originalPrice * (1 - product.discountPercent! / 100)
                  : originalPrice;

                return (
                  <Card
                    key={item.id}
                    className="group relative overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      {/* Product Image */}
                      <Link href={`/products/${product.id}`}>
                        <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-muted cursor-pointer">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          {hasDiscount && (
                            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                              -{product.discountPercent}%
                            </Badge>
                          )}
                          {product.stock <= 0 && (
                            <Badge className="absolute bottom-2 left-2 bg-muted text-muted-foreground">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold line-clamp-2 hover:text-primary cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>

                        {product.category && (
                          <Badge variant="secondary" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}

                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">
                            AED {discountedPrice.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-muted-foreground line-through">
                              AED {originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          className="w-full"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                        {/* Remove Button */}
                        <ConfirmDialog>
                          <ConfirmDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Wishlist
                            </Button>
                          </ConfirmDialogTrigger>
                          <ConfirmDialogContent
                            title="Remove from Wishlist"
                            description="Are you sure you want to remove this item from your wishlist?"
                            confirmText="Remove"
                            onConfirm={() => removeFromWishlistMutation.mutate(product.id)}
                          />
                        </ConfirmDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="icon"
                        onClick={() => setPage(p)}
                        className="h-9 w-9"
                      >
                        {p}
                      </Button>
                    ),
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
