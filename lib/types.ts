// ============================================================
// Delivery Platform — Core Type Definitions
// ============================================================
// Neutral naming: no "bizilot" prefixes.
// These types are the single source of truth for all entities.
// ============================================================

// --- Enums ---

export type UserRole = 'customer' | 'driver';

export type DriverStatus = 'available' | 'busy' | 'offline';

export type ApiClientStatus = 'active' | 'suspended';

export type JobStatus =
  | 'pending'
  | 'accepted'
  | 'picked_up'
  | 'out_for_delivery'
  | 'completed';

export type WebhookEvent =
  | 'job.created'
  | 'job.accepted'
  | 'job.picked_up'
  | 'job.out_for_delivery'
  | 'job.completed';

// --- User ---

export interface User {
  id: string;
  fullName: string;
  mobile: string;
  role: UserRole;
  createdAt: string; // ISO 8601
}

export interface CustomerProfile {
  userId: string;
}

export interface DriverProfile {
  userId: string;
  vehicleNumber: string;
  panNumber: string;
  aadharNumber: string;
  status: DriverStatus;
}

// --- API Client ---

export interface ApiClient {
  id: string;
  name: string;
  apiKey: string; // hashed for storage, plain returned once at registration
  status: ApiClientStatus;
  rateLimit: number; // requests per minute
  webhookUrl: string | null;
  webhookEvents: WebhookEvent[];
  contactMobile: string;
  createdAt: string;
}

// --- Business ---

export interface Business {
  id: string;
  name: string;
  phone: string;
  address: string;
  apiClientId: string;
  createdAt: string;
}

// --- Delivery Job ---

export interface Pickup {
  id: string;
  jobId: string;
  businessName: string;
  ownerName: string;
  fullAddress: string;
  mapLink: string;
  pincode: string;
}

export interface Drop {
  id: string;
  jobId: string;
  customerName: string;
  completeAddress: string;
  googleMapsLink: string;
  pincode: string;
  sequenceNumber: number;
}

export interface DeliveryJob {
  id: string;
  businessId: string;
  apiClientId: string;
  status: JobStatus;
  assignedDriverId: string | null;
  pickup: Pickup;
  drops: Drop[];
  createdAt: string;
  updatedAt: string;
}

// --- Status History ---

export interface StatusHistoryEntry {
  id: string;
  jobId: string;
  fromStatus: JobStatus | null; // null for initial creation
  toStatus: JobStatus;
  changedBy: string; // driverId or 'system'
  changedAt: string;
}

// --- Webhook Log ---

export interface WebhookLog {
  id: string;
  apiClientId: string;
  jobId: string;
  event: WebhookEvent;
  payload: string; // JSON stringified
  statusCode: number | null; // null if request failed
  sentAt: string;
}

// --- OTP Session ---

export interface OTPSession {
  mobile: string;
  otp: string;
  expiresAt: string;
  verified: boolean;
}

// --- API Response Helpers ---

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Public-facing driver info (no sensitive data) ---

export interface PublicDriverInfo {
  id: string;
  name: string;
  vehicleNumber: string;
  status: DriverStatus;
}

// --- Grouped jobs for driver dashboard ---

export interface GroupedJob {
  businessName: string;
  businessId: string;
  pickupAddress: string;
  mapLink: string;
  ownerName: string;
  pincode: string;
  jobs: DeliveryJob[];
  totalDrops: number;
}
