import type { Metadata } from "next";
import "@fontsource-variable/material-symbols-outlined";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import ToastManager from "./ui/components/ToastManage";
import NavBar from './ui/components/NavBar'
import ThemeProvider from "./ui/theme/ThemeProvider";
import Providers from "./providers";
import Footer from "./ui/components/Footer";

export const metadata: Metadata = {
  title: "Pokemon-Trading Card Game",
  description: "View, Collect, and Battle with your favourite Pokemon",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="light" lang="en">
      <body >
        <Providers>
          <StoreProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col ">
                <NavBar />
                <ToastManager />
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-r from-[#A8A77A] via-[#EE8130] to-[#6390F0]">
                  {children}
                </div>
                <Footer />
              </div>
            </ThemeProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}
