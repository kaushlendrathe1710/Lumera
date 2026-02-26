import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { ProtectedRoute, AdminRoute } from "@/components/protected-route";

import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import WishlistPage from "@/pages/wishlist";
import DashboardWishlist from "@/pages/dashboard/wishlist";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import PaymentSuccess from "@/pages/payment-success";
import Login from "@/pages/login";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Shipping from "@/pages/shipping";
import Faq from "@/pages/faq";
import Returns from "@/pages/returns";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

import CustomerDashboard from "@/pages/dashboard/index";
import CustomerOrders from "@/pages/dashboard/orders";
import CustomerOrderDetail from "@/pages/dashboard/order-detail";
import CustomerProfile from "@/pages/dashboard/profile";
import DashboardProducts from "@/pages/dashboard/products";
import DashboardCart from "@/pages/dashboard/cart";
import DashboardAddresses from "@/pages/dashboard/addresses";

import AdminDashboard from "@/pages/admin/index";
import AdminCategories from "@/pages/admin/categories";
import AdminCountries from "@/pages/admin/countries";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderDetail from "@/pages/admin/order-detail";
import AdminUsers from "@/pages/admin/users";
import AdminProfile from "@/pages/admin/profile";
import AdminContactDetails from "@/pages/admin/contact-details";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/shipping" component={Shipping} />
      <Route path="/faq" component={Faq} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/returns" component={Returns} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/login" component={Login} />

      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>

      <Route path="/order-confirmation/:id">
        <ProtectedRoute>
          <OrderConfirmation />
        </ProtectedRoute>
      </Route>

      <Route path="/payment-success">
        <ProtectedRoute>
          <PaymentSuccess />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute>
          <CustomerDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/orders">
        <ProtectedRoute>
          <CustomerOrders />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/orders/:id">
        <ProtectedRoute>
          <CustomerOrderDetail />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/profile">
        <ProtectedRoute>
          <CustomerProfile />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/wishlist">
        <ProtectedRoute>
          <DashboardWishlist />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/addresses">
        <ProtectedRoute>
          <DashboardAddresses />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/products">
        <ProtectedRoute>
          <DashboardProducts />
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard/cart">
        <ProtectedRoute>
          <DashboardCart />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      </Route>

      <Route path="/admin/categories">
        <AdminRoute>
          <AdminCategories />
        </AdminRoute>
      </Route>

      <Route path="/admin/countries">
        <AdminRoute>
          <AdminCountries />
        </AdminRoute>
      </Route>

      <Route path="/admin/products">
        <AdminRoute>
          <AdminProducts />
        </AdminRoute>
      </Route>

      <Route path="/admin/contact-details">
        <AdminRoute>
          <AdminContactDetails />
        </AdminRoute>
      </Route>

      <Route path="/admin/orders">
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      </Route>

      <Route path="/admin/orders/:id">
        <AdminRoute>
          <AdminOrderDetail />
        </AdminRoute>
      </Route>

      <Route path="/admin/users">
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      </Route>

      <Route path="/admin/profile">
        <AdminRoute>
          <AdminProfile />
        </AdminRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
