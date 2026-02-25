import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, ArrowLeft, Minus, Plus, Truck, Shield, Package, Star, Trash2, User as UserIcon, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ProductWithCategory as Product, ReviewWithUser } from "@shared/schema";
import { Nav } from "@/components/nav";
import ImageSwiper from "@/components/ui/image-swiper";

function StarRating({ rating, onRate, interactive = false, size = "md" }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          data-testid={`button-star-${star}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= (hovered || rating)
                ? "fill-primary text-primary"
                : "text-muted-foreground/30"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id;
  const { addItem, updateQuantity: updateCartQuantity, itemCount, items: cartItems } = useCart();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const cartItem = cartItems.find(item => item.product.id === productId);
  const [quantity, setQuantity] = useState(cartItem ? cartItem.quantity : 1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: reviewData, isLoading: reviewsLoading } = useQuery<{
    reviews: ReviewWithUser[];
    avgRating: number;
    reviewCount: number;
  }>({
    queryKey: ["/api/products", productId, "reviews"],
    enabled: !!productId,
  });

  const { data: purchaseStatus } = useQuery<{ purchased: boolean }>({
    queryKey: ["/api/products", productId, "purchased"],
    enabled: !!productId && isAuthenticated,
  });

  const { data: relatedProducts, isLoading: relatedLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", productId, "related"],
    enabled: !!productId,
  });

  useEffect(() => {
    setSelectedImage(0);
  }, [productId]);

  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem?.quantity]);

  const safeSelectedImage = product?.images && product.images.length > 0
    ? Math.min(selectedImage, product.images.length - 1)
    : 0;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity}x ${product.name} added to your cart`,
      });
    }
  };

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/products/${productId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/ratings/all"] });
      setReviewRating(0);
      setReviewComment("");
      toast({ title: "Review submitted", description: "Our team will check and update your review in 12-24hrs if it matches our guidelines." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message.replace(/^\d+:\s*/, "").replace(/^"(.*)"$/, "$1"), variant: "destructive" });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products/ratings/all"] });
      toast({ title: "Review deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const userHasReviewed = reviewData?.reviews.some(r => r.userId === user?.id);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Product not found</h1>
          <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <Nav />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="gap-2 mb-8"
          data-testid="link-back-products"
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

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : product ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <ImageSwiper
                images={product.images && product.images.length > 0 ? product.images : product.imageUrl ? [product.imageUrl] : []}
                selectedIndex={safeSelectedImage}
                onIndexChange={(idx) => setSelectedImage(idx)}
                showThumbnails={!!(product.images && product.images.length > 1)}
                badgeDiscount={product.discountPercent}
                isFeatured={product.isFeatured}
                alt={product.name}
              />

              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{product.category?.name || "Uncategorized"}</Badge>
                    {product.sku && (
                      <Badge variant="outline">SKU: {product.sku}</Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                    {product.name}
                  </h1>
                  {reviewData && reviewData.reviewCount > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={Math.round(reviewData.avgRating)} size="sm" />
                      <span className="text-sm text-muted-foreground">
                        {reviewData.avgRating.toFixed(1)} ({reviewData.reviewCount} {reviewData.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}
                  {product.origin && (
                    <p className="text-muted-foreground">Origin: {product.origin}</p>
                  )}
                </div>

                <div className="flex items-baseline gap-4 flex-wrap">
                  {product.discountPercent && product.discountPercent > 0 ? (
                    <>
                      <span className="text-4xl font-bold text-primary">
                        {(parseFloat(product.price) * (1 - product.discountPercent / 100)).toFixed(2)} AED
                      </span>
                      <span className="text-xl text-muted-foreground line-through">
                        {parseFloat(product.price).toFixed(2)} AED
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-primary">
                        {parseFloat(product.price).toFixed(2)} AED
                      </span>
                      {product.comparePrice && (
                        <span className="text-xl text-muted-foreground line-through">
                          {parseFloat(product.comparePrice).toFixed(2)} AED
                        </span>
                      )}
                    </>
                  )}
                  {product.weight && (
                    <Badge variant="outline">{product.weight}</Badge>
                  )}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Quantity:</span>
                    <div className="flex items-center gap-2">
                      {!cartItems.some(item => item.product.id === product.id) ? (
                      <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newQty = Math.max(1, quantity - 1);
                        setQuantity(newQty);
                        if (cartItem) updateCartQuantity(product.id, newQty);
                      }}
                      disabled={quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-foreground" data-testid="text-quantity">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newQty = Math.min(product.stock, quantity + 1);
                        setQuantity(newQty);
                        if (cartItem) updateCartQuantity(product.id, newQty);
                      }}
                      disabled={quantity >= product.stock}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="h-4 w-4" />
                        </Button>
                        </>
                        ) : (null)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                  {cartItems.some(item => item.product.id === product.id) ? (
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    variant="outline"
                    onClick={()=>navigate("/cart")}
                    data-testid="button-go-to-cart"
                    >
                    Goto Cart
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                )}
{/* Wishlist Button */}
                <Button
                  size="lg"
                  variant={isInWishlist(product.id) ? "default" : "outline"}
                  className="w-full gap-2"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                  {isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                </Button>


                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Free Delivery</p>
                        <p className="text-sm text-muted-foreground">On orders over 200 AED</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Quality Guaranteed</p>
                        <p className="text-sm text-muted-foreground">100% authentic</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Secure Packaging</p>
                        <p className="text-sm text-muted-foreground">Safe delivery guaranteed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {relatedProducts && relatedProducts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Related Products</h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {relatedLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="w-56 flex-shrink-0">
                        <Skeleton className="aspect-square" />
                        <CardContent className="p-4">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    relatedProducts.map((rp) => (
                      <Card key={rp.id} className="w-56 flex-shrink-0 overflow-hidden group hover-elevate">
                        <Link href={`/products/${rp.id}`}>
                          <div className="aspect-square overflow-hidden bg-muted">
                            {rp.imageUrl ? (
                              <img src={rp.imageUrl} alt={rp.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </Link>
                        <CardContent className="p-3">
                          <Link href={`/products/${rp.id}`}>
                            <h3 className="font-medium text-foreground mb-1 hover:text-primary transition-colors truncate">{rp.name}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{rp.category?.name || "Uncategorized"}</p>
                          <div className="mt-2">
                            <span className="text-sm font-bold text-primary">{parseFloat(rp.price).toFixed(2)} AED</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-12 max-w-3xl">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6" data-testid="text-reviews-heading">
                Customer Reviews
              </h2>

              {isAuthenticated && !userHasReviewed && purchaseStatus?.purchased && (
                <Card className="mb-8">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-foreground">Write a Review</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Rating</label>
                      <StarRating rating={reviewRating} onRate={setReviewRating} interactive size="lg" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Review (optional)</label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        className="resize-none"
                        rows={3}
                        data-testid="input-review-comment"
                      />
                    </div>
                    <Button
                      onClick={() => createReviewMutation.mutate()}
                      disabled={reviewRating === 0 || createReviewMutation.isPending}
                      data-testid="button-submit-review"
                    >
                      {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Our team will check and update your review in 12-24hrs if it matches our guidelines.
                    </p>
                  </CardContent>
                </Card>
              )}

              {isAuthenticated && !userHasReviewed && purchaseStatus && !purchaseStatus.purchased && (
                <Card className="mb-8">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground" data-testid="text-purchase-required">
                      You can only review products you have purchased.
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isAuthenticated && (
                <Card className="mb-8">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-3">Sign in to leave a review</p>
                    <Link href="/login">
                      <Button variant="outline" data-testid="link-sign-in-review">Sign In</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {reviewsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : reviewData && reviewData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviewData.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate" data-testid={`text-reviewer-name-${review.id}`}>
                                {review.user.name || "Customer"}
                              </p>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {(review.userId === user?.id || user?.role === "admin" || user?.role === "superadmin") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this review?")) {
                                  deleteReviewMutation.mutate(review.id);
                                }
                              }}
                              disabled={deleteReviewMutation.isPending}
                              data-testid={`button-delete-review-${review.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground text-sm mt-3 pl-12" data-testid={`text-review-comment-${review.id}`}>
                            {review.comment}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground" data-testid="text-no-reviews">No reviews yet.</p>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
