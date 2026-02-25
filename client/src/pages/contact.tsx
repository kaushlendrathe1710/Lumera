import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { useEffect } from "react";

export default function Contact() {
  useEffect(() => {
    // scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <PageLayout className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about our honey or want to place a wholesale order? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Location</h3>
                <p className="text-muted-foreground">Punjab, India</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Email</h3>
                <a href="mailto:kaushlendra.k12@fms.edu" className="text-primary hover:underline break-all">
                  kaushlendra.k12@fms.edu
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Phone</h3>
                <a href="tel:+919650503696" className="text-primary hover:underline">
                  +91 9650503696
                </a>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">About Our Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                We are a producer-led brand sourcing and harvesting Himalayan multiflora honey directly from the
                Southern Himalayan regions. Whether you're interested in wholesale inquiries, have questions about
                our products, or need more information about our harvesting practices, feel free to reach out via
                email or phone. We're here to help!
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
  );
}
