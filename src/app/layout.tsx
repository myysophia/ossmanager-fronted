import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { Providers } from './providers';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import { ReactPlugin } from '@stagewise-plugins/react';

const stagewiseConfig = {
  plugins: [ReactPlugin]
};

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
          {process.env.NODE_ENV === 'development' && (
            <StagewiseToolbar config={stagewiseConfig} />
          )}
        </Providers>
      </body>
    </html>
  );
}
