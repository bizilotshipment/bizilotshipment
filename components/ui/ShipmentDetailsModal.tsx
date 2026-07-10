'use client';

import React from 'react';
import { MapPin, Package, Phone, Map, X, Clock, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ShipmentDetailsModal({ shipment, onClose, onEdit }: { shipment: any; onClose: () => void; onEdit?: () => void }) {
  if (!shipment) return null;

  const isPending = shipment.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-surface-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Shipment {shipment.trackingNumber}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                shipment.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                shipment.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                shipment.status === 'picked_up' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                shipment.status === 'out_for_delivery' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {shipment.status.replace('_', ' ')}
              </span>
              {shipment.pickupOtp && (
                <span className="text-xs bg-slate-800 text-brand-400 px-2 py-0.5 rounded-md font-mono border border-brand-500/30">
                  OTP: {shipment.pickupOtp}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Pickup Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 px-1">
              <MapPin className="w-4 h-4 text-brand-400" /> Pickup
            </h3>
            <Card className="p-3 bg-slate-800/20 border-slate-800/50">
              <p className="font-medium text-white mb-1">{shipment.pickup.ownerName}</p>
              <p className="text-sm text-slate-400 mb-2 leading-snug">{shipment.pickup.fullAddress}, {shipment.pickup.pincode}</p>
              <div className="flex items-center gap-3">
                <a href={`tel:${shipment.pickup.contactNumber}`} className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 px-2.5 py-1 rounded-md">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a href={shipment.pickup.mapLink || 'https://maps.google.com'} target="_blank" className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-400/10 px-2.5 py-1 rounded-md">
                  <Navigation className="w-3.5 h-3.5" /> Map
                </a>
              </div>
            </Card>
          </div>

          {/* Drop Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-1.5 px-1">
              <Package className="w-4 h-4 text-brand-400" /> Drops ({shipment.dropsCount || shipment.drops?.length})
            </h3>
            
            <div className="space-y-3">
              {shipment.drops?.map((drop: any, idx: number) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-800" />
                  <div className={`absolute left-[7px] top-2 w-[9px] h-[9px] rounded-full border-2 border-surface-900 ${drop.status === 'delivered' ? 'bg-emerald-400' : drop.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
                  
                  <Card className="p-3 bg-slate-800/20 border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-white text-sm">{drop.customerName}</p>
                      {drop.status === 'delivered' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase">
                          <CheckCircle className="w-3 h-3" /> Delivered
                        </span>
                      ) : drop.status !== 'pending' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase">
                          <AlertTriangle className="w-3 h-3" /> {drop.status}
                        </span>
                      ) : (
                        drop.dropOtp && (
                          <span className="text-[10px] bg-slate-800 text-brand-400 px-1.5 py-0.5 rounded font-mono border border-brand-500/30">
                            OTP: {drop.dropOtp}
                          </span>
                        )
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2 leading-snug">{drop.completeAddress}, {drop.pincode}</p>
                    <div className="flex items-center gap-3">
                      <a href={`tel:${drop.contactNumber}`} className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300">
                        <Phone className="w-3.5 h-3.5" /> {drop.contactNumber}
                      </a>
                      <a href={drop.googleMapsLink || 'https://maps.google.com'} target="_blank" className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300">
                        <Navigation className="w-3.5 h-3.5" /> Map
                      </a>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        {isPending && onEdit && (
          <div className="sticky bottom-0 bg-surface-900/90 backdrop-blur-md border-t border-slate-800 p-4 flex gap-3">
            <Button variant="outline" fullWidth onClick={onEdit}>
              Edit Shipment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
