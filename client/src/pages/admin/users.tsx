import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ConfirmDialog,
  ConfirmDialogTrigger,
  ConfirmDialogContent,
} from "@/components/ui/confirm-dialog";
import { AdminDashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, Loader2, Users, Search, Shield, UserCog, Trash } from "lucide-react";
import type { User, UserWithCountry } from "@shared/schema";

const SUPER_ADMIN_EMAIL = "kaushlendrs.k12@fms.edu";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const { data: users, isLoading } = useQuery<UserWithCountry[]>({
    queryKey: ["/api/admin/users"],
  });

  const isSuperAdmin = currentUser?.role === "superadmin";

  const filteredUsers = users?.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber?.includes(searchQuery) ||
      u.country?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.country?.dialCode.includes(searchQuery);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  }) || [];

  const createAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/admin/users/create-admin", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Admin created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewAdminEmail("");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User role updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    createAdminMutation.mutate(newAdminEmail);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Badge className="bg-purple-600"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case "admin":
        return <Badge variant="default"><UserCog className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="secondary">Customer</Badge>;
    }
  };

  return (
    <AdminDashboardLayout title="Users">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
              User Management
            </h2>
            <p className="text-muted-foreground">
              Manage customers and admin users
            </p>
          </div>
          {isSuperAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-add-admin">
                  <Plus className="h-4 w-4" /> Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Admin User</DialogTitle>
                  <DialogDescription>
                    Enter the email address for the new admin. They will be able to log in via email OTP.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                      data-testid="input-admin-email"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createAdminMutation.isPending} data-testid="button-create-admin">
                      {createAdminMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Admin"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>All Users ({users?.length || 0})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40" data-testid="select-role-filter">
                    <SelectValue placeholder="Filter role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                    <SelectItem value="superadmin">Super Admins</SelectItem>
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
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">User</TableHead>
                      <TableHead className="text-center">Phone</TableHead>
                      <TableHead className="text-center">Role</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Joined</TableHead>
                      {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{user.name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.country && user.phoneNumber ? (
                            <div className="flex flex-col items-center space-y-1">
                              <p className="text-xs text-muted-foreground font-mono flex gap-1 items-center">{user.country.isoCode} <img src={`https://flagsapi.com/${user.country.isoCode}/flat/24.png`} alt={`${user.country.isoCode}`} /></p>
                              <p className="font-mono text-sm text-nowrap">
                              {user.country.dialCode} {user.phoneNumber}
                            </p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-center">-</p>
                          )}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge variant={user.isRegistered ? "default" : "secondary"}>
                            {user.isRegistered ? "Registered" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString("en-AE", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.email !== SUPER_ADMIN_EMAIL && user.role !== "superadmin" && (
                                <>
                                  <Select
                                    value={user.role}
                                    onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                                  >
                                    <SelectTrigger className="w-32" data-testid={`select-role-${user.id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="customer">Customer</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <ConfirmDialog>
                                    <ConfirmDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        data-testid={`button-delete-${user.id}`}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </ConfirmDialogTrigger>
                                    <ConfirmDialogContent
                                      title="Delete User"
                                      description="Are you sure you want to delete this user?"
                                      confirmText="Delete"
                                      onConfirm={() => deleteUserMutation.mutate(user.id)}
                                    />
                                  </ConfirmDialog>
                                </>
                              )}
                              {user.email === SUPER_ADMIN_EMAIL && (
                                <span className="text-xs text-muted-foreground">Protected</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || roleFilter !== "all" ? "Try adjusting your filters" : "Users will appear here when they register"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
