import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ZвонкиОС",
  description: "рофловый дистро на арх-основе. звонки не отменяются.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${jetbrainsMono.variable} antialiased bg-black text-green-400`}
      >
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#001a00,transparent),radial-gradient(ellipse_at_bottom,#000500,transparent)]">
          <header className="border-b border-green-800/50 backdrop-blur-sm">
            <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <a href="/" className="text-xl font-bold tracking-widest uppercase glitch">
                [ZвонкиОС]
              </a>
              <div className="flex gap-6 text-sm">
                <a href="/" className="hover:text-green-300 transition-colors">~/home</a>
                <a href="/download/" className="hover:text-green-300 transition-colors">~/download</a>
              </div>
            </nav>
          </header>
          <main className="max-w-6xl mx-auto px-6 py-12">
            {children}
          </main>
          <footer className="border-t border-green-800/50 mt-20">
            <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-green-600">
              <p>zvonkiOS — звонки никогда не отменяются</p>
              <p className="mt-1">made with hate &amp; pacman -Syu</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
