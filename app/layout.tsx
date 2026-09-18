import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "5 Seconds Only",
  description:
    "Online party game — draw a card, read it in Discord, name 3 answers in 5.5 seconds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-dvh antialiased">
        <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </main>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#1d1d1d",
              border: "1px solid #303030",
              color: "#e3e0da",
            },
          }}
        />
      </body>
    </html>
  );
}
