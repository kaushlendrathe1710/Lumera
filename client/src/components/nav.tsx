import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingCart, Heart, Search, Menu, User, LogIn } from "lucide-react";
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

  // Sync input with URL
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    setSearchQuery(params.get("q") || "");
  }, [searchString]);

  return (
    <header className="sticky top-0 z-50 bg-royal border-white/10 border-b">

      <div className="container mx-auto px-4">

        {/* ===== TOP BAR ===== */}
        <div className="grid grid-cols-3 items-center h-20">

          {/* LEFT */}
          <div className="flex items-center justify-start">
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Desktop search */}
            <div className="hidden md:block">
              <form
                className="flex items-center bg-card rounded-md shadow-sm overflow-hidden"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = searchQuery.trim();
                  navigate(q ? `/products?q=${encodeURIComponent(q)}` : `/products`);
                }}
              >
                <div className="px-2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>

                <input
                  value={searchQuery}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchQuery(v);

                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                      const q = v.trim();
                      navigate(q ? `/products?q=${encodeURIComponent(q)}` : `/products`);
                    }, 400);
                  }}
                  placeholder="Search perfumes"
                  className="px-2 py-2 outline-none bg-transparent text-sm"
                />

                <Button type="submit" className="rounded-r-md px-3">
                  Search
                </Button>
              </form>
            </div>
          </div>

          {/* CENTER LOGO */}
          <div className="flex justify-center">
            <Link href="/">
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center cursor-pointer">
                <img src="/logo.png" alt="Lumera Logo" />
              </div>
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-3 text-white">
            <ThemeToggle />

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
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
            <div className="hidden md:block">
              {isAuthenticated ? (
                <Link
                  className="bg-white py-1 px-2 text-black rounded-md hover:text-gray-500"
                  href={user?.role === "customer" ? "/dashboard" : "/admin"}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-white py-1 px-2 text-black rounded-md hover:text-gray-500"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP NAV ===== */}
      <div className="hidden md:block border-white/10 border-t">
        <div className="container mx-auto px-4">
          <nav className="flex items-center text-white gap-2 py-1 text-sm">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-md">Home</Link>
            <Link href="/about" className="hover:bg-white/10 p-2 rounded-md">About</Link>
            <Link href="/contact" className="hover:bg-white/10 p-2 rounded-md">Contact</Link>
            <Link href="/products" className="hover:bg-white/10 p-2 rounded-md">Perfumes</Link>

            <div className="group relative">
              <button className="hover:bg-white/10 p-2 rounded-md">Categories</button>

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

      {/* ===== MOBILE MENU ===== */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-royal text-white">
          <div className="px-4 py-4 h-[70vh] flex flex-col justify-between">

            <nav className="flex flex-col gap-2">
              <Link href="/" className="py-2 hover:bg-white/10 px-3 rounded-md">Home</Link>
              <Link href="/about" className="py-2 hover:bg-white/10 px-3 rounded-md">About</Link>
              <Link href="/contact" className="py-2 hover:bg-white/10 px-3 rounded-md">Contact</Link>
              <Link href="/products" className="py-2 hover:bg-white/10 px-3 rounded-md">Perfumes</Link>

              <div className="pt-2 border-t border-white/10">
                <div className="text-sm font-semibold mb-2">Categories</div>

                <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
                  {categories?.map((c) => (
                    <Link
                      key={c.id}
                      href={`/products?category=${c.id}`}
                      className="py-2 text-sm hover:bg-white/10 px-3 rounded-md"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            <div className="pt-4 border-t border-white/10">
              {isAuthenticated ? (
                <Link
                  className="flex gap-2 items-center hover:text-gray-300"
                  href={user?.role === "customer" ? "/dashboard" : "/admin"}
                >
                  <User className="h-5 w-5" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex gap-2 items-center hover:text-gray-300"
                >
                  <LogIn className="h-5 w-5" />
                  Sign in
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
