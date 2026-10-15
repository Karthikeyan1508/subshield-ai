import "./globals.css";
import { Rajdhani, Space_Mono, TASA_Orbiter } from "next/font/google";

// Same trio as the Razorpay Builders Day page.
const sans = TASA_Orbiter({ subsets: ["latin"], variable: "--font-sans" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });
const display = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });

export const metadata = { title: "SubShield AI", description: "Autonomous subscription and dark-pattern defense for PayPal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
