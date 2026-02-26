import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AdminDashboardLayout } from "@/components/dashboard-layout";
import type { ContactDetail } from "@shared/schema";

const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }
  return response.json();
};

export default function ContactDetailsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContactDetail | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ platform: "instagram", displayText: "", link: "" });

  const { data: items, isLoading } = useQuery<ContactDetail[]>({ queryKey: ["/api/contact-details"], queryFn: () => apiRequest("/api/contact-details") });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("/api/admin/contact-details", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-details"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Contact detail created" });
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) => apiRequest(`/api/admin/contact-details/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-details"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Contact detail updated" });
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/contact-details/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-details"] });
      setIsDeleteDialogOpen(false);
      setToDelete(null);
      toast({ title: "Success", description: "Deleted" });
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ platform: "instagram", displayText: "", link: "" });
    setEditing(null);
  };

  const openDialog = (item?: ContactDetail) => {
    if (item) {
      setEditing(item);
      setFormData({ platform: item.platform, displayText: item.displayText, link: item.link });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayText || !formData.link) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    // Client side validation + normalize mailto:/tel: automatically
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{7,15}$/;
    const instaRegex = /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._-]+\/?/i;
    const tiktokRegex = /^https?:\/\/([a-z0-9]+\.)?tiktok\.com\//i;

    const { platform } = formData as { platform: string };
    let normalizedLink = formData.link.trim();

    if (platform === "email") {
      // allow plain email or mailto:email; normalize to mailto:...
      const asMailTo = normalizedLink.startsWith("mailto:") ? normalizedLink.slice(7) : normalizedLink;
      if (!emailRegex.test(asMailTo)) {
        toast({ title: "Error", description: "Enter a valid email or mailto: link", variant: "destructive" });
        return;
      }
      normalizedLink = normalizedLink.startsWith("mailto:") ? normalizedLink : `mailto:${asMailTo}`;
    }

    if (platform === "phone") {
      // allow tel:+123 or digits; normalize to tel:+digits
      const asTel = normalizedLink.startsWith("tel:") ? normalizedLink.slice(4) : normalizedLink;
      const digits = asTel.replace(/\D/g, "");
      if (!phoneRegex.test(digits) && !phoneRegex.test(asTel)) {
        toast({ title: "Error", description: "Enter a valid phone number (digits, optional leading +) or tel: link", variant: "destructive" });
        return;
      }
      // ensure leading + for tel
      const telNumber = asTel.startsWith("+") ? asTel : `+${digits}`;
      normalizedLink = normalizedLink.startsWith("tel:") ? `tel:${telNumber}` : `tel:${telNumber}`;
    }

    if (platform === "instagram") {
      if (!instaRegex.test(normalizedLink)) {
        toast({ title: "Error", description: "Enter a valid Instagram URL (https://instagram.com/...)", variant: "destructive" });
        return;
      }
    }

    if (platform === "tiktok") {
      if (!tiktokRegex.test(normalizedLink)) {
        toast({ title: "Error", description: "Enter a valid TikTok URL", variant: "destructive" });
        return;
      }
    }
    const payload = { ...formData, link: normalizedLink };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    setToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (toDelete) deleteMutation.mutate(toDelete);
  };

  const filtered = items?.filter((i) => i.displayText.toLowerCase().includes(searchQuery.toLowerCase()) || i.platform.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <AdminDashboardLayout title="Contact Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Contact Details</h2>
            <p className="text-muted-foreground">Manage website contact links and social handles</p>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Display</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : filtered && filtered.length > 0 ? (
                filtered.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.platform}</TableCell>
                    <TableCell>{it.displayText}</TableCell>
                    <TableCell className="break-words"><a href={it.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">{it.link}</a></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(it)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(it.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center">No contact details yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog */}
        {isDialogOpen && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Add"} Contact Detail</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Platform</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Text</Label>
                  <Input value={formData.displayText} onChange={(e) => setFormData({ ...formData, displayText: e.target.value })} />
                </div>
                <div>
                  <Label>Link</Label>
                  <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
                </div>
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete confirm */}
        {isDeleteDialogOpen && (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => setIsDeleteDialogOpen(open)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete contact detail?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
