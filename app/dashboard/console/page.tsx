'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Phone, LogOut, PackagePlus, List, TerminalSquare, Sparkles, MapPin, Search, ArrowRight, Loader2, Key } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UserData {
  id: string;
  fullName: string;
  mobile: string;
  role: string;
  createdAt: string;
}

export default function ConsoleDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'shipments';
  const [user, setUser] = useState<UserData | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        router.push('/signin/customer');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/me', { method: 'POST' });
    router.push('/signin/customer');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      
      <div className="mb-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Shipment Console</h1>
          <p className="text-slate-400">Manage your shipments and integrations.</p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 animate-slide-up">
        {activeTab === 'shipments' && <ShipmentsView />}
        {activeTab === 'create' && <CreateShipmentView onSuccess={() => router.push('/dashboard/console?tab=shipments')} />}
        {activeTab === 'profile' && (
          <ProfileView user={user} handleLogout={handleLogout} loggingOut={loggingOut} />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Shipments View
// ----------------------------------------------------------------------
function ShipmentsView() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/shipments');
      const data = await res.json();
      if (data.success) {
        setShipments(data.data.shipments);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch shipments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  if (loading) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-500" />
        <p>Loading your shipments...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-500/20 bg-red-500/5">
        <p className="text-red-400 text-center">{error}</p>
      </Card>
    );
  }

  if (shipments.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4">
          <PackagePlus className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No shipments yet</h3>
        <p className="text-slate-400 max-w-sm mx-auto">
          You haven't created any shipments. Create your first delivery to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {shipments.map((s) => (
        <Card key={s.id} className="p-5 hover:border-brand-500/30 transition-colors group">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {s.trackingNumber}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                  s.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  s.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  s.status === 'picked_up' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  s.status === 'out_for_delivery' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {s.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Created on {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-right text-xs font-medium text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg">
              {s.dropsCount} Drop{s.dropsCount > 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span className="font-medium truncate max-w-[150px]">{s.pickup.businessName}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
            <div className="flex-1 truncate">
              {s.dropsCount === 1 ? (s.drops?.[0]?.customerName || '1 Customer') : 'Multiple Customers'}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// Create Shipment View
// ----------------------------------------------------------------------
function CreateShipmentView({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pickup, setPickup] = useState({
    businessName: '',
    ownerName: '',
    fullAddress: '',
    mapLink: '',
    pincode: ''
  });

  const [drops, setDrops] = useState([{
    customerName: '',
    completeAddress: '',
    googleMapsLink: '',
    pincode: ''
  }]);

  const addDrop = () => {
    setDrops([...drops, { customerName: '', completeAddress: '', googleMapsLink: '', pincode: '' }]);
  };

  const removeDrop = (index: number) => {
    if (drops.length > 1) {
      setDrops(drops.filter((_, i) => i !== index));
    }
  };

  const updateDrop = (index: number, field: string, value: string) => {
    const newDrops = [...drops];
    newDrops[index] = { ...newDrops[index], [field]: value };
    setDrops(newDrops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickup, drops })
      });
      
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to create shipment');
      }
    } catch (err) {
      setError('A network error occurred.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-400" /> Pickup Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" placeholder="Pickup Name (e.g. My Shop)" className="input-field"
            value={pickup.businessName} onChange={e => setPickup({...pickup, businessName: e.target.value})} />
          <input required type="text" placeholder="Contact Person Name" className="input-field"
            value={pickup.ownerName} onChange={e => setPickup({...pickup, ownerName: e.target.value})} />
          <input required type="text" placeholder="Full Address" className="input-field md:col-span-2"
            value={pickup.fullAddress} onChange={e => setPickup({...pickup, fullAddress: e.target.value})} />
          <input required type="url" placeholder="Google Maps Link" className="input-field"
            value={pickup.mapLink} onChange={e => setPickup({...pickup, mapLink: e.target.value})} />
          <input required type="text" placeholder="Pincode" className="input-field"
            value={pickup.pincode} onChange={e => setPickup({...pickup, pincode: e.target.value})} />
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 px-1">
          <PackagePlus className="w-5 h-5 text-brand-400" /> Drop Locations
        </h3>
        
        {drops.map((drop, index) => (
          <Card key={index} className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-700 group-hover:bg-brand-500 transition-colors" />
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-300">Drop #{index + 1}</span>
              {drops.length > 1 && (
                <button type="button" onClick={() => removeDrop(index)} className="text-xs text-red-400 hover:text-red-300">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="Customer Name" className="input-field"
                value={drop.customerName} onChange={e => updateDrop(index, 'customerName', e.target.value)} />
              <input required type="text" placeholder="Pincode" className="input-field"
                value={drop.pincode} onChange={e => updateDrop(index, 'pincode', e.target.value)} />
              <input required type="text" placeholder="Complete Delivery Address" className="input-field md:col-span-2"
                value={drop.completeAddress} onChange={e => updateDrop(index, 'completeAddress', e.target.value)} />
              <input required type="url" placeholder="Google Maps Link" className="input-field md:col-span-2"
                value={drop.googleMapsLink} onChange={e => updateDrop(index, 'googleMapsLink', e.target.value)} />
            </div>
          </Card>
        ))}

        <Button type="button" variant="outline" fullWidth onClick={addDrop} className="border-dashed py-6 text-slate-400 hover:text-white">
          + Add Another Drop Location
        </Button>
      </div>

      <div className="pt-4">
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Create Shipment
        </Button>
      </div>
    </form>
  );
}

// ----------------------------------------------------------------------
// Profile View
// ----------------------------------------------------------------------
function ProfileView({ user, handleLogout, loggingOut }: { user: UserData; handleLogout: () => void; loggingOut: boolean }) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
            <User className="w-9 h-9 text-white" />
          </div>

          <h2 className="text-xl font-bold text-white">{user.fullName}</h2>

          <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
            <Phone className="w-3.5 h-3.5" />
            <span className="text-sm">{user.mobile}</span>
          </div>

          <div className="mt-2 px-3 py-1 rounded-full bg-brand-600/15 text-brand-400 text-xs font-medium">
            Console User
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Account created on {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <TerminalSquare className="w-4 h-4 text-brand-400" /> Developer Access
        </h3>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          The Shipment Console is an official client of the Public API. If you have custom software or an ERP, you can generate an API Key to integrate programmatically.
        </p>
        <Button variant="outline" fullWidth className="justify-between group" onClick={() => window.open('/docs', '_blank')}>
          <span className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400 group-hover:text-white" /> Generate API Key
          </span>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
        </Button>
      </Card>

      <Button
        variant="outline"
        fullWidth
        size="lg"
        onClick={handleLogout}
        loading={loggingOut}
        className="!text-red-400 !border-red-500/20 hover:!bg-red-500/10 mt-6"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
