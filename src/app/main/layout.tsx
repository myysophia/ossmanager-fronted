import MainLayoutClient from '@/components/layout/MainLayout';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayoutClient>
      {children}
    </MainLayoutClient>
  );
} 