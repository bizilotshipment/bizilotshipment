'use client';

import React from 'react';
import type { ShipmentStatus } from '@/lib/types';

interface BadgeProps {
  status: ShipmentStatus;
  className?: string;
}

const statusLabels: Record<ShipmentStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
};

export function Badge({ status, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
        status-${status}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current`} />
      {statusLabels[status]}
    </span>
  );
}
