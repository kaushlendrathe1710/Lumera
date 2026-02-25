import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerDashboardLayout } from "@/components/dashboard-layout";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";
import { useEffect, useState } from "react";
import { getStatusColor } from "@/lib/utils";

export default function CustomerOrders() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Read URL params on mount and whenever the URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status) {
      setStatusFilter(status);
    } else {
      setStatusFilter("all");
    }
  }, [window.location.search]);

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders/my-orders", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const url = `/api/orders/my-orders${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
  });

  // All orders are now pre-filtered by the server
  const filteredOrders = orders || [];

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value === "all") {
      setLocation("/dashboard/orders");
    } else {
      setLocation(`/dashboard/orders?status=${value}`);
    }
  };

  return (
    <CustomerDashboardLayout title="My Orders">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            Order History
          </h2>
          <p className="text-muted-foreground">
            View and track all your orders
          </p>
        </div>

        {/* Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={handleFilterChange} className="w-full">
          <TabsList className="grid w-full grid-cols-7 max-w-[820px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders && filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover-elevate" data-testid={`order-card-${order.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-AE", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {order.orderItems && order.orderItems.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <Link href={`/products/${order.orderItems[0].productId}`}>
                              <span className="underline cursor-pointer">{order.orderItems[0].productName}</span>
                            </Link>
                            {order.orderItems.length > 1 && (
                              <span className="text-muted-foreground">{` and ${order.orderItems.length - 1} more`}</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-2">
                        <p className="font-bold text-foreground text-lg">
                          {parseFloat(order.totalAmount).toFixed(2)} AED
                        </p>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs text-muted-foreground">Payment:</span>
                            <Badge variant={order.paymentMethod === "stripe" ? "default" : "outline"} className="text-xs">
                              {order.paymentMethod === "stripe" ? "Stripe" : "COD"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs text-muted-foreground">Status:</span>
                            <Badge
                              variant={order.paymentStatus === "paid" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {order.paymentStatus === "pending" ? "Pending" : "Paid"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-xs text-muted-foreground">Order:</span>
                            <Badge variant={getStatusColor(order.status)} className="text-xs">
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" data-testid={`button-view-order-${order.id}`}>
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              {statusFilter === "all" ? (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    When you make a purchase, your orders will appear here
                  </p>
                  <Link href="/products">
                    <Button data-testid="button-browse-products">Browse Products</Button>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No {statusFilter} orders</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any orders with this status
                  </p>
                  <Button variant="outline" onClick={() => handleFilterChange("all")}>
                    View All Orders
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
