'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  Navigation,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  User,
  Phone,
  LogOut,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { DeliveryJob, GroupedJob, JobStatus } from '@/lib/types';

interface ActiveJob {
  id: string;
  status: JobStatus;
  pickup: DeliveryJob['pickup'];
  drops: DeliveryJob['drops'];
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

interface CompletedJob {
  id: string;
  pickup: { businessName: string; fullAddress: string };
  dropsCount: number;
  completedAt: string;
}

interface JobsData {
  available: GroupedJob[];
  active: ActiveJob[];
  completed: CompletedJob[];
}

interface UserData {
  id: string;
  fullName: string;
  mobile: string;
  role: string;
  createdAt: string;
}

export default function DriverDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'available';
  
  const [jobs, setJobs] = useState<JobsData>({ available: [], active: [], completed: [] });
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.success) setUser(data.user);
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchUser();
  }, [fetchJobs, fetchUser]);

  const handleAccept = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/accept`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchJobs();
        router.push('/dashboard/driver?tab=active');
      }
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  };

  const handlePickup = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/pickup`, { method: 'POST' });
      const data = await res.json();
      if (data.success) await fetchJobs();
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (data.success) await fetchJobs();
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/me', { method: 'POST' });
    router.push('/signin');
  };

  const setTab = (tab: string) => {
    router.push(`/dashboard/driver?tab=${tab}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { key: 'available', label: 'Available', icon: ClipboardList, count: jobs.available.reduce((sum, g) => sum + g.jobs.length, 0) },
          { key: 'active', label: 'Active', icon: Truck, count: jobs.active.length },
          { key: 'completed', label: 'Done', icon: CheckCircle, count: jobs.completed.length },
          { key: 'profile', label: 'Profile', icon: User, count: 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap
              transition-all duration-200
              ${activeTab === tab.key
                ? 'bg-brand-600 text-white'
                : 'bg-surface-700 text-slate-400 hover:bg-surface-600'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`
                px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Available Jobs */}
      {activeTab === 'available' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Available Jobs</h2>
            <button
              onClick={fetchJobs}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {jobs.available.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No jobs available</p>
              <p className="text-sm text-slate-500 mt-1">New jobs will appear here</p>
            </Card>
          ) : (
            jobs.available.map((group) => (
              <Card key={group.businessId} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{group.businessName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{group.ownerName}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{group.pickupAddress}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium text-brand-400">
                        {group.totalDrops} {group.totalDrops === 1 ? 'delivery' : 'deliveries'}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{group.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Accept button for each job in the group */}
                <div className="mt-3 space-y-2">
                  {group.jobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-700/50">
                      <span className="text-xs text-slate-400">
                        {job.drops.length} drops
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(job.id)}
                        loading={actionLoading === job.id}
                        disabled={!!actionLoading}
                      >
                        Accept
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Active Jobs */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Active Jobs</h2>

          {jobs.active.length === 0 ? (
            <Card className="p-8 text-center">
              <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No active jobs</p>
              <p className="text-sm text-slate-500 mt-1">Accept jobs from the Available tab</p>
            </Card>
          ) : (
            jobs.active.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{job.pickup.businessName}</h3>
                  <Badge status={job.status} />
                </div>

                {/* Pickup */}
                <div className="flex items-start gap-2 mb-2 p-2 rounded-lg bg-surface-700/50">
                  <div className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3 h-3 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-brand-300">Pickup</p>
                    <p className="text-sm text-slate-300 truncate">{job.pickup.fullAddress}</p>
                    {job.pickup.mapLink && (
                      <a
                        href={job.pickup.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-1"
                      >
                        <Navigation className="w-3 h-3" />
                        Navigate
                      </a>
                    )}
                  </div>
                </div>

                {/* Drops toggle */}
                <button
                  onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-700/30 hover:bg-surface-700/50 transition-colors"
                >
                  <span className="text-sm text-slate-300">
                    {job.drops.length} {job.drops.length === 1 ? 'drop' : 'drops'}
                  </span>
                  {expandedJob === job.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Expanded drops */}
                {expandedJob === job.id && (
                  <div className="mt-2 space-y-2 animate-slide-up">
                    {job.drops.map((drop, i) => (
                      <div key={drop.id} className="flex items-start gap-2 p-2 rounded-lg bg-surface-700/30">
                        <div className="w-5 h-5 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-emerald-400">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{drop.customerName}</p>
                          <p className="text-xs text-slate-400 truncate">{drop.completeAddress}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-500">{drop.pincode}</span>
                            {drop.googleMapsLink && (
                              <a
                                href={drop.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-brand-400"
                              >
                                <Navigation className="w-2.5 h-2.5" />
                                Map
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button */}
                <div className="mt-3">
                  {job.status === 'accepted' && (
                    <Button
                      fullWidth
                      size="lg"
                      onClick={() => handlePickup(job.id)}
                      loading={actionLoading === job.id}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Confirm Pickup
                    </Button>
                  )}
                  {(job.status === 'picked_up' || job.status === 'out_for_delivery') && (
                    <Button
                      fullWidth
                      size="lg"
                      onClick={() => handleComplete(job.id)}
                      loading={actionLoading === job.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Delivery
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Jobs */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Completed Jobs</h2>

          {jobs.completed.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No completed jobs yet</p>
              <p className="text-sm text-slate-500 mt-1">Jobs you complete will show here</p>
            </Card>
          ) : (
            jobs.completed.map((job) => (
              <Card key={job.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{job.pickup.businessName}</h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{job.pickup.fullAddress}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-emerald-400 font-medium">
                        {job.dropsCount} drops
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(job.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <Badge status="completed" />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Profile */}
      {activeTab === 'profile' && user && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                <Truck className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
              <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span className="text-sm">{user.mobile}</span>
              </div>
              <div className="mt-2 px-3 py-1 rounded-full bg-emerald-600/15 text-emerald-400 text-xs font-medium">
                Driver
              </div>
            </div>
          </Card>

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
      )}
    </div>
  );
}
