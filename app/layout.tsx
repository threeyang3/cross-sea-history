import type { Metadata } from "next";
import "./globals.css";
import "./timeline.css";

export const metadata: Metadata = {
  title: "跨海的历史｜海をわたる歴史",
  description: "循着长安、青龙寺与京都，认识唐代中日交流；另设明清中国史书房。中日交流史与中国历史双语时间线、历史事件、短课、文物图像、互动观察与个人摘记。",
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
