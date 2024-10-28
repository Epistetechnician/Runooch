import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Renutra",
  description: "Regenerate Your Nutrition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content={`
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:;
            style-src 'self' 'unsafe-inline';
            worker-src 'self' blob:;
            connect-src 'self' 
              https://*.tiles.mapbox.com 
              https://api.mapbox.com 
              https://events.mapbox.com
              https://*.supabase.co
              https://cdocklzrlqrtlvzhfcqc.supabase.co;
            img-src 'self' 
              https://*.mapbox.com 
              https://*.supabase.co
              https://cdocklzrlqrtlvzhfcqc.supabase.co
              https://hatscripts.github.io
              https://raw.githubusercontent.com
              https://purecatamphetamine.github.io
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/ca.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/uk.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/au.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/in.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/jp.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/de.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/fr.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/it.svg
              https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/es.svg
              /Users/shaan.s.patel/Desktop/renutra/images/ReNutri_Logo.png
              data: blob: 'self';
            font-src 'self' data:;
            frame-src 'self';
            object-src 'none';
          `.replace(/\s+/g, ' ').trim()}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
