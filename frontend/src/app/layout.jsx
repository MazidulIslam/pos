
import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layouts/Sidebar";
import { Header } from "@/components/layouts/Header";
import MUIProvider from "@/components/MUIProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Modern POS | Next-Gen ERP",
  description: "A premium point of sale and inventory management system",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased text-slate-900`}>
        <MUIProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <Header />
              <main className="flex-1 p-6 mt-[var(--header-height)] lg:ml-[var(--sidebar-width)] overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </MUIProvider>
      </body>
    </html>
  );
}
