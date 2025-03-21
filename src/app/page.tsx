'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="flex flex-col items-center text-center gap-8">
        <h1 className="text-4xl font-bold">欢迎使用 OSS 文件管理系统</h1>
        <p className="text-xl max-w-3xl">
          一个基于 Next.js 构建的现代化文件管理系统，支持多种对象存储服务
        </p>
        <div className="pt-6">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium text-lg"
            onClick={() => router.push('/auth/login')}
          >
            立即登录
          </button>
        </div>
      </div>
    </div>
  );
}
