import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  RefreshCw,
  Phone,
  Mail,
} from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ContactDetail } from "@shared/schema";

export default function ReturnsPage() {
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    // scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

    const { data: contacts } = useQuery<ContactDetail[]>({ queryKey: ["/api/contact-details"], queryFn: () => fetch("/api/contact-details").then((r) => r.json()) });

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="bg-primary text-primary-foreground p-8 md:p-12 lg:p-16 rounded-2xl shadow-xl mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Returns & Refunds
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90">
              Learn about our return, refund, policies for Lumera products
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="mb-8 text-muted-foreground">
            <p className="text-base md:text-lg leading-relaxed">
              All sales made through Luméra are final. No refunds will be issued.
            </p>
          </div>

          {/* Policy Details */}
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
              Return & Refund Policy
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                    <RefreshCw size={20} className="text-primary" />
                    Return & Refund Policy
                  </h3>
                  <p className="text-sm">
                    All sales made through Luméra are final. No returns or refunds will be issued.
                  </p>
                </CardContent>
              </Card>
            </div>
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
                      How do I initiate a return for my order?
                  </h3>
                    <p className="text-sm text-muted-foreground">
                    Log in to your Lumera account, go to "My Orders", select the
                    item you want to return, and click on "Return". Make sure the
                    bottle is unopened with the seal intact. Follow the instructions to complete your return request.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                      Can I return a perfume if I've opened the bottle?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No. All sales are final and returns are not accepted. If you received a damaged or defective product, contact us within 48 hours with photos and we'll review the issue.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <HelpCircle size={18} className="text-primary" />
                      What if my product arrived damaged?
                  </h3>
                    <p className="text-sm text-muted-foreground">
                    If your perfume bottle arrives broken or damaged, do NOT accept the delivery.
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
                    Refunds are not provided. All sales made through Luméra are final.
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
                    No, orders cannot be cancelled once they are shipped. However, you can refuse delivery or initiate a return after receiving the product if the bottle is unopened. For urgent concerns, contact our customer service team immediately.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Support */}
          <Card className="border-2 bg-muted/50">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold mb-3">
                Need any help contact us
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our Lumera customer service team is available to assist you with
                any questions about returns, refunds, or cancellations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowContact(true)}
                >
                  Contact Support
                </Button>
                {contacts && contacts.length > 0 && contacts.filter(c => c.platform === "phone").length > 0 && (
                  <a href={`${contacts.find(c => c.platform === "phone")?.link}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                      <Phone className="mr-2" />
                      {contacts.find(c => c.platform === "phone")?.displayText || "Call Us"}
                    </Button>
                  </a>
                )}

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
                  {contacts && contacts.length > 0 && contacts.filter(c => c.platform === "email").length > 0 && (
                  <a href={`${contacts.find(c => c.platform === "email")?.link}`} className="w-full sm:w-auto">
                      {contacts.find(c => c.platform === "email")?.displayText || "Email Us"}
                  </a>
                )}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  {contacts && contacts.length > 0 && contacts.filter(c => c.platform === "phone").length > 0 && (
                  <a href={`${contacts.find(c => c.platform === "phone")?.link}`} className="w-full sm:w-auto">
                      {contacts.find(c => c.platform === "phone")?.displayText || "Call Us"}
                  </a>
                )}
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
