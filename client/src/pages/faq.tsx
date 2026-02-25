import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Package,
  CreditCard,
  Shield,
  HelpCircle,
  Droplet,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/page-layout";
import { useEffect } from "react";

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  useEffect(() => {
    // scroll to top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Helper to filter accordion items by search
  function filterAccordionItems(
    items: Array<{ question: string; answer: React.ReactNode }>
  ) {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        (typeof item.answer === "string"
          ? item.answer.toLowerCase().includes(q)
          : false)
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="bg-primary text-primary-foreground p-8 md:p-12 lg:p-16 rounded-2xl shadow-xl mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90">
              Everything you need to know about our pure Himalayan honey
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for questions..."
                className="pl-12 py-6 text-base rounded-xl border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <Tabs defaultValue="orders" className="w-full mb-10">
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 min-w-max rounded-xl">
                <TabsTrigger
                  value="orders"
                  className="flex items-center gap-2 text-sm rounded-lg"
                >
                  <Package size={16} />
                  <span>Orders</span>
                </TabsTrigger>
                <TabsTrigger
                  value="product"
                  className="flex items-center gap-2 text-sm rounded-lg"
                >
                  <Droplet size={16} />
                  <span>Product</span>
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="flex items-center gap-2 text-sm rounded-lg"
                >
                  <CreditCard size={16} />
                  <span>Payments</span>
                </TabsTrigger>
                <TabsTrigger
                  value="returns"
                  className="flex items-center gap-2 text-sm rounded-lg"
                >
                  <Package size={16} />
                  <span>Returns</span>
                </TabsTrigger>
                <TabsTrigger
                  value="account"
                  className="flex items-center gap-2 text-sm rounded-lg"
                >
                  <User size={16} />
                  <span>Account</span>
                </TabsTrigger>
                <TabsTrigger
                  value="health"
                  className="flex items-center gap-2 text-sm rounded-lg"
                >
                  <Shield size={16} />
                  <span>Health</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                    <Package size={24} />
                    Orders & Delivery
                  </h2>
                  {(() => {
                    const items = [
                      {
                        question: "How do I track my honey order?",
                        answer: `You can track your order by logging into your Papa Honey account and going to 'My Orders'. Click on the order you want to track to see real-time updates on its status and expected delivery date. You'll also receive SMS and email notifications at each stage of delivery.`,
                      },
                      {
                        question: "When will I receive my order?",
                        answer: `Delivery times vary by location. The estimated delivery date is shown at checkout and in your order confirmation email. All honey is freshly packed before dispatch to ensure maximum freshness.`,
                      },
                      {
                        question: "Do you deliver across the UAE?",
                        answer: `Yes! We deliver our pure Himalayan honey across the United Arab Emirates. The estimated delivery date is shown at checkout and in your order confirmation email.`,
                      },
                      {
                        question: "Can I modify or cancel my order?",
                        answer: `You can modify or cancel your order within 2 hours of placing it by going to 'My Orders' and clicking 'Cancel Order'. After packaging begins, cancellation is not possible. In that case, you can refuse delivery or request a return once you receive the product. For bulk orders, please contact our customer service team.`,
                      },
                      {
                        question: "Is delivery free?",
                        answer: `We offer FREE delivery on all orders across UAE. There are no hidden charges or minimum order requirements. We believe pure Himalayan honey should be accessible to everyone, so we've eliminated delivery fees completely.`,
                      },
                      {
                        question: "How is the honey packaged for delivery?",
                        answer: `Our honey is packed in food-grade glass jars with tamper-proof seals. Each jar is wrapped in bubble wrap and placed in a sturdy corrugated box with cushioning material. For summer months, we use additional insulation to prevent heat exposure. All packages are sealed with Papa Honey branded tape for authenticity.`,
                      },
                    ];
                    const filtered = filterAccordionItems(items);
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center text-muted-foreground py-8">
                          No matching questions found.
                        </div>
                      );
                    }
                    return (
                      <Accordion type="single" collapsible className="w-full">
                        {filtered.map((item, idx) => (
                          <AccordionItem value={`item-${idx + 1}`} key={item.question}>
                            <AccordionTrigger className="text-left">
                              {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground whitespace-pre-line">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    );
                  })()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product & Quality Tab */}
            <TabsContent value="product">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                    <Droplet size={24} />
                    Product & Quality
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left">
                        What makes Papa Honey different from other brands?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Papa Honey is sourced directly from beekeepers in the Southern Himalayas. Our honey is:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>100% Raw & Unprocessed:</strong> Never heated or filtered</li>
                          <li><strong>Chemical-Free:</strong> No antibiotics, pesticides, or additives</li>
                          <li><strong>Lab-Tested:</strong> Every batch is tested for purity and quality</li>
                          <li><strong>Producer-Harvested:</strong> Direct from beekeepers, no middlemen</li>
                          <li><strong>Minimally Handled:</strong> From hive to jar in minimal steps</li>
                        </ul>
                        <p className="mt-3">We maintain complete transparency in our sourcing and processing methods.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Is your honey raw or processed?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Our honey is 100% raw and unprocessed. This means:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li>Never heated above hive temperature (95°F/35°C)</li>
                          <li>Not ultra-filtered (retains pollen, propolis, and enzymes)</li>
                          <li>No pasteurization or sterilization</li>
                          <li>Contains all natural enzymes, vitamins, and minerals</li>
                          <li>May crystallize naturally (sign of pure, raw honey)</li>
                        </ul>
                        <p className="mt-3">Raw honey preserves all the beneficial properties that are destroyed in commercial processing.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Why does the honey crystallize or turn solid?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Crystallization is a natural process and actually proves your honey is pure and raw! It happens because:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li>Natural glucose in honey forms crystals over time</li>
                          <li>Temperature changes accelerate crystallization</li>
                          <li>Raw, unfiltered honey crystallizes faster (a good sign!)</li>
                        </ul>
                        <p className="mt-3"><strong>To liquefy crystallized honey:</strong> Place the jar in warm water (not boiling) for 10-15 minutes, or leave it at room temperature. Never microwave as it destroys beneficial enzymes. Crystallized honey is perfectly safe to eat and has the same nutritional value.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do you test honey purity?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Every batch of Papa Honey undergoes rigorous lab testing:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>FSSAI Certified Labs:</strong> All testing done at government-approved facilities</li>
                          <li><strong>Purity Tests:</strong> Check for sugar adulteration, added syrups</li>
                          <li><strong>Moisture Content:</strong> Ensures proper ripeness and shelf life</li>
                          <li><strong>HMF Levels:</strong> Confirms honey hasn't been heated</li>
                          <li><strong>Enzyme Activity:</strong> Verifies raw, unprocessed status</li>
                          <li><strong>Antibiotic Residue:</strong> Tests for chemical contamination</li>
                        </ul>
                        <p className="mt-3">We share lab reports with customers upon request. Every jar has a batch number for traceability.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        What is the shelf life of your honey?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Honey never spoils! Archaeological discoveries have found 3,000-year-old honey still perfectly edible. Our honey:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>Best Before:</strong> 24 months from packaging date (marked on jar)</li>
                          <li><strong>Actual Shelf Life:</strong> Indefinite when stored properly</li>
                          <li><strong>Storage:</strong> Keep in a cool, dry place away from direct sunlight</li>
                          <li><strong>After Opening:</strong> No refrigeration needed, keeps indefinitely</li>
                        </ul>
                        <p className="mt-3">The "best before" date is a legal requirement, but honey's natural antimicrobial properties prevent spoilage.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Do you have organic certification?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>While we follow organic practices, obtaining official organic certification for honey in India is complex due to:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li>Bees travel up to 5 km radius (difficult to certify entire foraging area)</li>
                          <li>Wild Himalayan flora (not cultivated farmland)</li>
                          <li>Remote location challenges</li>
                        </ul>
                        <p className="mt-3">However, our honey is:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                          <li>Sourced from pristine, chemical-free Himalayan regions</li>
                          <li>Lab-tested for zero pesticide/antibiotic residue</li>
                          <li>Produced by bees foraging on wild, untreated flowers</li>
                          <li>FSSAI certified and compliant</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                    <CreditCard size={24} />
                    Payments & Pricing
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        What payment methods do you accept?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>We accept all major payment methods for your convenience:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li>Credit Cards (Visa, MasterCard, American Express, RuPay)</li>
                          <li>Debit Cards (all major banks)</li>
                          <li>UPI (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
                          <li>Net Banking (all major banks)</li>
                          <li>Digital Wallets (Paytm, MobiKwik, Amazon Pay)</li>
                          <li>Cash on Delivery (available in select areas)</li>
                        </ul>
                        <p className="mt-3">All payments are processed through secure, encrypted payment gateways.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Is it safe to make payments on Papa Honey?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Absolutely! Your payment security is our priority:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li>SSL encryption for all transactions</li>
                          <li>PCI DSS compliant payment gateways</li>
                          <li>We never store your CVV or complete card details</li>
                          <li>Two-factor authentication for added security</li>
                          <li>Secure tokenization as per RBI guidelines</li>
                        </ul>
                        <p className="mt-3">Your financial information is never shared with third parties.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        When will my payment be charged?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>For prepaid orders (card, UPI, wallet), your payment is charged immediately when you place the order. For Cash on Delivery orders, payment is collected at the time of delivery.</p>
                        <p className="mt-3">If your order is canceled or unavailable, refunds are processed within 5-7 business days to your original payment method.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Do you offer bulk purchase discounts?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Yes! We offer special pricing for bulk orders:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li>5+ jars: 5% discount</li>
                          <li>10+ jars: 10% discount</li>
                          <li>20+ jars: 15% discount</li>
                          <li>Corporate/Gifting orders: Custom pricing available</li>
                        </ul>
                        <p className="mt-3">For bulk orders above 50 jars or corporate gifting, please contact us at kaushlendra.k12@fms.edu or call +91 9650503696 for customized quotes.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do I get an invoice?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Your GST invoice is automatically generated and available:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li>In your account under "My Orders" section</li>
                          <li>Sent to your registered email address</li>
                          <li>Included as a physical copy in your package</li>
                          <li>Available for download as PDF</li>
                        </ul>
                        <p className="mt-3">The invoice includes all details for expense claims and tax purposes.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Returns Tab */}
            <TabsContent value="returns">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                    <Package size={24} />
                    Returns & Refunds
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        What is your return policy?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>We want you to be completely satisfied with your honey purchase. Our return policy:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>Damaged/Defective Products:</strong> 7 days from delivery for replacement or full refund</li>
                          <li><strong>Quality Issues:</strong> If you're not satisfied with the honey quality, contact us within 7 days</li>
                          <li><strong>Wrong Item Delivered:</strong> Immediate replacement or refund</li>
                          <li><strong>Unopened Products:</strong> 7 days return window for unopened jars</li>
                        </ul>
                        <p className="mt-3">Note: Opened honey jars cannot be returned unless there's a quality issue. This is for hygiene and food safety reasons.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do I initiate a return?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>To return a product:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Log in to your Papa Honey account</li>
                          <li>Go to "My Orders"</li>
                          <li>Select the order you want to return</li>
                          <li>Click "Return/Replace" button</li>
                          <li>Select the reason for return (with photos if damaged)</li>
                          <li>Choose refund or replacement</li>
                          <li>Schedule a pickup or drop-off</li>
                        </ol>
                        <p className="mt-3">Our team will review your request within 24 hours and arrange pickup if approved.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        When will I receive my refund?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Refund processing times vary by payment method:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li>UPI/Bank Transfer: 3-5 business days</li>
                          <li>Credit/Debit Card: 5-7 business days</li>
                          <li>Digital Wallets: 2-3 business days</li>
                          <li>Cash on Delivery: 7-10 business days to bank account</li>
                        </ul>
                        <p className="mt-3">Refunds are processed after we receive and inspect the returned product. You'll receive email confirmation at each stage.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        What if my honey jar arrived damaged?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>If your honey jar arrives broken or damaged:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Do NOT accept the delivery if visible damage is present</li>
                          <li>Take photos of the damaged package immediately</li>
                          <li>Contact us within 48 hours at kaushlendra.k12@fms.edu or +91 9650503696</li>
                          <li>Share photos of the damage</li>
                          <li>We'll send a replacement immediately at no cost</li>
                        </ol>
                        <p className="mt-3">Damaged deliveries are replaced with priority shipping. No questions asked, no return required for damaged items.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Can I exchange my honey for a different variant?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>While we don't offer direct exchanges, you can:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Return the current product (unopened)</li>
                          <li>Receive a full refund</li>
                          <li>Place a new order for your preferred variant</li>
                        </ol>
                        <p className="mt-3">For bulk orders or special cases, contact our customer service team who may arrange direct exchanges. Call +91 9650503696 or email kaushlendra.k12@fms.edu.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                    <User size={24} />
                    Account & Profile
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do I create a Papa Honey account?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Creating an account is quick and easy:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Click "Login" at the top of the page</li>
                          <li>Enter your mobile number</li>
                          <li>Verify with the OTP sent to your phone</li>
                          <li>Add your name and email (optional)</li>
                          <li>Save your delivery address</li>
                        </ol>
                        <p className="mt-3">That's it! You can also checkout as a guest without creating an account.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do I reset my password?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Papa Honey uses OTP-based authentication for security. You don't need a password! Just:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Enter your registered mobile number on the login page</li>
                          <li>Click "Send OTP"</li>
                          <li>Enter the OTP received on your phone</li>
                          <li>You're logged in!</li>
                        </ol>
                        <p className="mt-3">This eliminates password management and provides better security.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do I update my delivery address?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>To update your delivery address:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Log in to your account</li>
                          <li>Go to "My Profile" or "Dashboard"</li>
                          <li>Click on "Addresses"</li>
                          <li>Add a new address or edit existing ones</li>
                          <li>Set your preferred default address</li>
                        </ol>
                        <p className="mt-3">You can save multiple addresses for home, office, or gifting purposes.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Can I change my registered mobile number?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Yes, to change your registered mobile number:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Log in to your account</li>
                          <li>Go to "My Profile"</li>
                          <li>Click "Edit" next to your mobile number</li>
                          <li>Enter your new number and verify with OTP</li>
                          <li>Both old and new numbers will receive confirmation</li>
                        </ol>
                        <p className="mt-3">For security reasons, this requires OTP verification on both numbers.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health & Usage Tab */}
            <TabsContent value="health">
              <Card className="border-2">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                    <Shield size={24} />
                    Health & Usage
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        What are the health benefits of raw honey?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Raw Himalayan honey offers numerous health benefits:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li><strong>Natural Energy:</strong> Quick, sustained energy from natural sugars</li>
                          <li><strong>Antioxidants:</strong> Protects cells from oxidative damage</li>
                          <li><strong>Antibacterial:</strong> Natural antimicrobial properties</li>
                          <li><strong>Digestive Health:</strong> Contains prebiotics and enzymes</li>
                          <li><strong>Immunity Boost:</strong> Rich in vitamins and minerals</li>
                          <li><strong>Cough Relief:</strong> Soothes throat and suppresses cough</li>
                          <li><strong>Wound Healing:</strong> Can be applied topically</li>
                        </ul>
                        <p className="mt-3">Note: These benefits are preserved in raw, unprocessed honey. Processed honey loses many beneficial enzymes and nutrients.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How much honey should I consume daily?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Recommended daily consumption varies by age and health status:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li><strong>Adults:</strong> 1-2 tablespoons (15-30g) per day</li>
                          <li><strong>Children (2+ years):</strong> 1 teaspoon per day</li>
                          <li><strong>Athletes:</strong> Up to 3 tablespoons for energy</li>
                          <li><strong>Weight Management:</strong> 1 tablespoon maximum</li>
                        </ul>
                        <p className="mt-3">Best consumed on an empty stomach in the morning or before sleep. Mix with warm (not hot) water or lemon for added benefits. Remember: Moderation is key - honey is still a sugar source.</p>
                        <p className="mt-2"><strong>Caution:</strong> Not suitable for infants under 1 year due to botulism risk.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Can diabetics consume honey?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        <p>Honey, including raw honey, contains natural sugars that affect blood glucose levels. For diabetics:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li><strong>Consult Your Doctor:</strong> Always check with your healthcare provider first</li>
                          <li><strong>Moderate Consumption:</strong> If approved, limit to 1 teaspoon per day</li>
                          <li><strong>Monitor Blood Sugar:</strong> Check levels after consumption</li>
                          <li><strong>Choose Raw:</strong> Raw honey has a lower glycemic index than processed honey</li>
                          <li><strong>Count Carbs:</strong> Include honey in your daily carbohydrate count</li>
                        </ul>
                        <p className="mt-3">Raw honey may have a slightly better effect on blood sugar compared to regular sugar, but it's still a carbohydrate and should be consumed cautiously by diabetics.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How should I store honey at home?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Proper storage ensures your honey stays fresh:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3">
                          <li><strong>Temperature:</strong> Room temperature (15-25°C) is ideal</li>
                          <li><strong>Container:</strong> Keep in original glass jar with tight lid</li>
                          <li><strong>Location:</strong> Cool, dry place away from sunlight</li>
                          <li><strong>No Refrigeration:</strong> Never refrigerate (causes faster crystallization)</li>
                          <li><strong>Dry Spoon:</strong> Always use a clean, dry spoon (moisture can cause fermentation)</li>
                          <li><strong>Sealed:</strong> Keep lid closed when not in use</li>
                        </ul>
                        <p className="mt-3">Properly stored honey never spoils. Crystallization is natural and doesn't mean the honey has gone bad.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Can I cook with raw honey?
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700">
                        <p>Yes, but with considerations:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>Best for:</strong> Cold/warm beverages, salad dressings, yogurt, smoothies</li>
                          <li><strong>Baking/Cooking:</strong> Can be used, but heat destroys beneficial enzymes</li>
                          <li><strong>Temperature:</strong> Heating above 40°C (104°F) reduces health benefits</li>
                          <li><strong>Alternative Use:</strong> Add honey after cooking/baking as a topping</li>
                          <li><strong>Substitution:</strong> Use 3/4 cup honey for 1 cup sugar (reduce liquid in recipe)</li>
                        </ul>
                        <p className="mt-3">For maximum health benefits, consume raw honey unheated. If cooking, use it for flavor but don't expect the same nutritional value as raw consumption.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Is raw honey safe for children?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p><strong>Important Safety Information:</strong></p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>NOT for infants under 12 months:</strong> Raw honey can contain Clostridium botulinum spores that may cause infant botulism</li>
                          <li><strong>Safe for children 1+ years:</strong> Their digestive system can handle the spores</li>
                          <li><strong>Recommended Amount:</strong> 1/2 to 1 teaspoon per day for children 1-5 years</li>
                          <li><strong>Benefits for Kids:</strong> Helps with cough, sore throat, wound healing</li>
                        </ul>
                        <p className="mt-3">Always supervise children when consuming honey and consult your pediatrician if you have concerns.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Support Section */}
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="text-center">
                <HelpCircle className="h-16 w-16 mx-auto text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">
                  Still have questions?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our Papa Honey team is here to help with any questions about our pure Himalayan honey.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="px-6 py-2 text-base"
                    >
                      Contact Us
                    </Button>
                  </Link>
                  <a href="tel:+919650503696">
                    <Button className="px-6 py-2 text-base">
                      Call: +91 9650503696
                    </Button>
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Email us at: kaushlendra.k12@fms.edu
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
