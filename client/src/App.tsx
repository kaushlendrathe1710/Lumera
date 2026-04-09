import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import { AdminRoute } from "@/components/protected-route";

import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import WishlistPage from "@/pages/wishlist";
import Checkout from "@/pages/checkout";
import OrderConfirmation from "@/pages/order-confirmation";
import PaymentSuccess from "@/pages/payment-success";
import Login from "@/pages/login";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Shipping from "@/pages/shipping";
import Returns from "@/pages/returns";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

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
      {/* <Route path="/faq" component={Faq} /> */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/returns" component={Returns} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/login" component={Login} />

      <Route path="/checkout" component={Checkout} />

      <Route path="/order-confirmation/:id" component={OrderConfirmation} />

      <Route path="/payment-success" component={PaymentSuccess} />

      <Route path="/dashboard">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard/orders">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard/orders/:id">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard/profile">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard/wishlist">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard/addresses">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard/products">
        <Redirect to="/" />
      </Route>

      <Route path="/dashboard/cart">
        <Redirect to="/" />
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
