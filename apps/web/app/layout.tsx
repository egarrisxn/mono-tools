import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/providers";
import Navbar from "@/components/navbar";
import "./globals.css";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Mono Tools Web",
  description: "...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <main>
            <Navbar />
            {children}
            <SonnerToaster richColors closeButton position="bottom-right" />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
