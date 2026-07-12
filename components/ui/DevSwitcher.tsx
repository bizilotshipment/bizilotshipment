'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, X, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/types';

export function DevSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetch('/api/dev/users')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUsers(data.users);
          }
        });
    }
  }, [isOpen, users.length]);

  const handleSwitch = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/dev/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        if (data.role === 'customer') {
          router.push('/dashboard/console');
        } else {
          router.push('/dashboard/driver');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NEXT_PUBLIC_ENABLE_DEV_SWITCHER !== 'true') return null;

  const customers = users.filter((u) => u.role === 'customer');
  const drivers = users.filter((u) => u.role === 'driver');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[100] p-3 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 transition-colors"
        aria-label="Open Dev Switcher"
      >
        <Settings className="w-5 h-5 animate-pulse" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-surface-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" /> Dev Switcher
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {users.length === 0 ? (
                <div className="text-center text-slate-400 py-4">Loading accounts...</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Customers</h3>
                    {customers.length === 0 && <p className="text-sm text-slate-500">No customers found.</p>}
                    {customers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitch(u.id)}
                        disabled={loading}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">{u.mobile}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Drivers</h3>
                    {drivers.length === 0 && <p className="text-sm text-slate-500">No drivers found.</p>}
                    {drivers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitch(u.id)}
                        disabled={loading}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{u.fullName}</p>
                          <p className="text-xs text-slate-400 font-mono">{u.mobile}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
