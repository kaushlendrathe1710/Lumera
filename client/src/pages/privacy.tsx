import React, { useEffect } from "react";
import { PageLayout } from "@/components/page-layout";

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="mb-4">
            At Luméra, we respect and protect your privacy.
          </p>
          <p className="mb-4">
            We only collect information necessary to process your orders, deliver products, and
            improve your shopping experience. This may include your name, address, phone number.
          </p>
          <p className="mb-4">
            All your personal data is stored securely and will never be shared, sold, or used for any
            purpose other than completing your purchase or communicating with you about your order.
          </p>
          <p className="mb-4">
            By using our website, you agree to the terms of this privacy policy.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
