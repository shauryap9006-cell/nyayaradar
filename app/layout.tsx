import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "NyayaRadar — India Judicial Pendency Map",
  description: "A free, public, map-first platform visualizing pending court cases across India with official data, trends, and geographic insights.",
  openGraph: {
    title: "NyayaRadar — India Judicial Pendency Map",
    description: "A live map of where India's justice is stuck across the Supreme Court and 25 High Courts.",
    url: "https://nyayaradar.in",
    siteName: "NyayaRadar",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
