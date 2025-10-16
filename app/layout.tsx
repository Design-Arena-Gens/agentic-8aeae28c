import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Email Sorting Agent",
  description: "Rule-based email classifier"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Email Sorting Agent</h1>
            <p className="subtitle">Classify emails into folders with editable rules</p>
          </header>
          <main>{children}</main>
          <footer className="footer">Built with Next.js</footer>
        </div>
      </body>
    </html>
  );
}
