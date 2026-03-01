import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Zap, Calendar, MapPin, Clock, CheckCircle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/page-layout";
import { useEffect } from "react";

export default function Shipping() {

  useEffect(() => {
    // scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <PageLayout className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Shipping & Delivery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Information about our shipping options, delivery times, and policies
          </p>
        </div>

        {/* Intro Card */}
        <Card className="border-2">
          <CardContent className="p-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Lumera, we're committed to delivering your orders quickly, safely, and reliably. We offer a range of
              shipping options and partner with trusted logistics providers to ensure your perfumes arrive in perfect condition.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              We offer FREE delivery on all orders across UAE. There are no hidden charges or minimum order
              requirements. We want Lumera fragrances to be accessible while ensuring careful handling for each package.
            </p>
          </CardContent>
        </Card>

        {/* Order Tracking */}
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Order Tracking</h2>
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact us in instagram or WhatsApp</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipping Policies */}
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Shipping Policies</h2>
          <Card className="border-2">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Our Policies</h3>
              <p className="text-muted-foreground mb-6">
                Key points about our shipping policies:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">Order processing typically takes 1-2 business days</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">Business days exclude weekends and national holidays</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">Delivery times are estimates and may vary</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">Orders may be delivered in multiple shipments</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">Special packaging ensures perfume bottles arrive safely</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">Signature may be required for delivery</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="border-2 bg-primary/5">
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Need Help With Shipping?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our customer service team is available to assist you with any questions about shipping options,
              delivery times, or tracking your order.
            </p>
            <Link href="/contact">
              <Button size="lg" className="gap-2">
                Contact Customer Service
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
