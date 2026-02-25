import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Nav } from "@/components/nav";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);

  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session_id");

  const verifyPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/stripe/verify-payment", {
        sessionId,
      });
      return res.json();
    },
    onSuccess: (data) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my-orders"] });
      setOrder(data.order);
    },
  });

  useEffect(() => {
    if (sessionId) {
      verifyPaymentMutation.mutate();
    }
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Session</h1>
            <p className="text-muted-foreground mb-6">
              No payment session found. Please try again.
            </p>
            <Link href="/checkout">
              <Button>Return to Checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyPaymentMutation.isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyPaymentMutation.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Payment Verification Failed</h1>
            <p className="text-muted-foreground mb-6">
              {(verifyPaymentMutation.error as Error)?.message || "Unable to verify payment. Please contact support."}
            </p>
            <div className="space-y-2">
              <Link href="/dashboard/orders">
                <Button className="w-full">View My Orders</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">Return Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. Your payment has been processed successfully.
            </p>

            {order && (
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="font-bold text-lg text-foreground">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground mt-3 mb-1">Total Paid</p>
                <p className="font-bold text-lg text-primary">{parseFloat(order.totalAmount).toFixed(2)} AED</p>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-8">
              A confirmation email will be sent to your registered email address.
              You can track your order status in your dashboard.
            </p>

            <div className="space-y-3">
              {order && (
                <Link href={`/order-confirmation/${order.id}`}>
                  <Button className="w-full gap-2" data-testid="button-view-order">
                    <ShoppingBag className="h-4 w-4" />
                    View Order Details
                  </Button>
                </Link>
              )}
              <Link href="/dashboard/orders">
                <Button variant="outline" className="w-full" data-testid="button-view-orders">
                  View All Orders
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" className="w-full" data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
