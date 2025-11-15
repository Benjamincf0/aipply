import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SideBar from "./SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBarTrigger from "./SideBarTrigger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aipply",
  description: "Apply automatically to hundreds of jobs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-screen w-screen overflow-hidden antialiased`}
      >
        <SidebarProvider>
          <SideBar />
          <main className="h-full w-full p-2">
            <SideBarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
