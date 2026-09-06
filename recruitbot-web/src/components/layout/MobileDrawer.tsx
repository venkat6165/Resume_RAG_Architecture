import { useUIStore } from '@/lib/stores/ui.store';
import { Sidebar } from './Sidebar';

export function MobileDrawer() {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useUIStore();

  if (!isMobileSidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
      <div
        onClick={toggleMobileSidebar}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative z-10 w-[280px] h-full bg-bg-surface flex flex-col shadow-2xl animate-slide-in-left">
        <Sidebar className="w-full h-full border-r-0" />
      </div>
    </div>
  );
}
