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
              Everything you need to know about Lumera fragrances
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
                        question: "How do I track my order?",
                        answer: `You can track your order by logging into your Lumera account and going to 'My Orders'. Click on the order you want to track to see real-time updates on its status and expected delivery date. You'll also receive SMS and email notifications at each stage of delivery.`,
                      },
                      {
                        question: "When will I receive my order?",
                        answer: `Delivery times vary by location. The estimated delivery date is shown at checkout and in your order confirmation email. All products are carefully packaged before dispatch to ensure safe delivery.`,
                      },
                      {
                        question: "Do you deliver across the UAE?",
                        answer: `Yes! We deliver Lumera fragrances across the United Arab Emirates. The estimated delivery date is shown at checkout and in your order confirmation email.`,
                      },
                      {
                        question: "Can I modify or cancel my order?",
                        answer: `You can modify or cancel your order within 2 hours of placing it by going to 'My Orders' and clicking 'Cancel Order'. After packaging begins, cancellation is not possible. In that case, you can refuse delivery or request a return once you receive the product. For bulk orders, please contact our customer service team.`,
                      },
                      {
                        question: "Is delivery free?",
                        answer: `We offer FREE delivery on all orders across UAE. There are no hidden charges or minimum order requirements.`,
                      },
                      {
                        question: "How are products packaged for delivery?",
                        answer: `Our perfumes are carefully packed in protective packaging with cushioning and protective inserts to prevent breakage. Boxes are sealed for authenticity and labeled with Lumera branding.`,
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
                        What makes Lumera different from other perfume brands?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Lumera focuses on craftsmanship, sustainable sourcing, and thoughtful composition. Our perfumes are:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>Artistically Composed:</strong> Blends built for balance and longevity</li>
                          <li><strong>Quality Ingredients:</strong> Carefully selected naturals and high-quality aroma materials</li>
                          <li><strong>Lab-Tested:</strong> Stability and safety testing for every batch</li>
                          <li><strong>Ethically Sourced:</strong> Partners vetted for sustainable practices</li>
                          <li><strong>Transparent:</strong> Clear labeling and batch traceability</li>
                        </ul>
                        <p className="mt-3">We maintain transparency in our sourcing and perfume composition methods.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Are your perfumes natural or synthetic?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Our perfumes use a blend of natural extracts and carefully selected synthetic aroma molecules where needed to ensure stability and performance. Each fragrance lists key ingredients and allergen information where applicable.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How long will my perfume last on skin?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Longevity depends on concentration and skin chemistry. Eau de Parfum typically lasts 6-8 hours, while parfum concentrations can last longer. Layering and proper storage can extend scent life.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        What is the shelf life of your perfumes?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Perfumes generally have a shelf life of 3-5 years when stored properly away from heat and direct sunlight. We recommend storing bottles upright in a cool, dark place.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Do you test for allergens?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Yes. We include common allergen declarations on product pages when relevant. If you have specific concerns, review ingredient lists or contact support for details.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Do you offer samples?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>We occasionally offer sample sets and discovery sprays. Check product pages or contact customer service for current offerings.</p>
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
                        <p>We want you to be completely satisfied with your purchase. Our return policy:</p>
                        <ul className="list-disc pl-5 space-y-2 mt-3">
                          <li><strong>Damaged/Defective Products:</strong> 7 days from delivery for replacement or full refund</li>
                          <li><strong>Quality Issues:</strong> If you're not satisfied with the product quality, contact us within 7 days</li>
                          <li><strong>Wrong Item Delivered:</strong> Immediate replacement or refund</li>
                          <li><strong>Unopened Products:</strong> 7 days return window for unopened bottles</li>
                        </ul>
                        <p className="mt-3">Note: Opened perfume bottles cannot be returned unless there's a quality issue. This is for hygiene reasons.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do I initiate a return?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>To return a product:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-3">
                          <li>Log in to your Lumera account</li>
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
                        What if my product arrived damaged?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>If your product arrives broken or damaged:</p>
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
                        How do I create a Lumera account?
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
                        <p>Lumera uses OTP-based authentication for security. You don't need a password! Just:</p>
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
                    Usage & Safety
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Are perfumes safe to use?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Perfumes are safe for general external use. Avoid contact with eyes and mucous membranes. If you have sensitive skin, perform a patch test before regular use.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How should I store perfumes?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Store perfumes in a cool, dark place away from direct sunlight and heat sources. Keep bottles upright and tightly closed to preserve fragrance integrity.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Can perfumes cause allergies?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Some ingredients can trigger sensitivities. Check product pages for key ingredient and allergen information. If you have severe sensitivities, consult a healthcare professional before use.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        How do I apply perfume for best results?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Apply to pulse points (wrists, neck, behind ears) from a distance. Avoid rubbing the fragrance into skin; allow it to dry naturally to preserve top and heart notes.</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-left hover:text-amber-600">
                        Do perfumes expire?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground whitespace-pre-line">
                        <p>Perfumes typically remain stable for 3-5 years when stored properly. Changes in color or scent may indicate oxidation; when in doubt, contact customer support.</p>
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
                  Can't find the answer you're looking for? Our Lumera team is here to help with any questions about our products.
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
