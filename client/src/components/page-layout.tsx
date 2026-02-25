import { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <main className={className}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
