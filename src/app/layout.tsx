import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import { AuthGate } from "@/components/auth-gate";
import { Header } from "@/components/header";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Content Planner",
  description: "Plan and review content posts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <TooltipProvider>
            <AuthGate>
              <Header />
              <main className="flex-1">{children}</main>
            </AuthGate>
          </TooltipProvider>
        </UserProvider>
      </body>
    </html>
  );
}
