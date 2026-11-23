import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Perpustakaan Kampus",
  description: "Sistem manajemen perpustakaan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}