import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TinyLink - URL Shortener",
  description: "Shorten URLs, track clicks, and manage your links with TinyLink",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link href="/" className="logo">
                ⚡ TinyLink
              </Link>
              <nav className="nav">
                <Link href="/">Dashboard</Link>
                <Link href="/healthz">Health</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="container fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}

