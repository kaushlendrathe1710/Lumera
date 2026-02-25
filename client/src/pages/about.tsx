import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Leaf, Award } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    // scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <PageLayout className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">About Lumera</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Artisanal perfumes crafted with care — designed to evoke memory and emotion
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-8 md:p-12 text-muted-foreground prose prose-lg max-w-none">
              <p>
                Lumera is a boutique perfume house dedicated to crafting refined fragrances from high-quality,
                responsibly sourced ingredients. Built on craftsmanship and attention to detail, Lumera focuses on
                composition, longevity, and an elevated sensory experience.
              </p>

              <h2 className="font-bold text-foreground">Hands-on Harvesting & Quality</h2>
              <p>
                We are not merely distributors — we are directly involved in the harvesting and sourcing process, allowing
                us to maintain strict control over quality at every stage. From the selection of floral regions to final
                packaging, our focus remains on preserving honey in its most natural and unaltered form.
              </p>

              <h2 className="font-bold text-foreground">Carefully Sourced Ingredients</h2>
              <p>
                Lumera sources premium essential oils, absolutes, and aroma molecules from trusted suppliers. Our
                ingredients are chosen for their scent profile, sustainability, and consistency, and each batch is
                blended to preserve the character of the raw materials.
              </p>

              <h2 className="font-bold text-foreground">About Our Fragrances</h2>
              <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Sourced from trusted growers and suppliers</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Premium natural and nature-identical ingredients</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Ethically sourced and quality-checked</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Rigorous quality control and stability testing</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Distinctive scent profiles and lasting character</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="font-bold text-foreground">Why Choose Lumera</h2>
              <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">A sensory experience crafted for longevity and balance</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">Signature blends that evolve beautifully on skin</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">Carefully curated ingredients for depth and nuance</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">Designed for everyday elegance and special occasions alike</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">Transparent ingredient sourcing; no unnecessary additives</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="font-bold text-foreground">Our Mission</h2>
              <p>
                Our mission is to create meaningful fragrances that resonate. We combine traditional
                perfumery techniques with modern sensibilities to produce scents that feel personal and
                well-crafted.
              </p>

              <p>
                Lumera is more than a product — it is an invitation to experience thoughtfully composed
                perfumes designed to become part of your story.
              </p>

              <div className="mt-6">
                <Link href="/products">
                  <Button size="lg" className="gap-2">
                    Shop Lumera <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
  );
}
