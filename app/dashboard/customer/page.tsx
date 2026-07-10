'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, LogOut, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UserData {
  id: string;
  fullName: string;
  mobile: string;
  role: string;
  createdAt: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/me', { method: 'POST' });
    router.push('/signin');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-4">
            <User className="w-9 h-9 text-white" />
          </div>

          <h2 className="text-xl font-bold text-white">{user.fullName}</h2>

          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-sm">{user.mobile}</span>
          </div>

          <div className="mt-2 px-3 py-1 rounded-full bg-brand-600/15 text-brand-400 text-xs font-medium">
            Customer
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </Card>

      {/* Coming Soon */}
      <Card className="p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="font-semibold text-white mb-1">More features coming soon</h3>
        <p className="text-sm text-slate-400">
          Track your deliveries, view history, and manage your addresses — all coming soon.
        </p>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        fullWidth
        size="lg"
        onClick={handleLogout}
        loading={loggingOut}
        className="!text-red-400 !border-red-500/20 hover:!bg-red-500/10"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
