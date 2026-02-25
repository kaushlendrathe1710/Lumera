import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminDashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  Download,
  Loader2,
} from "lucide-react";
import type { OrderWithItems } from "@shared/schema";
import type { OrderStatus, PaymentStatus, PaymentMethod } from "@shared/schema";
import { getStatusColor } from "@/lib/utils";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returning",
  "returned",
  "refunded",
];

export default function AdminOrderDetail() {
  const [, params] = useRoute("/admin/orders/:id");
  const orderId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/orders/${orderId}/status`,
        { status },
      );
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Order status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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


  if (isLoading) {
    return (
      <AdminDashboardLayout title="Order Details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!order) {
    return (
      <AdminDashboardLayout title="Order Details">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Order not found
          </h2>
          <p className="text-muted-foreground mb-4">
            The order you're looking for doesn't exist.
          </p>
          <Link href="/admin/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Order Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders">
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
          {order.status !== "cancelled" && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleDownloadInvoice}
                data-testid="button-download-invoice"
              >
                <Download className="h-4 w-4" /> Download Invoice
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <Link href={`/products/${item.productId}`}>
                          {item?.product?.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.productName}
                              className="w-12 h-12 object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </Link>
                        <div>
                          <Link href={`/products/${item.productId}`}>
                            <p className="font-medium text-foreground cursor-pointer">
                              {item.productName}
                            </p>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
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

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">
                    {parseFloat(order.totalAmount).toFixed(2)} AED
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Status</span>
                  <Badge
                    variant={getStatusColor(order.status)}
                    className="text-xs"
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Update Status
                  </label>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate(value)
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger data-testid="select-order-status">
                      {updateStatusMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

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

                {(order.status === "returning" || order.status === "returned" || order.status === "refunded") && order.returnReason && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Return Reason</p>
                      <p className="text-sm text-muted-foreground">{order.returnReason}</p>
                      {order.returnRequestedAt && (
                        <p className="text-xs text-muted-foreground">
                          Requested{" "}
                          {new Date(order.returnRequestedAt).toLocaleDateString("en-AE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
