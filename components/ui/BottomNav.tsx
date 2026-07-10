'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Truck, ClipboardList, CheckCircle, User, LogOut, List, PackagePlus } from 'lucide-react';

interface BottomNavProps {
  role: 'customer' | 'driver';
}

const driverNavItems = [
  { href: '/dashboard/driver?tab=available', label: 'Available', icon: ClipboardList, id: 'nav-available' },
  { href: '/dashboard/driver?tab=active', label: 'Active', icon: Truck, id: 'nav-active' },
  { href: '/dashboard/driver?tab=completed', label: 'Done', icon: CheckCircle, id: 'nav-done' },
  { href: '/dashboard/driver?tab=profile', label: 'Profile', icon: User, id: 'nav-profile' },
];

const customerNavItems = [
  { href: '/dashboard/console?tab=shipments', label: 'Shipments', icon: List, id: 'nav-shipments' },
  { href: '/dashboard/console?tab=create', label: 'Create', icon: PackagePlus, id: 'nav-create' },
  { href: '/dashboard/console?tab=profile', label: 'Profile', icon: User, id: 'nav-profile' },
];

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = role === 'driver' ? driverNavItems : customerNavItems;

  const handleLogout = async () => {
    await fetch('/api/auth/me', { method: 'POST' });
    router.push('/signin');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass safe-bottom">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {items.map((item) => {
            const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
            const currentTab = searchParams ? searchParams.get('tab') : null;
            const itemTab = item.href.split('tab=')[1];
            
            // It's active if the query param matches exactly
            const isActive = currentTab === itemTab || (!currentTab && item.href.endsWith(pathname));
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={item.id}
                onClick={() => router.push(item.href)}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
                  transition-all duration-200 min-w-[60px]
                  ${isActive
                    ? 'text-brand-400'
                    : 'text-slate-500 hover:text-slate-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            id="nav-logout"
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl
              transition-all duration-200 min-w-[60px]
              text-slate-500 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
