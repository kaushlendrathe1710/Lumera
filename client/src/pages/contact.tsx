import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone, Instagram, Music } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ContactDetail } from "@shared/schema";

export default function Contact() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const { data: contacts } = useQuery<ContactDetail[]>({ queryKey: ["/api/contact-details"], queryFn: () => fetch("/api/contact-details").then((r) => r.json()) });

  return (
    <PageLayout className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about our fragrances or want to place a wholesale order? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Location</h3>
                <p className="text-muted-foreground">Dubai, Al-khawaneej</p>
              </CardContent>
            </Card>

            {contacts && contacts.length > 0 ? (
              contacts.slice(0,2).map((c) => {
                const Icon = c.platform === "instagram" ? Instagram : c.platform === "phone" ? Phone : c.platform === "email" ? Mail : Music;
                return (
                  <Card key={c.id} className="border-2 hover:border-primary transition-colors">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <a href={c.link} className="text-primary hover:underline break-all">{c.displayText}</a>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <>
              </>
            )}
          </div>

          <Card className="border-2">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">About Our Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lumera is a boutique perfume house focused on crafting refined fragrances from responsibly sourced
                and high-quality ingredients. Whether you're interested in wholesale inquiries, have questions about
                our fragrances, or need more information about our sourcing and production, feel free to reach out via
                email or phone. We're here to help!
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
  );
}
