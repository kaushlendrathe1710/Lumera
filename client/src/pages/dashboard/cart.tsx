import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Trash2, Plus, Minus, ShoppingCart, Package } from "lucide-react";
import { useCart, getDiscountedPrice } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { CustomerDashboardLayout } from "@/components/dashboard-layout";

export default function DashboardCart() {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const shippingCost = total >= 200 ? 0 : 25;
  const grandTotal = total + shippingCost;

  const handleCheckout = () => {
    if (isAuthenticated) {
      setLocation("/checkout");
    } else {
      setLocation("/login?redirect=/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <CustomerDashboardLayout title="Shopping Cart">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Looks like you haven't added any products yet</p>
          <Link href="/dashboard/products">
            <Button className="gap-2" data-testid="button-start-shopping">
              <ShoppingCart className="h-4 w-4" /> Start Shopping
            </Button>
          </Link>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout title="Shopping Cart">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} data-testid={`card-cart-item-${item.product.id}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Link href={`/products/${item.product.id}`}>
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
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    {item.product.weight && (
                      <Badge variant="secondary" className="mb-2">{item.product.weight}</Badge>
                    )}
                    <div>
                      {item.product.discountPercent && item.product.discountPercent > 0 ? (
                        <>
                          <span className="text-primary font-bold">
                            {getDiscountedPrice(item.product).toFixed(2)} AED
                          </span>
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {parseFloat(item.product.price).toFixed(2)} AED
                          </span>
                        </>
                      ) : (
                        <span className="text-primary font-bold">
                          {parseFloat(item.product.price).toFixed(2)} AED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                      data-testid={`button-remove-${item.product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        data-testid={`button-decrease-${item.product.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium" data-testid={`text-quantity-${item.product.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        data-testid={`button-increase-${item.product.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="destructive"
            onClick={clearCart}
            className="gap-2"
            data-testid="button-clear-cart"
          >
            <Trash2 className="h-4 w-4" /> Clear Cart
          </Button>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">{total.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `${shippingCost.toFixed(2)} AED`
                  )}
                </span>
              </div>
              {total < 200 && (
                <p className="text-xs text-muted-foreground">
                  Add {(200 - total).toFixed(2)} AED more for free shipping
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">{grandTotal.toFixed(2)} AED</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                <ShoppingBag className="h-4 w-4" /> Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </CustomerDashboardLayout>
  );
}
