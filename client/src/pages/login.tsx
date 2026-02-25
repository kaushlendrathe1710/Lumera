import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { SupportedCountry } from "@shared/schema";

type Step = "email" | "otp" | "register";

export default function Login() {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [, setLocation] = useLocation();
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const { data: countries } = useQuery<SupportedCountry[]>({
    queryKey: ["/api/countries"],
  });

  const selectedCountry = countries?.find(c => c.id === countryId);

  useEffect(() => {
    if (user) {
      const redirectTo = user.role === "customer" ? "/dashboard" : "/admin";
      setLocation(redirectTo);
    }
  }, [user, setLocation]);

  // Countdown timer for resend OTP cooldown
  useEffect(() => {
  if (resendCooldown <= 0) return;

  const timer = setInterval(() => {
    setResendCooldown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [resendCooldown]);


  const sendOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { email });
      return res.json();
    },
    onSuccess: (data) => {
      setIsNewUser(data.isNewUser);
      setStep("otp");
      // Start 60-second cooldown
      setResendCooldown(60);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { email, otp });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired OTP");
      }
      return data;
    },
    onSuccess: async (data) => {
      if (data.requiresRegistration) {
        setStep("register");
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully",
        });
        refetch();
        const redirectTo = data.user.role === "customer" ? "/dashboard" : "/admin";
        setLocation(redirectTo);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ name, countryId, phoneNumber }: { name: string; countryId: string; phoneNumber: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", { name, countryId, phoneNumber });
      return res.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Registration Complete",
        description: "Welcome to Lumera!",
      });
      await refetch();
      const redirectTo = data.user?.role === "admin" || data.user?.role === "superadmin" ? "/admin" : "/dashboard";
      window.location.href = redirectTo;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    sendOtpMutation.mutate(email);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    verifyOtpMutation.mutate({ email, otp });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !countryId || !phoneNumber) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    if (!/^\d+$/.test(phoneNumber)) {
      toast({
        title: "Error",
        description: "Phone number must contain only digits",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number length
    if (selectedCountry && phoneNumber.length !== selectedCountry.phoneLength) {
      toast({
        title: "Error",
        description: `Phone number must be ${selectedCountry.phoneLength} digits for ${selectedCountry.name}`,
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ name, countryId, phoneNumber });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">
              {step === "email" && "Sign In"}
              {step === "otp" && "Verify Email"}
              {step === "register" && "Complete Registration"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "Enter your email to receive a one-time password"}
              {step === "otp" && `We've sent a 6-digit code to ${email}`}
              {step === "register" && "Please provide your details to complete registration"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={sendOtpMutation.isPending || !email}
                  data-testid="button-send-otp"
                >
                  {sendOtpMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Continue with Email"
                  )}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    data-testid="input-otp"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyOtpMutation.isPending || otp.length !== 6}
                  data-testid="button-verify-otp"
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                    }}
                    className="text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Change email
                  </Button>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => sendOtpMutation.mutate(email)}
                      disabled={sendOtpMutation.isPending || resendCooldown > 0}
                      className="text-sm text-primary"
                    >
                      {resendCooldown > 0
                      ? `Resend OTP (${resendCooldown}s)`
                      : "Resend OTP"}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={countryId} onValueChange={setCountryId} required>
                    <SelectTrigger id="country" data-testid="select-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name} ({country.dialCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    {selectedCountry && (
                      <div className="flex items-center px-3 border rounded-md bg-muted text-muted-foreground">
                        {selectedCountry.dialCode}
                      </div>
                    )}
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={selectedCountry ? `${'9'.repeat(selectedCountry.phoneLength)}` : "Phone number"}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={selectedCountry?.phoneLength}
                      required
                      disabled={!selectedCountry}
                      data-testid="input-phone"
                      className="flex-1"
                    />
                  </div>
                  {selectedCountry && (
                    <p className="text-xs text-muted-foreground">
                      Enter {selectedCountry.phoneLength} digits (without country code)
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending || !name || !countryId || !phoneNumber}
                  data-testid="button-register"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

    </div>
  );
}
