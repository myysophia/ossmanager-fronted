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

项目支持多种环境配置，详细说明请查看以下文档：
- [环境配置说明](./docs/环境配置说明.md) - 基础环境配置
- [环境变量配置](./docs/环境变量配置.md) - 安全的环境变量设置指南

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

---

## 🔒 安全更新 (重要)

### 最新安全公告

**更新日期：** 2025年12月8日

项目已修复以下严重安全漏洞：
- **CVE-2025-55182**: React Server Components 远程代码执行漏洞
- **CVE-2025-66478**: Next.js App Router 远程代码执行漏洞

### 已完成的安全修复

| 组件 | 原版本 | 安全版本 | 状态 |
|------|--------|----------|------|
| Next.js | 15.2.3 | **15.2.6** | ✅ 已修复 |
| React | 19.0.0 | **19.0.1** | ✅ 已修复 |
| React-DOM | 19.0.0 | **19.0.1** | ✅ 已修复 |

### 新增安全功能

- ✅ API 请求速率限制（防止 DDoS 攻击）
- ✅ 可疑请求检测与日志记录
- ✅ 安全响应头设置
- ✅ 中间件安全加固

### 安全相关文档

详细信息请查看：
- 📄 [安全漏洞分析报告](./docs/安全漏洞分析报告-CVE-2025-55182-66478.md) - 完整的漏洞分析
- 📄 [安全加固指南](./docs/安全加固指南.md) - 详细的修复步骤
- 📄 [快速修复指南](./docs/快速修复指南.md) - ⭐ 10分钟快速修复
- 📄 [CVE漏洞修复总结](./docs/CVE漏洞修复总结.md) - 完整的工作总结
- 📄 [安全修复知识点总结](./docs/安全修复知识点总结.md) - 技术知识点学习

### 快速修复（如果需要）

如果您从旧版本升级，请运行：

```bash
# 自动修复脚本
node scripts/fix-security-vulnerabilities.js

# 或手动升级
npm install
npm audit
```

---