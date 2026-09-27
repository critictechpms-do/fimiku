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
      <body className="bg-gradient-to-b from-[#FAF5FE] via-[#FCF7FD] to-[#F6EFFD] text-fimiku-darkText min-h-screen flex flex-col antialiased relative selection:bg-fimiku-lightPurple/30">
        {/* Background ambient pastel decorative glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl" />
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-pink-200/35 rounded-full blur-3xl" />
          <div className="absolute top-2/3 left-1/4 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl" />
        </div>

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
