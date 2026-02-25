import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminDashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth";
import { Package, ShoppingBag, Users, DollarSign, ChevronRight, TrendingUp } from "lucide-react";
import type { Order, Product, User, OrderStatus } from "@shared/schema";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const isLoading = ordersLoading || productsLoading || usersLoading;

  const recentOrders = orders?.slice(0, 5) || [];
  const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0) || 0;
  const pendingOrders = orders?.filter((o) => o.status === ("pending" as OrderStatus) || o.status === ("processing" as OrderStatus)).length || 0;

  return (
    <AdminDashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            Welcome back, {user?.name || "Admin"}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your store today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-foreground">{totalRevenue.toFixed(2)} AED</div>
              )}
            </CardContent>
          </Card>
          <Link href="/admin/orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <>
                    <div className="text-2xl flex items-center gap-2 font-bold text-foreground">{orders?.length || 0}{pendingOrders > 0 && (
                      <span className="text-xs font-normal text-muted-foreground">({pendingOrders} pending)</span>
                    )}</div>

                  </>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Products
                </CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{products?.length || 0}</div>
                )}
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customers
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-foreground">
                      {users?.filter((u) => u.role === "customer").length || 0}
                    </div>
                  )}
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="link-view-all-orders">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-1">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}>
                    <div className="flex items-center justify-between py-3 px-2 rounded-md hover-elevate cursor-pointer">
                      <div>
                        <p className="font-medium text-foreground">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-AE", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })} - {order.shippingName}
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
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
