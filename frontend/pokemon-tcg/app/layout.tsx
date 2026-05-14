import type { Metadata } from "next";
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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
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
