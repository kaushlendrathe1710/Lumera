import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star, Truck, Shield, Leaf, ChevronRight, ArrowRight, Package, Check, ArrowUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import type { ProductWithCategory as Product } from "@shared/schema";
import heroImage from "@/assets/images/hero-honey.png";
import uaeBackground from "@/assets/images/uae-background.png";

export default function Home() {
  const { addItem, items: cartItems } = useCart();
  const { toast } = useToast();

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: ratingsData } = useQuery<{ productId: string; avgRating: number; reviewCount: number }[]>({
    queryKey: ["/api/products/ratings/all"],
  });

  const ratingsMap = useMemo(() => {
    const map = new Map<string, { avgRating: number; reviewCount: number }>();
    ratingsData?.forEach(r => map.set(r.productId, { avgRating: r.avgRating, reviewCount: r.reviewCount }));
    return map;
  }, [ratingsData]);

  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <>
    <div className="min-h-screen bg-background">
      <Nav />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Premium honey collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary/90 text-primary-foreground">
              Raw Himalayan Honey
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Papa Honey — <br />
              <span className="text-primary">Pure. Honest. Himalayan.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              Papa Honey is a family-led brand delivering raw, organic Himalayan multiflora honey.
              We harvest directly from southern Himalayan apiaries and minimally process each batch
              to preserve natural enzymes, aroma, and nutrients.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="gap-2" data-testid="button-shop-now">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm" onClick={() => document.getElementById("featured-products")?.scrollIntoView({ behavior: "smooth" })}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Truck, title: "Direct From Apiary", desc: "Producers involved in harvesting" },
              { icon: Shield, title: "Raw & Organic", desc: "Minimally processed, unheated" },
              { icon: Leaf, title: "Himalayan Multiflora", desc: "Rich, authentic flavor profile" },
              { icon: Star, title: "Affordable Purity", desc: "High quality at fair prices" },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-products" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">Our most popular honey selections</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="gap-2" data-testid="link-view-all">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group hover-elevate" data-testid={`card-product-${product.id}`}>
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-muted">
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
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-foreground mb-1 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-1">{product.category?.name || "Uncategorized"}</p>
                    {ratingsMap.get(product.id) && (
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(ratingsMap.get(product.id)!.avgRating) ? "fill-primary text-primary" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({ratingsMap.get(product.id)!.reviewCount})</span>
                      </div>
                    )}
                    {product.discountPercent && product.discountPercent > 0 && (
                      <Badge variant="destructive">
                        {product.discountPercent}% OFF
                      </Badge>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        {product.discountPercent && product.discountPercent > 0 ? (
                          <>
                            <span className="text-lg font-bold text-primary">
                              {(parseFloat(product.price) * (1 - product.discountPercent / 100)).toFixed(2)} AED
                            </span>
                            <span className="text-sm text-muted-foreground line-through ml-2">
                              {parseFloat(product.price).toFixed(2)} AED
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {parseFloat(product.price).toFixed(2)} AED
                          </span>
                        )}
                      </div>
                      {cartItems.some(item => item.product.id === product.id) ? (
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
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No products available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={uaeBackground}
            alt="UAE landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Sourced from Southern Himalayan Regions
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
            Our multiflora honey is naturally sourced from the southern Himalayas. We manage the
            harvesting process ourselves to ensure authentic composition and minimal handling,
            so every jar reflects our commitment to purity and transparency.
          </p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              Explore Our Collection <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Why Choose Papa Honey?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Honesty, transparency, and consistency — every jar reflects our hands-on harvesting approach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Raw & Minimally Processed",
                description: "We avoid excessive heating to preserve enzymes, aroma, and nutrients.",
                icon: Leaf,
              },
              {
                title: "Producer-Driven Quality",
                description: "We harvest ourselves, ensuring full control from apiary to jar.",
                icon: Shield,
              },
              {
                title: "Affordable Purity",
                description: "Our mission is to make pure Himalayan honey accessible without compromising quality.",
                icon: Star,
              },
            ].map((item, i) => (
              <Card key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
    {showScrollTop && (
      <button
        className="fixed bottom-6 right-6 z-[9999] h-10 w-10 flex items-center justify-center rounded-full bg-amber-600 text-white shadow-lg hover:bg-amber-700 transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        data-testid="button-scroll-top"
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    )}
    </>
  );
}
