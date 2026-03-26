'use client';

import { ReactNode } from 'react';
import { useSidebar } from './LayoutWrapper';
import Sidebar from './Sidebar';
import UserProfile from './UserProfile';
import Logo from './Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const { isCollapsed } = useSidebar();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
      {!isHomePage && <Sidebar />}

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          isHomePage ? 'ml-0' : (isCollapsed ? 'ml-0' : 'ml-64')
        }`}
      >
        {/* Top bar with logo and user profile */}
        <div className="fixed top-0 right-0 h-16 bg-layout backdrop-blur-sm z-10"
             style={{ left: isHomePage ? '0' : (isCollapsed ? '0' : '16rem') }}>
          <div className="h-full max-w-7xl mx-auto px-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo />
              <Link href="/">
                <h1 className="text-2xl font-bold">Fireplace</h1>
              </Link>
            </div>
            <UserProfile />
          </div>
        </div>

        {/* Main content with top padding to accommodate the top bar */}
        <main className="pt-20 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </>
  );
}