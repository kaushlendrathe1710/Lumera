import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Search, Filter, Package, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { CustomerDashboardLayout } from "@/components/dashboard-layout";
import type { ProductWithCategory, Category } from "@shared/schema";

export default function DashboardProducts() {
  const { addItem, items: cartItems } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const { data: products, isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  }) as { data: ProductWithCategory[] | undefined; isLoading: boolean };

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories/active"],
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((p) => p.isActive);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <CustomerDashboardLayout title="Browse Products">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger
                className="w-[160px]"
                data-testid="select-category"
              >
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden group hover-elevate"
                data-testid={`card-product-${product.id}`}
              >
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-muted relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {product.isFeatured && (
                      <Badge className="absolute top-2 left-2">Featured</Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-1">
                    {product.category?.name || "Uncategorized"}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.shortDescription || product.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.weight && (
                      <Badge variant="secondary">{product.weight}</Badge>
                    )}
                    {product.discountPercent && product.discountPercent > 0 && (
                      <Badge variant="destructive">
                        -{product.discountPercent}% OFF
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-lg font-bold text-primary">
                        {parseFloat(product.price).toFixed(2)} AED
                      </span>
                      {product.comparePrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {parseFloat(product.comparePrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {product.stock === 0 ? (
                      <Button
                        size="sm"
                        disabled
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        Out of Stock
                      </Button>
                    ) : cartItems.some(
                        (item) => item.product.id === product.id,
                      ) ? (
                      <Link href="/cart">
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-in-cart-${product.id}`}
                        >
                          Goto Cart
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(product);
                          toast({
                            title: "Added to cart",
                            description: `${product.name} has been added to your cart`,
                          });
                        }}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "No products are available at the moment"}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </CustomerDashboardLayout>
  );
}
