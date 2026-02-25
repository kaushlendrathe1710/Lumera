import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CreditCard, Lock, Truck, Package } from "lucide-react";
import { useCart, getDiscountedPrice } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Nav } from "@/components/nav";
import { CheckoutAddressSelector } from "@/components/CheckoutAddressSelector";
import type { Address } from "@shared/schema";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");

  const shippingCost = total >= 200 ? 0 : 25;
  const grandTotal = total + shippingCost;

  // COD Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddress) {
        throw new Error("Please select a delivery address");
      }
      const res = await apiRequest("POST", "/api/orders", {
        addressId: selectedAddress.id,
        shippingName: user?.name || "",
        shippingPhone: user?.phoneNumber || "",
        shippingAddress: `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 || ''}`.trim(),
        shippingCity: selectedAddress.city,
        shippingEmirate: selectedAddress.stateRegion,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalAmount: grandTotal.toFixed(2),
      });
      return res.json();
    },
    onSuccess: (data) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my-orders"] });
      toast({
        title: "Order Placed!",
        description: `Your order #${data.orderNumber} has been placed successfully`,
      });
      setLocation(`/order-confirmation/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive",
      });
    },
  });

  // Stripe Payment Mutation
  const stripeCheckoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAddress) {
        throw new Error("Please select a delivery address");
      }
      const res = await apiRequest("POST", "/api/stripe/create-checkout-session", {
        addressId: selectedAddress.id,
        shippingName: user?.name || "",
        shippingPhone: user?.phoneNumber || "",
        shippingAddress: `${selectedAddress.addressLine1}, ${selectedAddress.addressLine2 || ''}`.trim(),
        shippingCity: selectedAddress.city,
        shippingEmirate: selectedAddress.stateRegion,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalAmount: grandTotal.toFixed(2),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment",
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    if (!selectedAddress) {
      toast({
        title: "Address Required",
        description: "Please select a delivery address",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (paymentMethod === "card") {
      stripeCheckoutMutation.mutate();
    } else {
      createOrderMutation.mutate();
    }
  };

  const isSubmitting = createOrderMutation.isPending || stripeCheckoutMutation.isPending;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some products to proceed with checkout</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <Link href="/cart">
          <Button variant="ghost" className="gap-2 mb-8" data-testid="link-back-cart">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <CheckoutAddressSelector
                    selectedAddressId={selectedAddress?.id}
                    onAddressSelect={setSelectedAddress}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as "card" | "cod")}
                    className="space-y-3"
                  >
                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="card" id="card" data-testid="radio-card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Pay with Card</p>
                            <p className="text-sm text-muted-foreground">
                              Secure payment via Stripe
                            </p>
                          </div>
                        </div>
                      </Label>
                      <Lock className="h-4 w-4 text-green-600" />
                    </div>

                    <div
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value="cod" id="cod" data-testid="radio-cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">
                              Pay when you receive your order
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {(getDiscountedPrice(item.product) * item.quantity).toFixed(2)} AED
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Subtotal</span>
                      <span>{total.toFixed(2)} AED</span>
                    </div>
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `${shippingCost.toFixed(2)} AED`
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">{grandTotal.toFixed(2)} AED</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || !selectedAddress}
                    data-testid="button-place-order"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : !selectedAddress ? (
                      "Select a delivery address"
                    ) : paymentMethod === "card" ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay {grandTotal.toFixed(2)} AED
                      </>
                    ) : (
                      "Place Order (COD)"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
