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

export type AccountType = 'personal' | 'business' | 'integration';

export type ShipmentStatus =
  | 'pending'
  | 'accepted'
  | 'picked_up'
  | 'out_for_delivery'
  | 'completed';

export type WebhookEvent =
  | 'shipment.created'
  | 'shipment.accepted'
  | 'shipment.picked_up'
  | 'shipment.out_for_delivery'
  | 'shipment.completed';

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
  accountId: string;
  apiKey: string; // hashed for storage, plain returned once at registration
  status: ApiClientStatus;
  rateLimit: number; // requests per minute
  webhookUrl: string | null;
  webhookEvents: WebhookEvent[];
  contactMobile: string;
  createdAt: string;
}

// --- Account ---

export interface Account {
  id: string; // format: acc_xxxx
  name: string; // e.g. "John Doe", "ABC Shop", "Shopify Integration"
  type: AccountType;
  userId: string | null; // null if created strictly via integration, string if human-owned
  createdAt: string;
}

// --- Shipment ---

export interface Pickup {
  id: string;
  shipmentId: string;
  businessName: string; // Kept as string for legacy naming, but represents pickup location name
  ownerName: string;
  contactNumber: string;
  fullAddress: string;
  mapLink: string;
  pincode: string;
}

export interface Drop {
  id: string;
  shipmentId: string;
  customerName: string;
  contactNumber: string;
  completeAddress: string;
  googleMapsLink: string;
  pincode: string;
  sequenceNumber: number;
  status: 'pending' | 'delivered' | 'failed';
  dropOtp?: string;
  failureReasons?: string[]; // e.g. ['Damaged', 'Missing Product']
}

export interface Shipment {
  id: string; // format: shp_xxxx
  trackingNumber: string; // format: TRK-XXXXXXX
  accountId: string;
  apiClientId: string | null; // null if created manually via the Console UI
  status: ShipmentStatus;
  pickupOtp?: string;
  pickup: Pickup;
  drops: Drop[];
  createdAt: string;
  updatedAt: string;
}

// --- Assignment ---

export interface Assignment {
  id: string; // format: asg_xxxx
  shipmentId: string;
  driverId: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedAt: string;
}

// --- Status History ---

export interface StatusHistoryEntry {
  id: string;
  shipmentId: string;
  fromStatus: ShipmentStatus | null; // null for initial creation
  toStatus: ShipmentStatus;
  changedBy: string; // driverId or 'system'
  changedAt: string;
}

// --- Webhook Log ---

export interface WebhookLog {
  id: string;
  apiClientId: string;
  shipmentId: string;
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

export interface PublicDriverInfo {
  id: string;
  name: string;
  vehicleNumber: string;
  status: DriverStatus;
}

export interface GroupedShipment {
  businessName: string;
  accountId: string;
  pickupAddress: string;
  mapLink: string;
  ownerName: string;
  pincode: string;
  shipments: Shipment[];
  totalDrops: number;
}
