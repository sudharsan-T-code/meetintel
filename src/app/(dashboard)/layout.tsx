import Sidebar from '@/components/Sidebar';
import CommandPalette from '@/components/CommandPalette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
