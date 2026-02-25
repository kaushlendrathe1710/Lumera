import { Link, useLocation } from "wouter";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft, ShoppingCart, Package, Trash2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithCategory } from "@shared/schema";
import {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogContent,
} from "@/components/ui/confirm-dialog";

export default function WishlistPage() {
  const [, navigate] = useLocation();
  const { wishlistProductIds, toggleWishlist, isLoading: wishlistLoading } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  // Fetch product details for every wishlisted ID
  const productQueries = useQueries({
    queries: wishlistProductIds.map((id) => ({
      queryKey: ["/api/products", id],
      queryFn: async (): Promise<ProductWithCategory> => {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    })),
  });

  const isLoading = productQueries.some((q) => q.isLoading);
  const products = productQueries
    .map((q) => q.data)
    .filter(Boolean) as ProductWithCategory[];

  const handleAddToCart = (product: ProductWithCategory) => {
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

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="gap-2 mb-8"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            } else {
              navigate("/products");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
          My Wishlist
        </h1>

        {/* Loading skeletons */}
        {isLoading && wishlistProductIds.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProductIds.map((id) => (
              <Card key={id}>
                <CardContent className="p-4">
                  <Skeleton className="w-full aspect-square rounded-lg mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-9 w-full mb-2" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && wishlistProductIds.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Save products you love and come back to them later
            </p>
            <Link href="/products">
              <Button size="lg" className="gap-2">
                <ShoppingCart className="h-5 w-5" /> Browse Products
              </Button>
            </Link>
          </div>
        )}

        {/* Products grid */}
        {!isLoading && products.length > 0 && (
          <>
            <p className="text-muted-foreground mb-6">
              {products.length} {products.length === 1 ? "item" : "items"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const hasDiscount =
                  product.discountPercent && product.discountPercent > 0;
                const originalPrice = parseFloat(product.price);
                const discountedPrice = hasDiscount
                  ? originalPrice * (1 - product.discountPercent! / 100)
                  : originalPrice;

                return (
                  <Card
                    key={product.id}
                    className="group relative overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      {/* Image */}
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

                      {/* Info */}
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

                        {product.weight && (
                          <Badge variant="outline" className="text-xs ml-1">
                            {product.weight}
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

                        <Button
                          className="w-full"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>

                        <ConfirmDialog>
                          <ConfirmDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full"
                              disabled={wishlistLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </ConfirmDialogTrigger>
                          <ConfirmDialogContent
                            title="Remove from Wishlist"
                            description="Are you sure you want to remove this item from your wishlist?"
                            confirmText="Remove"
                            onConfirm={() => toggleWishlist(product.id)}
                          />
                        </ConfirmDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
