import { ReactNode } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("customer" | "admin" | "superadmin")[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ["customer", "admin", "superadmin"],
  redirectTo = "/login"
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  if (user && !allowedRoles.includes(user.role as any)) {
    if (user.role === "customer") {
      return <Redirect to="/dashboard" />;
    } else {
      return <Redirect to="/admin" />;
    }
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]} redirectTo="/login">
      {children}
    </ProtectedRoute>
  );
}

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["superadmin"]} redirectTo="/admin">
      {children}
    </ProtectedRoute>
  );
}
