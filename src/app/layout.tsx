import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "SmartKarobar — Digital Khata & Business Management",
  description: "Digital ledger and business management platform for Nepali businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64">
            <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
