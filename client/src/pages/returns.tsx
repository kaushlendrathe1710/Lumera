import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Clock,
  PackageOpen,
  Phone,
  Mail,
} from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { useEffect } from "react";

export default function ReturnsPage() {
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    // scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="bg-primary text-primary-foreground p-8 md:p-12 lg:p-16 rounded-2xl shadow-xl mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Returns & Cancellations
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90">
              Learn about our return, refund, and cancellation policies for Papa Honey products
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="mb-8 text-muted-foreground">
            <p className="text-base md:text-lg leading-relaxed">
              At Papa Honey, we want you to be completely satisfied with your purchase of pure
              Himalayan honey. If you're not happy with your order for any reason, we offer
              easy returns, refunds, and cancellations as part of our customer satisfaction commitment.
            </p>
          </div>

          {/* Policy Details */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Return & Cancellation Policy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <RefreshCw size={20} className="text-primary" />
                    Return Policy
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Unopened honey jars can be returned within 7 days of delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Jars must be sealed with original tamper-proof seal intact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Product must be in original packaging with all labels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Opened honey jars cannot be returned (food safety reasons)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Damaged/defective products: Full refund or replacement within 7 days</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <Clock size={20} className="text-primary" />
                    Cancellation Policy
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Orders can be cancelled within 2 hours of placement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Instant refund to original payment method for prepaid orders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>No cancellation charges before packaging begins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <span>Orders cannot be cancelled after packaging/shipping</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>For bulk orders, contact customer service for cancellations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              How to Return or Cancel Your Order
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Initiate Request</h4>
                <p className="text-sm text-muted-foreground">
                  Go to "My Orders" and select the item to return or cancel
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">Choose Reason</h4>
                <p className="text-sm text-muted-foreground">
                  Select the reason for return or cancellation
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Pickup/Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Wait for pickup or drop at nearest center (returns only)
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <h4 className="font-semibold mb-2">Refund</h4>
                <p className="text-sm text-muted-foreground">
                  Get refund after verification (5-7 business days)
                </p>
              </div>
            </div>
          </div>

          {/* Refund Timeline */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Refund Timeline
            </h2>
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">UPI / Net Banking</h4>
                      <p className="text-sm text-muted-foreground">3-5 business days after return approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Credit / Debit Card</h4>
                      <p className="text-sm text-muted-foreground">5-7 business days after return approval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Cash on Delivery</h4>
                      <p className="text-sm text-muted-foreground">7-10 business days (refunded to bank account)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                    How do I initiate a return for my honey order?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Log in to your Papa Honey account, go to "My Orders", select the
                    honey jar you want to return, and click on "Return". Make sure the
                    jar is unopened with the seal intact. Follow the instructions to
                    complete your return request.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                    Can I return honey if I've opened the jar?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No, opened honey jars cannot be returned due to food safety and
                    hygiene regulations. However, if you received a damaged or defective
                    product, contact us within 48 hours with photos and we'll arrange
                    a replacement or refund.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                    What if my honey jar arrived damaged?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    If your honey jar arrives broken or damaged, do NOT accept the
                    delivery. Take photos immediately and contact us at
                    kaushlendra.k12@fms.edu or call +91 9650503696 within 48 hours.
                    We'll send a replacement with priority shipping at no cost.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                    How long does it take to get my refund?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Refunds are processed within 5-7 business days after the returned
                    item is received and verified at our facility. The timeline depends
                    on your payment method: UPI/Net Banking (3-5 days), Cards (5-7 days),
                    COD (7-10 days to bank account).
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                    Can I cancel my order after it's been shipped?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No, orders cannot be cancelled once they are shipped. However, you
                    can refuse delivery or initiate a return after receiving the product
                    if the jar is unopened. For urgent concerns, contact our customer
                    service team immediately.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                    What about bulk orders or wholesale returns?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    For bulk orders (10+ jars) or wholesale purchases, please contact
                    our customer service team directly at kaushlendra.k12@fms.edu or
                    +91 9650503696 for customized return and cancellation arrangements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Support */}
          <Card className="border-2 bg-muted/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3">
                Need Help With Returns or Cancellations?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our Papa Honey customer service team is available to assist you with
                any questions about returns, refunds, or cancellations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowContact(true)}
                >
                  Contact Support
                </Button>
                <Button asChild>
                  <a href="tel:+919650503696">
                    Call +91 9650503696
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
          <Card className="max-w-sm w-full">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold mb-6">Customer Service</h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <a
                    href="mailto:kaushlendra.k12@fms.edu"
                    className="text-primary hover:underline"
                  >
                    kaushlendra.k12@fms.edu
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <a
                    href="tel:+919650503696"
                    className="text-primary hover:underline"
                  >
                    +91 9650503696
                  </a>
                </div>
              </div>
              <Button onClick={() => setShowContact(false)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}
