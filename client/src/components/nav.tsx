import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingCart, Heart, Search, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { useState, useEffect, useRef } from "react";

export function Nav() {
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { wishlistProductIds } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: categories } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["/api/categories/active"],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input field with URL ?q= param reactively via useSearch
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const q = params.get("q") || "";
    setSearchQuery(q);
  }, [searchString]);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      {/* Top meta bar removed (no store locator / language) */}

      {/* Middle: logo + search + actions */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src="/logo.png" className="mix-blend-difference" alt="Lumera Logo" />
                </div>
                {/* <span className="font-serif text-xl font-bold">Lumera</span> */}
              </div>
            </Link>
            {/* Desktop search */}
            <div className="hidden lg:block">
              <form
                className="flex items-center bg-card rounded-md shadow-sm overflow-hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = searchQuery.trim();
                  if (q) navigate(`/products?q=${encodeURIComponent(q)}`);
                  else navigate(`/products`);
                }}
              >
                <div className="px-3 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchQuery(v);
                    // Debounce: navigate after 400ms of inactivity
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                      const q = v.trim();
                      if (q) navigate(`/products?q=${encodeURIComponent(q)}`);
                      else navigate(`/products`);
                    }, 400);
                  }}
                  placeholder="Search perfumes, brands, notes or SKU"
                  className="px-3 py-2 outline-none bg-transparent w-96 text-sm"
                />
                <Button type="submit" className="rounded-r-md">
                  Search
                </Button>
              </form>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">My Cart</span>
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistProductIds.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {wishlistProductIds.length}
                  </Badge>
                )}
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link href={user?.role === "customer" ? "/dashboard" : "/admin"}>
                <Button variant="outline" className="inline">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="inline">Sign in</Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav: only Perfumes and Categories */}
      <div className="hidden lg:block border-t">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 py-3 text-sm">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/products" className="hover:text-foreground">
              Perfumes
            </Link>
            <div className="group relative">
              <button className="hover:text-foreground">Categories</button>
              <div className="absolute left-0 top-full mt-2 w-56 bg-muted shadow-lg rounded-md opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
                <ul className="p-3">
                  {categories?.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        className="block py-1 text-sm text-muted-foreground hover:text-foreground"
                        href={`/products?category=${cat.id}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="px-4 py-4">
            <nav className="flex flex-col gap-2">
              <Link href="/" className="py-1">
                Home
              </Link>
              <Link href="/about" className="py-1">
                About
              </Link>
              <Link href="/contact" className="py-1">
                Contact
              </Link>
              <Link href="/products" className="py-1">
                Perfumes
              </Link>
              <div className="pt-2 border-t">
                <div className="text-sm font-semibold mb-2">Categories</div>
                {categories?.map((c) => (
                  <Link
                    key={c.id}
                    href={`/products?category=${c.id}`}
                    className="block py-2 text-sm"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
