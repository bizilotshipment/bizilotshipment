'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

interface UserData {
  id: string;
  fullName: string;
  mobile: string;
  role: 'customer' | 'driver';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.success) {
          router.push('/signin');
          return;
        }

        setUser(data.user);
      } catch {
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-dvh pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 glass">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="text-sm">🚚</span>
              </div>
              <span className="font-bold text-white text-sm">Delivery</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Welcome</p>
              <p className="text-sm font-medium text-white">{user.fullName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-4 py-4">
        {children}
      </main>

      {/* Bottom Nav */}
      <BottomNav role={user.role} />
    </div>
  );
}
