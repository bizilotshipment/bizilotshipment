// ============================================================
// Delivery Platform — Zod Validation Schemas
// ============================================================
// All API input validation in one place.
// ============================================================

import { z } from 'zod';

// --- Auth Schemas ---

export const SendOTPSchema = z.object({
  mobile: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number is too long')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
  role: z.enum(['customer', 'driver']),
});

export const VerifyOTPSchema = z.object({
  mobile: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\d+$/),
  otp: z
    .string()
    .length(4, 'OTP must be exactly 4 digits')
    .regex(/^\d{4}$/, 'OTP must be 4 digits'),
  role: z.enum(['customer', 'driver']),
  signup: z
    .object({
      fullName: z.string().min(2, 'Name must be at least 2 characters'),
      role: z.enum(['customer', 'driver']),
      vehicleNumber: z.string().optional(),
      panNumber: z.string().optional(),
      aadharNumber: z.string().optional(),
    })
    .optional(),
});

// --- API Client Registration ---

export const RegisterClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  contactMobile: z
    .string()
    .min(10)
    .max(15)
    .regex(/^\d+$/),
  webhookUrl: z.string().url('Must be a valid URL').optional().nullable(),
});

// --- Shipment Schemas ---

export const PickupSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  fullAddress: z.string().min(1, 'Full address is required'),
  mapLink: z.string().min(1, 'Map link is required'),
  pincode: z.string().min(1, 'Pincode is required'),
});

export const DropSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  completeAddress: z.string().min(1, 'Complete address is required'),
  googleMapsLink: z.string().min(1, 'Google Maps link is required'),
  pincode: z.string().min(1, 'Pincode is required'),
});

export const CreateJobSchema = z.object({
  accountId: z.string().optional(),
  pickup: PickupSchema,
  drops: z
    .array(DropSchema)
    .min(1, 'At least one drop is required'),
});

// --- Webhook Config ---

export const WebhookConfigSchema = z.object({
  webhookUrl: z.string().url('Must be a valid URL'),
  events: z
    .array(
      z.enum([
        'shipment.created',
        'shipment.accepted',
        'shipment.picked_up',
        'shipment.out_for_delivery',
        'shipment.completed',
      ])
    )
    .min(1, 'At least one event is required'),
});

// --- Query Params ---

export const JobListQuerySchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'picked_up', 'out_for_delivery', 'completed'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
