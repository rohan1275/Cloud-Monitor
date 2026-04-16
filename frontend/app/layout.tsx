import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CloudMonitor — AI-Powered Infrastructure Dashboard",
  description:
    "Real-time cloud resource monitoring, auto-scaling simulation, and AI-powered insights for your infrastructure.",
  keywords: ["cloud monitoring", "auto scaling", "AWS", "DevOps", "infrastructure"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e2a45",
                color: "#e2e8f0",
                border: "1px solid rgba(59,130,246,0.3)",
                borderRadius: "10px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
