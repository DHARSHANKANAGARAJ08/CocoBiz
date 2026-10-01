import type { Metadata } from "next";
import { Literata, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CocoBiz – Coconut Business Management System",
  description: "Enterprise ERP for Coconut Procurement, Harvesting, Inventory, Processing, Sales, and Financial Operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${literata.variable} ${nunito.variable}`}>
      <body className="bg-surface font-body text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">
        <Sidebar />
        <div className="pl-72 flex flex-col min-h-screen">
          <Header />
          <main className="relative pt-16 flex-1 bg-surface">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
