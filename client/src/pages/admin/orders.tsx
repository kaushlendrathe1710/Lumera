import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDashboardLayout } from "@/components/dashboard-layout";
import { useState, useMemo } from "react";
import { Search, ChevronRight, ShoppingBag } from "lucide-react";
import type { Order } from "@shared/schema";
import { getStatusColor } from "@/lib/utils";

// Extended type to include the isAwaitingPayment annotation from server
type OrderWithAnnotation = Order & {
  isAwaitingPayment?: boolean;
};

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  const { data: orders, isLoading } = useQuery<OrderWithAnnotation[]>({
    queryKey: ["/api/admin/orders"],
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.shippingName.toLowerCase().includes(query) ||
          o.shippingPhone.includes(query)
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (paymentMethodFilter && paymentMethodFilter !== "all") {
      filtered = filtered.filter((o) => o.paymentMethod === paymentMethodFilter);
    }

    if (paymentStatusFilter && paymentStatusFilter !== "all") {
      filtered = filtered.filter((o) => o.paymentStatus === paymentStatusFilter);
    }

    return filtered;
  }, [orders, searchQuery, statusFilter, paymentMethodFilter, paymentStatusFilter]);


  return (
    <AdminDashboardLayout title="Orders">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
            Order Management
          </h2>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>All Orders ({orders?.length || 0})</CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-orders"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returning">Returning</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="w-36" data-testid="select-payment-method-filter">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="cod">COD</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger className="w-36" data-testid="select-payment-status-filter">
                    <SelectValue placeholder="Paid Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        data-testid={`order-row-${order.id}`}
                      >
                        <TableCell>
                          <p className="font-medium text-foreground">#{order.orderNumber}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{order.shippingName}</p>
                            <p className="text-xs text-muted-foreground">{order.shippingPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString("en-AE", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {parseFloat(order.totalAmount).toFixed(2)} AED
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.paymentMethod === "stripe" ? "default" : "outline"}>
                            {order.paymentMethod === "stripe" ? "💳 Stripe" : "💵 COD"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="icon" data-testid={`button-view-order-${order.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Orders will appear here when customers make purchases"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
