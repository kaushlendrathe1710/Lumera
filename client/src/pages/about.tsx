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
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">About Papa Honey</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pure, Raw, Organic Himalayan Honey — Delivered Exactly as Nature Intended
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-8 md:p-12 text-muted-foreground prose prose-lg max-w-none">
              <p>
                Papa Honey is an Indian-origin honey brand operating under licensed ownership of Kaushal Ranjeet Pvt.
                Ltd. Built on the belief that purity is not just a promise but a foundation, Papa Honey is dedicated to
                delivering authentic, raw, organic, and responsibly sourced Himalayan honey.
              </p>

              <h2 className="font-bold text-foreground">Hands-on Harvesting & Quality</h2>
              <p>
                We are not merely distributors — we are directly involved in the harvesting and sourcing process, allowing
                us to maintain strict control over quality at every stage. From the selection of floral regions to final
                packaging, our focus remains on preserving honey in its most natural and unaltered form.
              </p>

              <h2 className="font-bold text-foreground">Nature’s Goodness, Just as It Is</h2>
              <p>
                Papa Honey offers Raw Organic Himalayan Honey, sourced from the Southern Himalayan regions, where diverse
                natural flora contribute to its rich taste, aroma, and golden color. The honey is minimally processed,
                ensuring that its natural enzymes, antioxidants, and nutritional characteristics remain intact. No artificial
                chemicals, additives, or refined sugars are introduced at any stage.
              </p>

              <h2 className="font-bold text-foreground">About Our Honey</h2>
              <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Sourced from Southern Himalayan region</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">100% raw and organic Himalayan honey</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Chemical-free and naturally harvested</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Lab tested for quality and purity</h3>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Naturally golden in color and rich in flavor</h3>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="font-bold text-foreground">Why Choose Papa Honey</h2>
              <div className="grid md:grid-cols-2 gap-4 not-prose my-6">
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">A natural source of energy</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">A healthier alternative to refined sugar</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">Contains naturally occurring enzymes and antioxidants</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">Traditionally valued for supporting general wellness</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground">Free from added chemicals, preservatives, or artificial processing</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="font-bold text-foreground">Our Mission</h2>
              <p>
                Our mission is simple: to bring nature’s finest honey to every home at an affordable price, without
                compromising purity or authenticity. We believe that honest sourcing, transparent practices, and responsible
                harvesting are essential to building long-term trust.
              </p>

              <p>
                Papa Honey is more than just honey — it is nature’s goodness in a jar, delivered exactly the way honey is
                meant to be.
              </p>

              <div className="mt-6">
                <Link href="/products">
                  <Button size="lg" className="gap-2">
                    Shop Papa Honey <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
  );
}
