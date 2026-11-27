import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./components/ui";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HikKing · Trips across Bangladesh",
    template: "%s · HikKing",
  },
  description:
    "Weekend and short trips across Bangladesh: Sajek, Sylhet, Cox's Bazar, Bandarban, the Sundarbans and more. Choose a trip, reserve a date, we confirm it.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#08130f" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('hk_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
