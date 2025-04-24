对象存储服务(OSS)文件管理系统的前端服务，支持阿里云OSS、AWS S3、CloudFlare R2等多种对象存储服务。
<img width="1505" alt="image" src="https://github.com/user-attachments/assets/e8ee8093-c02e-4f38-babd-b042e25c6c15" />

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 环境配置

项目支持多种环境配置，详细说明请查看 [环境配置说明](./docs/环境配置说明.md)。

### 主要环境

- **开发环境** - 连接本地后端API（默认端口8080）
- **测试环境** - 连接测试服务器API
- **生产环境** - 使用相对路径API（通过前端代理转发请求）

### 快速开始

```bash
# 开发环境
npm run dev

# 测试环境
npm run dev:test

# 构建生产环境
npm run build:prod
```
