import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDashboardLayout } from "@/components/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  Download,
  FileText,
  Calendar,
  XCircle,
  RotateCcw,
  Star,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type {
  OrderWithItems,
  OrderStatus,
  PaymentStatus,
} from "@shared/schema";
import { getStatusColor } from "@/lib/utils";

const CANCELLATION_REASONS = [
  "No longer required",
  "Found a cheaper price elsewhere",
  "Ordered by mistake",
  "Delivery time is too long",
  "Want to change shipping address",
  "Other",
];

const RETURN_REASONS = [
  "Product damaged or defective",
  "Wrong item received",
  "Item does not match description",
  "Changed my mind",
  "Quality not as expected",
  "Other",
];

export default function CustomerOrderDetail() {
  const [, params] = useRoute("/dashboard/orders/:id");
  const orderId = params?.id;

  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnOtherReason, setReturnOtherReason] = useState("");

  const cancelOrderMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/cancel`, {
        reason,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my-orders"] });
      setShowCancelDialog(false);
      setCancelReason("");
      setOtherReason("");
      toast({ title: "Order cancelled successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const retryPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/orders/${orderId}/retry-payment`,
        {},
      );
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to retry payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const returnOrderMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/return`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my-orders"] });
      setShowReturnDialog(false);
      setReturnReason("");
      setReturnOtherReason("");
      toast({ title: "Return request submitted", description: "We'll process your return soon." });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit return",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canReturn =
    order?.status === "delivered" &&
    !!order?.updatedAt &&
    Date.now() - new Date(order.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000;

  const returnDeadlineStr = order?.updatedAt
    ? new Date(
        new Date(order.updatedAt).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const handleDownloadInvoice = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to download invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${order?.orderNumber || orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const getEstimatedDelivery = (createdAt: string | Date, status: string) => {
    if (status === "cancelled") return null;
    if (status === "delivered") return null;
    const orderDate = new Date(createdAt);
    const minDays = 3;
    const maxDays = 7;
    const minDate = new Date(orderDate);
    minDate.setDate(minDate.getDate() + minDays);
    const maxDate = new Date(orderDate);
    maxDate.setDate(maxDate.getDate() + maxDays);
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return `${minDate.toLocaleDateString("en-AE", opts)} - ${maxDate.toLocaleDateString("en-AE", opts)}`;
  };

  if (isLoading) {
    return (
      <CustomerDashboardLayout title="Order Details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </CustomerDashboardLayout>
    );
  }

  if (!order) {
    return (
      <CustomerDashboardLayout title="Order Details">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Order not found
          </h2>
          <p className="text-muted-foreground mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Link href="/dashboard/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </CustomerDashboardLayout>
    );
  }

  return (
    <CustomerDashboardLayout title="Order Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                Order #{order.orderNumber}
              </h2>
              <p className="text-muted-foreground">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-AE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {order.status !== "cancelled" && order.status !== "pending" && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadInvoice}
                data-testid="button-download-invoice"
              >
                <Download className="h-4 w-4" /> Invoice
              </Button>
            )}
            {order.paymentMethod === "stripe" &&
              order.paymentStatus === "pending" && (
                <Button
                  className="gap-2"
                  onClick={() => retryPaymentMutation.mutate()}
                  disabled={retryPaymentMutation.isPending}
                  data-testid="button-retry-payment"
                >
                  {retryPaymentMutation.isPending
                    ? "Processing..."
                    : "Complete Payment"}
                </Button>
              )}
            {order.status === "pending" && (
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setShowCancelDialog(true)}
                data-testid="button-cancel-order"
              >
                <XCircle className="h-4 w-4" /> Cancel Order
              </Button>
            )}
            {order.status === "delivered" && canReturn && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowReturnDialog(true)}
                data-testid="button-return-order"
              >
                <RotateCcw className="h-4 w-4" /> Return Order
              </Button>
            )}
          </div>
        </div>

        {getEstimatedDelivery(order.createdAt, order.status) && (
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Estimated Delivery
                </p>
                <p
                  className="font-medium text-foreground"
                  data-testid="text-estimated-delivery"
                >
                  {getEstimatedDelivery(order.createdAt, order.status)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {order.status === "delivered" && (
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div>
                {canReturn ? (
                  <>
                    <p className="text-sm text-muted-foreground">Return Window</p>
                    <p className="font-medium text-foreground">
                      Return by {returnDeadlineStr}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Return Window</p>
                    <p className="font-medium text-muted-foreground">Return window expired</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {["returning", "returned", "refunded"].includes(order.status) && order.returnReason && (
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Return Reason</p>
                <p className="font-medium text-foreground">{order.returnReason}</p>
                {order.returnRequestedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Requested on{" "}
                    {new Date(order.returnRequestedAt).toLocaleDateString("en-AE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Status Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Order Status</p>
                <Badge
                  variant={getStatusColor(order.status)}
                  className="text-sm px-3 py-1"
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <Badge
                  variant={
                    order.paymentMethod === "stripe" ? "default" : "outline"
                  }
                  className="text-sm px-3 py-1"
                >
                  {order.paymentMethod === "stripe" ? "💳 Stripe" : "💵 COD"}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge
                  variant={
                    order.paymentStatus === "paid" ? "default" : "secondary"
                  }
                  className="text-sm px-3 py-1"
                >
                  {order.paymentStatus.charAt(0).toUpperCase() +
                    order.paymentStatus.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between py-3 border-b last:border-0 gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          <Link href={`/products/${item.productId}`}>
                            {item?.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </Link>
                        </div>
                        <div className="min-w-0">
                          <Link href={`/products/${item.productId}`}>
                            <p className="font-medium text-foreground cursor-pointer">
                              {item.productName}
                            </p>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          {["delivered", "returning", "returned", "refunded"].includes(order.status) && (
                            <Link href={`/products/${item.productId}#reviews`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 gap-1.5 text-xs h-7"
                              >
                                <Star className="h-3 w-3" />
                                Drop a Review
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-foreground">
                          {(
                            parseFloat(item.productPrice) * item.quantity
                          ).toFixed(2)}{" "}
                          AED
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {parseFloat(item.productPrice).toFixed(2)} AED each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">
                      {parseFloat(order.totalAmount).toFixed(2)} AED
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">
                      {parseFloat(order.totalAmount).toFixed(2)} AED
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{order.shippingName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{order.shippingPhone}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-foreground">
                    {order.shippingAddress}
                    <br />
                    {order.shippingCity}, {order.shippingEmirate}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge
                    variant={
                      order.paymentMethod === "stripe" ? "default" : "outline"
                    }
                  >
                    {order.paymentMethod === "stripe" ? "💳 Stripe" : "💵 COD"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge
                    variant={
                      order.paymentStatus === "paid" ? "default" : "secondary"
                    }
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() +
                      order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                {order.paymentMethod === "stripe" &&
                  order.paymentStatus === "pending" && (
                    <div className="pt-2">
                      <Button
                        className="w-full gap-2"
                        onClick={() => retryPaymentMutation.mutate()}
                        disabled={retryPaymentMutation.isPending}
                        data-testid="button-retry-payment-card"
                      >
                        {retryPaymentMutation.isPending
                          ? "Processing..."
                          : "Complete Payment"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Complete your payment to process this order
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please select a reason for cancellation:
          </p>
          <RadioGroup
            value={cancelReason}
            onValueChange={setCancelReason}
            className="gap-3 mt-2"
          >
            {CANCELLATION_REASONS.map((reason) => (
              <div key={reason} className="flex items-center gap-2">
                <RadioGroupItem
                  value={reason}
                  id={`reason-${reason}`}
                  data-testid={`radio-reason-${reason}`}
                />
                <Label htmlFor={`reason-${reason}`} className="cursor-pointer">
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {cancelReason === "Other" && (
            <div className="mt-3">
              <Label htmlFor="otherReason">Other reason</Label>
              <Textarea
                id="otherReason"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Please describe the reason"
                rows={4}
              />
            </div>
          )}
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancelReason("");
              }}
              data-testid="button-cancel-dialog-close"
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              disabled={
                !cancelReason ||
                (cancelReason === "Other" && !otherReason.trim()) ||
                cancelOrderMutation.isPending
              }
              onClick={() => {
                const reasonToSend =
                  cancelReason === "Other" ? otherReason.trim() : cancelReason;
                cancelOrderMutation.mutate(reasonToSend);
              }}
              data-testid="button-confirm-cancel"
            >
              {cancelOrderMutation.isPending
                ? "Cancelling..."
                : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Please select a reason for the return:
          </p>
          <RadioGroup
            value={returnReason}
            onValueChange={setReturnReason}
            className="gap-3 mt-2"
          >
            {RETURN_REASONS.map((reason) => (
              <div key={reason} className="flex items-center gap-2">
                <RadioGroupItem
                  value={reason}
                  id={`return-reason-${reason}`}
                />
                <Label htmlFor={`return-reason-${reason}`} className="cursor-pointer">
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {returnReason === "Other" && (
            <div className="mt-3">
              <Label htmlFor="returnOtherReason">Please describe the issue</Label>
              <Textarea
                id="returnOtherReason"
                value={returnOtherReason}
                onChange={(e) => setReturnOtherReason(e.target.value)}
                placeholder="Describe your return reason"
                rows={4}
              />
            </div>
          )}
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowReturnDialog(false);
                setReturnReason("");
                setReturnOtherReason("");
              }}
            >
              Go Back
            </Button>
            <Button
              disabled={
                !returnReason ||
                (returnReason === "Other" && !returnOtherReason.trim()) ||
                returnOrderMutation.isPending
              }
              onClick={() => {
                const reasonToSend =
                  returnReason === "Other" ? returnOtherReason.trim() : returnReason;
                returnOrderMutation.mutate(reasonToSend);
              }}
              data-testid="button-confirm-return"
            >
              {returnOrderMutation.isPending ? "Submitting..." : "Submit Return Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerDashboardLayout>
  );
}
