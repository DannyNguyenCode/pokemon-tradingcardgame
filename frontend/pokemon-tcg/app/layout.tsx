import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import ToastManager from "./ui/components/ToastManage";
import { cookies } from 'next/headers'
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
  const theme = (await cookies()).get('theme')?.value ?? 'light'


  return (
    <html data-theme={theme} lang="en">
      <body >
        <Providers>
          <StoreProvider>
            <ThemeProvider initialTheme={theme}>
              <div className="min-h-screen flex flex-col ">
                <NavBar />
                <ToastManager />
                <div className="flex-1 flex flex-col overflow-y-auto">
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
