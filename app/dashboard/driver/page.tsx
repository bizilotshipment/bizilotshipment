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
  AlertTriangle,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Shipment, GroupedShipment, ShipmentStatus } from '@/lib/types';

interface ActiveShipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  pickup: Shipment['pickup'];
  drops: Shipment['drops'];
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

interface CompletedShipment {
  id: string;
  trackingNumber: string;
  pickup: { businessName: string; fullAddress: string };
  dropsCount: number;
  completedAt: string;
}

interface ShipmentsData {
  available: GroupedShipment[];
  active: ActiveShipment[];
  completed: CompletedShipment[];
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
  
  const [shipments, setShipments] = useState<ShipmentsData>({ available: [], active: [], completed: [] });
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [deliveryModal, setDeliveryModal] = useState<{ shipmentId: string; dropIndex: number; otp: string } | null>(null);
  const [failureReasons, setFailureReasons] = useState<string[]>([]);
  const [deliveryError, setDeliveryError] = useState('');

  const fetchShipments = useCallback(async () => {
    try {
      const res = await fetch('/api/shipments');
      const data = await res.json();
      if (data.success) {
        setShipments(data.data);
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
    fetchShipments();
    fetchUser();
  }, [fetchShipments, fetchUser]);

  const handleAccept = async (shipmentId: string) => {
    setActionLoading(shipmentId);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/accept`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchShipments();
        router.push('/dashboard/driver?tab=active');
      }
    } catch {
      // handle error
    } finally {
      setActionLoading(null);
    }
  };

  const handlePickup = async (shipmentId: string, otp: string) => {
    setActionLoading(shipmentId);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/pickup`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        await fetchShipments();
        setOtpInputs(prev => ({...prev, [shipmentId]: ''}));
      } else {
        alert(data.error);
        setOtpInputs(prev => ({...prev, [shipmentId]: ''}));
      }
    } catch {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    if (!deliveryModal) return;
    if (failureReasons.length === 0) return setDeliveryError('Please select at least one outcome.');
    
    setActionLoading('complete');
    setDeliveryError('');
    try {
      const res = await fetch(`/api/shipments/${deliveryModal.shipmentId}/complete`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropIndex: deliveryModal.dropIndex, otp: deliveryModal.otp, failureReasons })
      });
      const data = await res.json();
      if (data.success) {
        setDeliveryModal(null);
        setFailureReasons([]);
        setOtpInputs(prev => ({...prev, [`${deliveryModal.shipmentId}-${deliveryModal.dropIndex}`]: ''}));
        await fetchShipments();
      } else {
        setDeliveryError(data.error || 'Failed to complete delivery');
      }
    } catch {
      setDeliveryError('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePickupOtpChange = (shipmentId: string, val: string) => {
    const clean = val.replace(/\D/g, '');
    setOtpInputs(prev => ({...prev, [shipmentId]: clean}));
    if (clean.length === 4) {
      handlePickup(shipmentId, clean);
    }
  };

  const handleDropOtpChange = (shipmentId: string, dropIndex: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const key = `${shipmentId}-${dropIndex}`;
    setOtpInputs(prev => ({...prev, [key]: clean}));
    if (clean.length === 4) {
      setDeliveryModal({ shipmentId, dropIndex, otp: clean });
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/me', { method: 'POST' });
    router.push('/signin/driver');
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
      {/* Available Shipments */}
      {activeTab === 'available' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Available Shipments</h2>
            <button
              onClick={fetchShipments}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              aria-label="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {shipments.available.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No shipments available</p>
              <p className="text-sm text-slate-500 mt-1">New shipments will appear here</p>
            </Card>
          ) : (
            shipments.available.map((group) => (
              <Card key={group.accountId} className="p-4">
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
                        {group.totalDrops} {group.totalDrops === 1 ? 'drop' : 'drops'}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{group.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Accept button for each shipment in the group */}
                <div className="mt-3 space-y-2">
                  {group.shipments.map((shipment) => (
                    <div key={shipment.id} className="flex flex-col gap-2 p-2 rounded-lg bg-surface-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400">
                          {shipment.trackingNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          {shipment.drops.length} drops
                        </span>
                      </div>
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() => handleAccept(shipment.id)}
                        loading={actionLoading === shipment.id}
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

      {/* Active Shipments */}
      {activeTab === 'active' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Assigned Shipments</h2>

          {shipments.active.length === 0 ? (
            <Card className="p-8 text-center">
              <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No assigned shipments</p>
              <p className="text-sm text-slate-500 mt-1">Accept shipments from the Available tab</p>
            </Card>
          ) : (
            shipments.active.map((shipment) => (
              <Card key={shipment.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-white">{shipment.pickup.businessName}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{shipment.trackingNumber}</span>
                  </div>
                  <Badge status={shipment.status} />
                </div>

                {/* Pickup */}
                <div className="flex items-start gap-2 mb-2 p-2 rounded-lg bg-surface-700/50">
                  <div className="w-5 h-5 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3 h-3 text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-brand-300">Pickup</p>
                    <p className="text-sm text-slate-300 truncate">{shipment.pickup.fullAddress}</p>
                    {shipment.pickup.mapLink && (
                      <a
                        href={shipment.pickup.mapLink}
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
                  onClick={() => setExpandedShipment(expandedShipment === shipment.id ? null : shipment.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-700/30 hover:bg-surface-700/50 transition-colors"
                >
                  <span className="text-sm text-slate-300">
                    {shipment.drops.length} {shipment.drops.length === 1 ? 'drop' : 'drops'}
                  </span>
                  {expandedShipment === shipment.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Expanded drops */}
                {expandedShipment === shipment.id && (
                  <div className="mt-2 space-y-2 animate-slide-up">
                    {shipment.drops.map((drop, i) => (
                      <div key={drop.id} className="flex flex-col gap-2 p-2 rounded-lg bg-surface-700/30">
                        <div className="flex items-start gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${drop.status === 'delivered' ? 'bg-emerald-600/20 text-emerald-400' : drop.status === 'pending' ? 'bg-amber-600/20 text-amber-400' : 'bg-red-600/20 text-red-400'}`}>
                            {drop.status === 'delivered' ? <CheckCircle className="w-3 h-3" /> : drop.status === 'pending' ? <span className="text-[10px] font-bold">{i + 1}</span> : <AlertTriangle className="w-3 h-3" />}
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

                        {drop.status === 'pending' && shipment.status !== 'accepted' && (
                          <div className="mt-1 flex flex-col gap-1.5 pl-7 border-t border-slate-700/30 pt-2">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Verify Delivery OTP</p>
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="XXXX"
                              className="input-field text-center tracking-widest text-sm py-1.5"
                              value={otpInputs[`${shipment.id}-${i}`] || ''}
                              onChange={(e) => handleDropOtpChange(shipment.id, i, e.target.value)}
                              disabled={actionLoading === 'complete' && deliveryModal?.dropIndex === i}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action button */}
                <div className="mt-3">
                  {shipment.status === 'accepted' && (
                    <div className="flex flex-col gap-2 p-3 bg-surface-700/50 rounded-lg border border-purple-500/20">
                      <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider text-center">Verify Pickup OTP</p>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="XXXX"
                        className="input-field text-center tracking-widest text-lg py-2"
                        value={otpInputs[shipment.id] || ''}
                        onChange={(e) => handlePickupOtpChange(shipment.id, e.target.value)}
                        disabled={actionLoading === shipment.id}
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Completed Shipments */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Completed Shipments</h2>

          {shipments.completed.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No completed shipments yet</p>
              <p className="text-sm text-slate-500 mt-1">Shipments you complete will show here</p>
            </Card>
          ) : (
            shipments.completed.map((shipment) => (
              <Card key={shipment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{shipment.pickup.businessName}</h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{shipment.trackingNumber}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{shipment.pickup.fullAddress}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-emerald-400 font-medium">
                        {shipment.dropsCount} drops
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date(shipment.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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

      {/* Delivery Completion Modal */}
      {deliveryModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeliveryModal(null)}>
          <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Complete Delivery</h3>
              <button onClick={() => setDeliveryModal(null)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-300 font-medium mb-3">Delivery Outcome</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Successful', 'Damaged', 'Missing Product', 'Wrong Product', 'Not Sealed'].map(reason => (
                    <label key={reason} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      failureReasons.includes(reason) 
                        ? 'border-brand-500 bg-brand-500/10 text-brand-400' 
                        : 'border-slate-700 bg-surface-800 text-slate-400 hover:border-slate-600'
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={failureReasons.includes(reason)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (reason === 'Successful') setFailureReasons(['Successful']);
                            else setFailureReasons(prev => [...prev.filter(r => r !== 'Successful'), reason]);
                          } else {
                            setFailureReasons(prev => prev.filter(r => r !== reason));
                          }
                        }}
                      />
                      <span className="text-xs font-medium">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              {deliveryError && (
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {deliveryError}
                </div>
              )}

              <Button 
                fullWidth 
                onClick={handleComplete}
                loading={actionLoading === 'complete'}
                disabled={failureReasons.length === 0}
              >
                Submit Delivery
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
