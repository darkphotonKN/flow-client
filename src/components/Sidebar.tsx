'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from './LayoutWrapper';

// Interface for navigation items
interface NavItem {
  name: string;
  href: string;
  isActive?: boolean;
}

// Interface for navigation sections
interface NavSection {
  title: string;
  items: NavItem[];
}

// Interface for plan data from API
interface Plan {
  id: string;
  name: string;
  planType: string;
  focus?: string;
  description?: string;
}

// Interface for API response
interface ApiResponse {
  statusCode: number;
  message: string;
  result: Plan[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const planId = pathname?.split('/plan/')?.[1] || '';
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // State to track dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // State for plans
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:6060/api/plans');

        if (!response.ok) {
          throw new Error(`Failed to fetch plans: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        console.log('Plans:', data);
        setPlans(data.result || []);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans');
        // Set empty plans array as fallback
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Listen for system dark mode changes
  useEffect(() => {
    // Check initial dark mode preference
    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    // Add listener for changes
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

    // Clean up listener
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  // Create nav sections based on plans
  const navSections: NavSection[] = [
    {
      title: 'Learning',
      items: plans
        .filter((plan) => plan.planType === 'learning')
        .map((plan) => ({
          name: plan.name,
          href: `/plan/${plan.id}`,
          isActive: plan.id === planId,
        })),
    },
    {
      title: 'Projects',
      items: plans
        .filter((plan) => plan.planType === 'development')
        .map((plan) => ({
          name: plan.name,
          href: `/plan/${plan.id}`,
          isActive: plan.id === planId,
        })),
    },
  ];

  return (
    <div
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-20"
      onMouseEnter={() => !isCollapsed ? null : setIsHovered(true)}
      onMouseLeave={() => !isCollapsed ? null : setIsHovered(false)}
    >
      {/* 50px trigger area - only active when collapsed */}
      {isCollapsed && <div className="absolute left-0 top-0 h-full w-[50px]" />}

      <aside
        className={`h-full pt-4 px-4 overflow-y-auto transition-all duration-300 relative ${
          isCollapsed
            ? (isHovered ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0')
            : 'translate-x-0 opacity-100'
        }`}
        style={{
          backgroundColor: isDarkMode
            ? '#171717' // Darker than #1f1f1f main dark background
            : 'rgb(232, 230, 217)', // Slightly darker than light mode background
          width: '16rem', // Fixed width of 16rem (256px)
        }}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title={isCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <nav className="space-y-6">
          {/* Core List */}
          <div className="py-4">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-2 pb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider opacity-70">
                  {section.title}
                </h3>

                <ul className="space-y-1 pl-2">
                  {isLoading ? (
                    <li className="text-sm opacity-70 px-3 py-2">Loading...</li>
                  ) : error ? (
                    <li className="text-sm opacity-70 px-3 py-2">{error}</li>
                  ) : section.items.length === 0 ? (
                    <li className="text-sm opacity-70 px-3 py-2">
                      No {section.title.toLowerCase()} found
                    </li>
                  ) : (
                    section.items.map((item) => (
                      <li key={item.name} className="group">
                        <Link
                          href={item.href}
                          className={`relative flex px-3 py-2 text-sm rounded-md transition-all duration-300 cursor-pointer ${
                            item.isActive
                              ? 'font-medium'
                              : ''
                          }`}
                          style={{
                            backgroundColor: item.isActive
                              ? 'rgba(247, 111, 83, 0.1)'
                              : 'transparent',
                            color: item.isActive
                              ? 'rgb(247, 111, 83)'
                              : 'inherit',
                          }}
                        >
                          {/* Hover gradient effect */}
                          <span className={`absolute inset-0 rounded-md transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                            !item.isActive ? 'bg-gradient-to-r from-transparent via-amber-900/10 to-transparent' : ''
                          }`} />

                          {/* Warm glow effect on hover */}
                          <span className={`absolute -inset-1 rounded-lg blur-md transition-all duration-500 opacity-0 group-hover:opacity-30 ${
                            !item.isActive ? 'bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/20' : ''
                          }`} />

                          {/* Left border indicator */}
                          <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-amber-500 transition-all duration-300 ${
                            item.isActive ? 'h-full' : 'group-hover:h-3/4'
                          }`} />

                          {/* Text content */}
                          <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1">
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))}
          </div>

          {/* Plan Button */}
          <Link
            href="/create-plan"
            className="relative block w-full py-2 px-4 rounded-md text-sm font-medium text-center transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20 group overflow-hidden"
            style={{
              border: '1px solid rgb(247, 111, 83)',
              color: 'rgb(247, 111, 83)',
              backgroundColor: isDarkMode
                ? 'rgba(247, 111, 83, 0.05)'
                : 'rgba(247, 111, 83, 0.02)',
            }}
          >
            {/* Animated background on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-amber-600/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            <span className="relative z-10">Create New Plan</span>
          </Link>
        </nav>
      </aside>
    </div>
  );
}
