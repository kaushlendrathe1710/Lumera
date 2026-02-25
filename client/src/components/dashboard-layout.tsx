import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogContent,
} from "@/components/ui/confirm-dialog";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import {
  Home,
  Package,
  ShoppingBag,
  User,
  LogOut,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  LayoutDashboard,
  ArrowLeftRight,
  FolderTree,
  Globe,
  Heart,
  MapPin,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export function CustomerDashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Orders", url: "/dashboard/orders", icon: Package },
    { title: "Wishlist", url: "/dashboard/wishlist", icon: Heart },
    { title: "Addresses", url: "/dashboard/addresses", icon: MapPin },
    { title: "Profile", url: "/dashboard/profile", icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                {/* <div className="w-20 h-20 flex items-center justify-center">
                <img src="/logo.png" alt="Lumera Logo" />
              </div> */}
                <span className="font-serif text-lg font-bold text-foreground">Lumera</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Shop</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/dashboard/products"}>
                      <Link href="/dashboard/products">
                        <ShoppingBag className="h-4 w-4" />
                        <span>Products</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/dashboard/cart"}>
                      <Link href="/dashboard/cart">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Cart</span>
                        {itemCount > 0 && (
                          <Badge className="ml-auto">{itemCount}</Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {(user?.role === "admin" || user?.role === "superadmin") && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/admin">
                          <Settings className="h-4 w-4" />
                          <span>Switch to Admin</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <ConfirmDialog>
              <ConfirmDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </ConfirmDialogTrigger>
              <ConfirmDialogContent
                title="Logout"
                description="Are you sure you want to logout?"
                confirmText="Logout"
                onConfirm={async () => {
                  await logout();
                  window.location.href = "/";
                }}
              />
            </ConfirmDialog>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function AdminDashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Categories", url: "/admin/categories", icon: FolderTree },
    { title: "Countries", url: "/admin/countries", icon: Globe },
    { title: "Products", url: "/admin/products", icon: Package },
    { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
    { title: "Users", url: "/admin/users", icon: Users },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-20 h-20 flex items-center justify-center">
                {/* <img src="/logo.png" alt="Lumera Logo" /> */}
              <span className="font-serif text-xl font-bold">Lumera</span>
              </div>
                <span className="font-serif text-lg font-bold text-foreground">Admin Panel</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <ArrowLeftRight className="h-4 w-4" />
                        <span>Customer View</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>View Store</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === "/admin/profile"}>
                      <Link href="/admin/profile">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {user?.role === "superadmin" ? "Super Admin" : "Admin"}
                </Badge>
              </div>
            </div>
            <ConfirmDialog>
              <ConfirmDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </ConfirmDialogTrigger>
              <ConfirmDialogContent
                title="Logout"
                description="Are you sure you want to logout?"
                confirmText="Logout"
                onConfirm={handleLogout}
              />
            </ConfirmDialog>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
