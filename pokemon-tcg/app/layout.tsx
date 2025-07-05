import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import ToastManager from "./ui/components/ToastManage";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { cookies } from 'next/headers'
import NavBar from './ui/components/NavBar'
import ThemeProvider from "./ui/theme/ThemeProvider";
// import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'

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
  console.log("error checking =======")
  console.log(theme)


  return (
    <html data-theme={theme} lang="en">
      <body >
        <StoreProvider>
          <AppRouterCacheProvider>
            <ThemeProvider initialTheme={theme}>
              <NavBar />
              <ToastManager />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
