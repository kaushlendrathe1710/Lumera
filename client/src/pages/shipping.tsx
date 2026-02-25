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
                At Papa Honey, we're committed to delivering your orders quickly, safely, and reliably. We offer various
                shipping options to meet your needs and partner with trusted logistics providers to ensure your pure
                Himalayan honey reaches you in perfect condition.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                We offer FREE delivery on all orders across UAE. There are no hidden charges or minimum order
                requirements. We believe pure Himalayan honey should be accessible to everyone, so we've eliminated
                delivery fees completely.
              </p>
            </CardContent>
          </Card>

          {/* Shipping Options */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Shipping Options</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Standard Shipping */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Standard Delivery</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Our standard shipping option. Available across the United Arab Emirates with reliable delivery.
                            </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-foreground">2-4 business days</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-foreground font-semibold">FREE for all orders</span>
                    </div>
                    <p className="text-xs text-muted-foreground">No minimum order value required</p>
                  </div>
                </CardContent>
              </Card>

              {/* Express Delivery */}
              <Card className="border-2 border-primary hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className="bg-primary">Popular</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Express Delivery</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Get your order delivered by the next business day. Available for select areas in major cities.
                            </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-foreground">Next day delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-foreground font-semibold">FREE for all orders</span>
                    </div>
                    <p className="text-xs text-muted-foreground">No membership required</p>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Delivery */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Scheduled Delivery</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select your preferred delivery date and time slot. Ideal for gifts for special occasions.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-foreground">Choose your delivery date</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-foreground font-semibold">FREE for all orders</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Available in select metro cities</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Shipping Coverage */}
          <div>
            <p className="text-muted-foreground">
              We currently deliver across the United Arab Emirates, covering all seven emirates and most areas.
            </p>
            <div className="flex items-start gap-3 mb-6">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Domestic Shipping</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-3">Emirates Coverage</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground mb-4">
                        <li>Dubai</li>
                        <li>Abu Dhabi</li>
                        <li>Sharjah</li>
                        <li>Ajman</li>
                        <li>Ras Al Khaimah</li>
                        <li>Fujairah</li>
                        <li>Umm Al Quwain</li>
                      </ul>
                      <div className="pt-3 border-t space-y-1">
                        <p className="text-xs text-foreground font-medium">Delivery in 1-4 business days depending on location</p>
                        <p className="text-xs text-muted-foreground">Most shipping options available across major urban areas</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-3">Other Areas</h4>
                      <p className="text-sm text-muted-foreground mb-4">Delivery is available across the UAE, including outlying and suburban areas. Some remote locations may experience longer delivery times or limited shipping options.</p>
                      <div className="pt-3 border-t space-y-1">
                        <p className="text-xs text-foreground font-medium">Delivery times vary by location</p>
                        <p className="text-xs text-muted-foreground">For specific area availability and timelines, contact our customer service.</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Some remote locations may have longer delivery times and limited shipping options.
                    For specific area availability, please contact our customer service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Order Tracking</h2>
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Track Your Order</h3>
                <p className="text-muted-foreground mb-6">
                  You can easily track your order status and shipment location through:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium">Your Account</p>
                      <p className="text-sm text-muted-foreground">Check "My Orders" section in your Papa Honey account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Order tracking link in your confirmation email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium">SMS Updates</p>
                      <p className="text-sm text-muted-foreground">Notifications to your registered mobile number</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium">Customer Support</p>
                      <p className="text-sm text-muted-foreground">Contact us for real-time order status</p>
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
                    <p className="text-sm text-foreground">Special packaging ensures honey jars arrive safely</p>
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
