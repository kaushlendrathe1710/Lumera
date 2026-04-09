import { useState } from "react";
import { Link } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Lock, Package } from "lucide-react";
import { useCart, getDiscountedPrice } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Nav } from "@/components/nav";
import { setGuestOrderAccessToken } from "@/lib/guest-order-access";

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Ajman",
  "Dubai",
  "Fujairah",
  "Ras Al Khaimah",
  "Sharjah",
  "Umm Al Quwain",
] as const;

const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name must be at most 120 characters")
    .regex(/^[A-Za-z\s'.-]+$/, "Use letters only for full name"),
  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(250, "Address must be at most 250 characters"),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters")
    .regex(/^[A-Za-z\s'.-]+$/, "City must use letters only"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+[1-9][0-9]{7,14}$/, "Enter phone with country code, e.g. +971501234567"),
  emirate: z.enum(UAE_EMIRATES, {
    required_error: "Please select an emirate",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function sanitizeAlphaInput(value: string) {
  return value
    .replace(/[^A-Za-z\s'.-]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "");
}

function sanitizePhoneWithCountryCode(value: string) {
  const cleaned = value.replace(/[^+0-9]/g, "");
  const hasPlus = cleaned.startsWith("+");
  const digitsOnly = cleaned.replace(/\+/g, "");
  const limitedDigits = digitsOnly.slice(0, 15);
  return `${hasPlus ? "+" : ""}${limitedDigits}`;
}

export default function Checkout() {
  const { items, total } = useCart();
  const { toast } = useToast();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      phoneNumber: "",
      emirate: undefined,
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Shipping is free site-wide
  const grandTotal = total;

  const handlePayment = async (values: CheckoutFormValues) => {

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessingPayment(true);

      const normalizedName = values.fullName.trim();
      const normalizedAddress = values.address.trim();
      const normalizedCity = values.city.trim();
      const normalizedPhone = values.phoneNumber.trim();
      const normalizedEmirate = values.emirate;
      const guestEmail = `guest.${Date.now()}@lumera.local`;

      const orderRes = await apiRequest("POST", "/api/orders", {
        shippingName: normalizedName,
        guestEmail,
        shippingPhone: normalizedPhone,
        shippingAddress: normalizedAddress,
        shippingCity: normalizedCity,
        shippingEmirate: normalizedEmirate,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        totalAmount: grandTotal.toFixed(2),
      });

      const order = await orderRes.json();
      const accessToken = order?.guestAccessToken || null;
      if (accessToken) {
        setGuestOrderAccessToken(order.id, accessToken);
      }

      const paymentRes = await apiRequest("POST", "/api/payments/create", {
        orderId: order.id,
        accessToken,
      });

      const paymentData = await paymentRes.json();
      if (!paymentData?.redirect_url) {
        throw new Error("Payment redirect URL not received");
      }

      window.location.href = paymentData.redirect_url;
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err?.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Add some products to proceed with checkout</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <Link href="/cart">
          <Button variant="ghost" className="gap-2 mb-8" data-testid="link-back-cart">
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit(handlePayment)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Controller
                      control={control}
                      name="fullName"
                      render={({ field }) => (
                        <Input
                          id="fullName"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(sanitizeAlphaInput(e.target.value))}
                          onBlur={field.onBlur}
                          placeholder="Enter your full name"
                        />
                      )}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive" data-testid="error-fullName">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      {...register("address")}
                      placeholder="Street, building, apartment"
                      rows={3}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive" data-testid="error-address">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Controller
                      control={control}
                      name="city"
                      render={({ field }) => (
                        <Input
                          id="city"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(sanitizeAlphaInput(e.target.value))}
                          onBlur={field.onBlur}
                          placeholder="Dubai"
                        />
                      )}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive" data-testid="error-city">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Controller
                      control={control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(sanitizePhoneWithCountryCode(e.target.value))}
                          onBlur={field.onBlur}
                          placeholder="+971501234567"
                          inputMode="tel"
                        />
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive" data-testid="error-phoneNumber">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emirate">Emirate</Label>
                    <Controller
                      control={control}
                      name="emirate"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="emirate">
                            <SelectValue placeholder="Select emirate" />
                          </SelectTrigger>
                          <SelectContent>
                            {UAE_EMIRATES.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.emirate && (
                      <p className="text-sm text-destructive" data-testid="error-emirate">
                        {errors.emirate.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {(getDiscountedPrice(item.product) * item.quantity).toFixed(2)} AED
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Subtotal</span>
                      <span>{total.toFixed(2)} AED</span>
                    </div>
                    <div className="flex justify-between text-sm text-foreground">
                      <span>Shipping</span>
                      <span className="text-green-600">Free shipping</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">{grandTotal.toFixed(2)} AED</span>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessingPayment}
                    data-testid="button-place-order"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay {grandTotal.toFixed(2)} AED
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
