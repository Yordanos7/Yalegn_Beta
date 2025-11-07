import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alpha",
  description: "Alpha",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <div className="grid grid-rows-[auto_1fr] h-svh">
              <Header />
              <main className="pt-[112px] bg-background">{children}</main>
            </div>
            <Toaster /> {/* Add Toaster component here */}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
