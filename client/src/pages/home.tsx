import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star, Shield, Leaf, ChevronRight, ArrowRight, Package, ArrowUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import type { ProductWithCategory as Product } from "@shared/schema";
import heroImage from "@/assets/images/hero.jpg";
import hero2 from "@/assets/images/hero-2.jpg";

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

      <section className="relative w-full h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
            <img
            src={heroImage}
            alt="Signature perfume collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" />
        </div>
      </section>

      <section id="featured-products" className="py-16 md:py-24 bg-royal">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-50 mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-200">Our most popular perfume selections</p>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="gap-2 text-white" data-testid="link-view-all">
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
                <Card key={product.id} className="overflow-hidden bg-transparent group transition-all duration-300 hover:-translate-y-1 border-none" data-testid={`card-product-${product.id}`}>
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-transparent">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-transparent">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-white mb-1 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-400 mb-1">
                      {product.category?.name || "Uncategorized"}
                    </p>
                    {ratingsMap.get(product.id) && (
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= Math.round(ratingsMap.get(product.id)!.avgRating) ? "fill-primary text-primary" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-300">({ratingsMap.get(product.id)!.reviewCount})</span>
                      </div>
                        )}
                        </div>
                    {product.discountPercent && product.discountPercent > 0 && (
                      <Badge variant="destructive">
                        {product.discountPercent}% OFF
                      </Badge>
                      )}
                      </div>
                    <div className="flex items-center justify-center mt-3">
                      <div>
                        {product.discountPercent && product.discountPercent > 0 ? (
                          <>
                            <span className="text-lg font-bold text-white">
                              {(parseFloat(product.price) * (1 - product.discountPercent / 100)).toFixed(2)} AED
                            </span>
                            <span className="text-sm text-gray-300 line-through ml-2">
                              {parseFloat(product.price).toFixed(2)} AED
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-white">
                            {parseFloat(product.price).toFixed(2)} AED
                          </span>
                        )}
                      </div>
                      {/* {cartItems.some(item => item.product.id === product.id) ? (
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
                      )} */}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-300">No products available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative h-[70vh] py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero2}
            alt="Lumera Hero Image 2"
            className="w-full h-full object-cover"
          />
          {/* <div className="absolute inset-0 bg-black/60" /> */}
        </div>
        {/* <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Artisanal Fragrance Blends
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
            Our perfumes are crafted from carefully selected ingredients sourced from trusted
            growers and partners. Each fragrance is blended and matured to achieve depth, balance,
            and long-lasting character.
          </p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              Explore Our Collection <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div> */}
      </section>

      <section className="py-16 md:py-24 bg-royal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              Why Choose Lumera?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Craftsmanship, transparency, and enduring quality — every bottle reflects our
              dedication to exceptional perfumery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Artisanal Blends",
                description: "Handcrafted compositions focused on balance and longevity.",
                icon: Leaf,
              },
              {
                title: "Sustainably Sourced",
                description: "We partner with trusted suppliers for high-quality raw materials.",
                icon: Shield,
              },
              {
                title: "Luxury Within Reach",
                description: "Premium fragrances thoughtfully priced for everyday elegance.",
                icon: Star,
              },
            ].map((item, i) => (
              <Card key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-royal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-royal" />
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
        className="fixed bottom-6 right-6 z-[9999] h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
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
