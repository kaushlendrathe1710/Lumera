import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Package } from "lucide-react";
import { useCart, getDiscountedPrice } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default function Cart() {
  const { items, removeItem, updateQuantity, total, itemCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const shippingCost = total >= 200 ? 0 : 25;
  const grandTotal = total + shippingCost;

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

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any products yet
            </p>
            <Link href="/products">
              <Button size="lg" className="gap-2" data-testid="button-start-shopping">
                <ShoppingCart className="h-5 w-5" /> Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">{itemCount} items in cart</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={clearCart}
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Clear Cart
                </Button>
              </div>

              {items.map((item) => (
                <Card key={item.product.id} data-testid={`cart-item-${item.product.id}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Link href={`/products/${item.product.id}`}>
                        <div className="w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0 cursor-pointer">
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
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/products/${item.product.id}`}>
                              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            {item.product.category && (
                              <p className="text-sm text-muted-foreground">{item.product.category.name}</p>
                            )}
                            {item.product.weight && (
                              <Badge variant="secondary" className="mt-1">{item.product.weight}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.product.id)}
                            data-testid={`button-remove-${item.product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
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
                            <span className="w-8 text-center font-medium text-foreground">
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
                          <div className="text-right">
                            <span className="font-bold text-primary">
                              {(getDiscountedPrice(item.product) * item.quantity).toFixed(2)} AED
                            </span>
                            {item.product.discountPercent && item.product.discountPercent > 0 && (
                              <div className="text-xs text-muted-foreground line-through">
                                {(parseFloat(item.product.price) * item.quantity).toFixed(2)} AED
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal</span>
                    <span>{total.toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `${shippingCost.toFixed(2)} AED`
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add {(200 - total).toFixed(2)} AED more for free shipping
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">{grandTotal.toFixed(2)} AED</span>
                  </div>
                  <Link href="/checkout">
                    <Button className="w-full" size="lg" data-testid="button-checkout">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground">
                    Taxes and final shipping calculated at checkout
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
