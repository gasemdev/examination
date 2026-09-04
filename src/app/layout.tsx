import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Examio | ระบบทำข้อสอบ",
  description: "ระบบฝึกทำข้อสอบและติดตามความก้าวหน้า",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="th"
      className="h-full antialiased"
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
