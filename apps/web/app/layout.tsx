import "./globals.css";
import { Rajdhani } from "next/font/google";

// Same display face as the Razorpay Builders Day page, used for everything.
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-display" });

export const metadata = { title: "SubShield AI", description: "Autonomous subscription and dark-pattern defense for PayPal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rajdhani.variable}>
      <body>{children}</body>
    </html>
  );
}
