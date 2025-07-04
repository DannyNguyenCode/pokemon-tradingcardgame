import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import ToastManager from "./ui/components/ToastManage";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Pokemon-Trading Card Game",
  description: "View, Collect, and Battle with your favourite Pokemon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="light" lang="en">
      <body >
        <StoreProvider>
          <AppRouterCacheProvider>
            <ToastManager />
            {children}
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
