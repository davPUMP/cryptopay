import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CryptoPay Simple",
  description: "Accept crypto payments with simple invoices."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
