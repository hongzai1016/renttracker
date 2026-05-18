import "./globals.css";

export const metadata = {
  title: "RentTrack - Premium Rent Tracking",
  description: "A beautiful and simple rent tracking application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
