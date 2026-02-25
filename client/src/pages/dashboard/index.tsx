import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth";
import { Package, ShoppingBag, Clock, CheckCircle, ChevronRight } from "lucide-react";
import type { Order, OrderStatus } from "@shared/schema";

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/my-orders"],
  });

  const recentOrders = orders?.slice(0, 3) || [];
  const pendingCount = orders?.filter((o) => o.status === ("pending" as OrderStatus) || o.status === ("processing" as OrderStatus)).length || 0;
  const completedCount = orders?.filter((o) => o.status === ("delivered" as OrderStatus)).length || 0;

  return (
    <CustomerDashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            Welcome back, {user?.name || "there"}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your account activity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/orders">
            <Card className="cursor-pointer hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{orders?.length || 0}</div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/orders?status=pending">
            <Card className="cursor-pointer hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/orders?status=delivered">
            <Card className="cursor-pointer hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Delivered
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{completedCount}</div>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-orders">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-1">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                    <div className="flex items-center justify-between py-3 px-2 rounded-md hover-elevate cursor-pointer">
                      <div>
                        <p className="font-medium text-foreground">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-AE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">
                          {parseFloat(order.totalAmount).toFixed(2)} AED
                        </span>
                        <Badge variant={
                          order.status === "delivered" ? "default" :
                          order.status === "cancelled" ? "destructive" :
                          "secondary"
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                <Link href="/products">
                  <Button data-testid="button-start-shopping">Start Shopping</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerDashboardLayout>
  );
}
