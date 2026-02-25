import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Loader2, Package, Search, Upload, X, Image } from "lucide-react";
import type { ProductWithCategory, InsertProduct, Category } from "@shared/schema";

interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string;
  discountPercent: number;
  categoryId: string;
  sku: string;
  stock: number;
  weight: string;
  origin: string;
  imageUrl: string;
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  shortDescription: "",
  price: "",
  comparePrice: "",
  discountPercent: 0,
  categoryId: "",
  sku: "",
  stock: 0,
  weight: "",
  origin: "",
  imageUrl: "",
  images: [],
  isFeatured: false,
  isActive: true,
};

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductWithCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  }) as { data: ProductWithCategory[] | undefined; isLoading: boolean };

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.name && p.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const createProductMutation = useMutation({
    mutationFn: async (data: Partial<InsertProduct>) => {
      const res = await apiRequest("POST", "/api/admin/products", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Product created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      flushPendingDeletes();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProduct> }) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      flushPendingDeletes();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/products/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeletingProduct(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setDeletingProduct(null);
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setPendingDeletes([]);
  };

  const openEditDialog = (product: ProductWithCategory) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || "",
      price: product.price,
      comparePrice: product.comparePrice || "",
      discountPercent: product.discountPercent || 0,
      categoryId: product.categoryId,
      sku: product.sku || "",
      stock: product.stock,
      weight: product.weight || "",
      origin: product.origin || "",
      imageUrl: product.imageUrl || "",
      images: product.images || [],
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingImages(true);

    try {
      const formDataUpload = new FormData();
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          });
          continue;
        }
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image`,
            variant: "destructive",
          });
          continue;
        }
        formDataUpload.append("images", file);
      }

      const response = await fetch("/api/uploads/images", {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const { urls } = await response.json();

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
        imageUrl: prev.imageUrl || urls[0] || "",
      }));

      toast({
        title: "Images uploaded",
        description: `${urls.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const imageUrl = formData.images[index];

    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        imageUrl: prev.imageUrl === prev.images[index] ? (newImages[0] || "") : prev.imageUrl,
      };
    });

    if (imageUrl) {
      setPendingDeletes((prev) => [...prev, imageUrl]);
    }
  };

  const flushPendingDeletes = async () => {
    if (pendingDeletes.length === 0) return;
    const toDelete = [...pendingDeletes];
    setPendingDeletes([]);
    for (const url of toDelete) {
      try {
        await fetch("/api/uploads/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url }),
        });
      } catch (error) {
        console.error("Failed to delete image from storage:", error);
      }
    }
  };

  const setMainImage = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return;
    }
    if (!formData.description.trim()) {
      toast({ title: "Error", description: "Product description is required", variant: "destructive" });
      return;
    }
    if (!formData.categoryId) {
      toast({ title: "Error", description: "Product category is required", variant: "destructive" });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({ title: "Error", description: "Valid product price is required", variant: "destructive" });
      return;
    }

    // Clean and prepare data for submission
    const submitData: any = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId,
      price: formData.price,
      stock: formData.stock,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
    };

    // Add optional fields only if they have values
    if (formData.shortDescription?.trim()) {
      submitData.shortDescription = formData.shortDescription.trim();
    }
    if (formData.comparePrice) {
      submitData.comparePrice = formData.comparePrice;
    }
    if (formData.discountPercent > 0) {
      submitData.discountPercent = formData.discountPercent;
    }
    if (formData.sku?.trim()) {
      submitData.sku = formData.sku.trim();
    }
    if (formData.weight?.trim()) {
      submitData.weight = formData.weight.trim();
    }
    if (formData.origin?.trim()) {
      submitData.origin = formData.origin.trim();
    }
    submitData.imageUrl = formData.imageUrl || null;
    submitData.images = formData.images.length > 0 ? formData.images : null;

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: submitData });
    } else {
      createProductMutation.mutate(submitData);
    }
  };

  const isPending = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <AdminDashboardLayout title="Products">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
              Product Management
            </h2>
            <p className="text-muted-foreground">
              Add, edit, and manage your product catalog
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-product">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update the product details below" : "Fill in the product details below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Sidr Honey"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      data-testid="input-product-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                      required
                    >
                      <SelectTrigger data-testid="select-product-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      placeholder="e.g. SIDR-500G"
                      value={formData.sku}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                      data-testid="input-product-sku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin</Label>
                    <Input
                      id="origin"
                      placeholder="e.g. UAE"
                      value={formData.origin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, origin: e.target.value }))}
                      data-testid="input-product-origin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    placeholder="Brief product summary for listings"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    data-testid="input-product-short-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter detailed product description..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                    data-testid="input-product-description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (AED) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      required
                      data-testid="input-product-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare Price (AED)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Original price"
                      value={formData.comparePrice}
                      onChange={(e) => setFormData((prev) => ({ ...prev, comparePrice: e.target.value }))}
                      data-testid="input-product-compare-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPercent">Discount %</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData((prev) => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                      data-testid="input-product-discount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      required
                      data-testid="input-product-stock"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    placeholder="e.g. 500g"
                    value={formData.weight}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                    data-testid="input-product-weight"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      data-testid="input-product-images"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="gap-2"
                      data-testid="button-upload-images"
                    >
                      {uploadingImages ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload Images
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      {editingProduct
                        ? "Upload additional images or manage existing ones below. Images are stored in AWS S3."
                        : "Upload multiple product images to AWS S3. Click to set main image or remove."}
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        {editingProduct ? "Existing & New Images" : "Uploaded Images"} ({formData.images.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((url, index) => (
                          <div
                            key={`${url}-${index}`}
                            className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                              formData.imageUrl === url ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="aspect-square bg-muted">
                              <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop";
                                  target.onerror = null; // Prevent infinite loop
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={() => setMainImage(url)}
                                title="Set as main image"
                                data-testid={`button-set-main-image-${index}`}
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={() => removeImage(index)}
                                title="Remove image"
                                data-testid={`button-remove-image-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {formData.imageUrl === url && (
                              <Badge className="absolute top-2 left-2 shadow-sm">Main</Badge>
                            )}
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              #{index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Or Enter Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      data-testid="input-product-image-url"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                      data-testid="switch-product-active"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                      data-testid="switch-product-featured"
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} data-testid="button-save-product">
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>All Products ({products?.length || 0})</CardTitle>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-products"
                />
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
            ) : filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <div className="flex gap-1">
                                {product.weight && (
                                  <span className="text-xs text-muted-foreground">{product.weight}</span>
                                )}
                                {product.isFeatured && (
                                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.sku || "-"}
                        </TableCell>
                        <TableCell>{product.category?.name || "-"}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{parseFloat(product.price).toFixed(2)} AED</span>
                            {product.discountPercent && product.discountPercent > 0 && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                -{product.discountPercent}%
                              </Badge>
                            )}
                          </div>
                          {product.comparePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {parseFloat(product.comparePrice).toFixed(2)} AED
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(product)}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  data-testid={`button-delete-${product.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteProductMutation.mutate(product.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Start by adding your first product"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
