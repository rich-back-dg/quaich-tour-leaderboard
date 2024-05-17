import { Catamaran as Cata } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { Copyright } from "lucide-react";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Quaich Tour Leaderboard",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const cata = Cata({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cata.className}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            {children}
            <footer className="w-full border-t dark:border-t-zinc-600 p-6 flex justify-center text-center text-xs text-zinc-500">
              <div className="flex gap-1 items-center">
                <p>built by <u>richard backhouse</u>.</p>
              </div>
            </footer>
            <Toaster position="top-right" />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
