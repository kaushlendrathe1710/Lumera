import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Instagram, Music } from "lucide-react";
import type { ContactDetail } from "@shared/schema";

export function Footer() {
  const { data: contacts } = useQuery<ContactDetail[]>({ queryKey: ["/api/contact-details"], queryFn: () => fetch("/api/contact-details").then((r) => r.json()) });
  return (
    <footer className="bg-sidebar border-t py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <div className="w-20 h-20 flex items-center justify-center">
                <img src="/logo.png" className="mix-blend-difference" alt="Lumera Logo" />
              </div>
              {/* <span className="font-serif text-xl font-bold">Lumera</span> */}
            </div>
            <p className="text-sm text-muted-foreground">
              A quite luxury, spoken through scent.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">Products</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shipping" className="hover:text-foreground transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-foreground transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>UAE</li>
            </ul>
          </div>
        </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-2 flex-wrap">
            {contacts && contacts.length > 0 ? (
              contacts.map((c) => {
                const key = c.id;
                const platform = c.platform;
                const Icon = platform === "instagram" ? Instagram : platform === "phone" ? Phone : platform === "email" ? Mail : Music;
                return (
                  <a key={key} href={c.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Icon className="h-4 w-4" />
                    <span>{c.displayText}</span>
                  </a>
                );
              })
            ) : (
              <>
                <a href="mailto:kaushlendra.k12@fms.edu" className="hover:text-foreground transition-colors">kaushlendra.k12@fms.edu</a>
                <a href="tel:+919650503696" className="hover:text-foreground transition-colors">+91 9650503696</a>
              </>
            )}
          </div>
          <p>&copy; 2026 Lumera. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
