import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bio D. Scan — The Living Ledger",
  description:
    "Biodiversity scanning platform for organic farmers and government oversight.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="grid-bg min-h-screen">
        {children}
      </body>
    </html>
  );
}
