import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "跨海的历史｜海をわたる歴史",
  description: "循着长安、青龙寺与京都，认识唐代中日交流；另设明清中国史书房。中日双语学习馆设计预览。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
