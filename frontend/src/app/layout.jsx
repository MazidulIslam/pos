import { Outfit } from "next/font/google";
import "./globals.css";
import MUIProvider from "@/components/MUIProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "ProntoStack | Next-Gen RBAC SaaS Template",
  description: "A premium point of sale and inventory management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased text-slate-900`}
        suppressHydrationWarning
      >
        <MUIProvider>{children}</MUIProvider>
      </body>
    </html>
  );
}
