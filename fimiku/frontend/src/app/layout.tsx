import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Fimiku | Safe & Soft Food-Grade Silicone Baby Essentials",
  description: "Direct manufacturer of 100% food-grade platinum silicone baby products. Teething toys, self-feeding plates, sensory play, and baby essentials.",
  keywords: ["baby silicone", "food grade silicone teether", "baby feeding suction plate", "Fimiku baby brand", "safe baby products India"],
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#8044F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#fdfcfe] text-fimiku-darkText min-h-screen flex flex-col antialiased relative selection:bg-fimiku-lightPurple/30">
        <AuthProvider>
          <CartProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">
                {children}
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
