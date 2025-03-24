import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import DashboardLoading from './loading';
import { unstable_cache } from 'next/cache';

const getDashboardStats = unstable_cache(
  async () => {
    // 模拟API调用
    return {
      todayUploads: 25,
      todayDownloads: 42,
      totalFiles: 156,
      totalUsers: 12,
      storageUsage: {
        used: 35,
        total: 100
      }
    };
  },
  ['dashboard-stats'],
  {
    revalidate: 60, // 1分钟后重新验证
    tags: ['dashboard']
  }
);

async function DashboardStats() {
  const stats = await getDashboardStats();
  return <DashboardContent initialStats={stats} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardStats />
    </Suspense>
  );
} 