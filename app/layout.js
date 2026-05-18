import "./globals.css";

export const metadata = {
  title: "RentTrack - Premium Rent Tracking",
  description: "A beautiful and simple rent tracking application.",
};

import ThemeToggle from "./ThemeToggle";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
