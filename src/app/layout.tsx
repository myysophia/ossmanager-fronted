import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "OSS 文件管理系统",
  description: "一个基于 Next.js 的 OSS 文件管理系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
