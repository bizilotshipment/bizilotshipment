// ============================================================
// Delivery Platform — In-Memory Data Store
// ============================================================
// Simple in-memory store with collections for each entity.
// Will be replaced with a real database later.
// ============================================================

import type {
  User,
  CustomerProfile,
  DriverProfile,
  ApiClient,
  Business,
  DeliveryJob,
  StatusHistoryEntry,
  WebhookLog,
  OTPSession,
} from './types';

// --- Collections ---

const users: Map<string, User> = new Map();
const customerProfiles: Map<string, CustomerProfile> = new Map();
const driverProfiles: Map<string, DriverProfile> = new Map();
const apiClients: Map<string, ApiClient> = new Map();
const businesses: Map<string, Business> = new Map();
const deliveryJobs: Map<string, DeliveryJob> = new Map();
const statusHistory: Map<string, StatusHistoryEntry> = new Map();
const webhookLogs: Map<string, WebhookLog> = new Map();
const otpSessions: Map<string, OTPSession> = new Map(); // keyed by mobile

// --- Generic CRUD helpers ---

function createEntity<T>(
  collection: Map<string, T>,
  entity: T,
  key: string
): T {
  collection.set(key, entity);
  return entity;
}

function findById<T>(collection: Map<string, T>, id: string): T | undefined {
  return collection.get(id);
}

function findMany<T>(
  collection: Map<string, T>,
  predicate?: (item: T) => boolean
): T[] {
  const all = Array.from(collection.values());
  return predicate ? all.filter(predicate) : all;
}

function updateEntity<T>(
  collection: Map<string, T>,
  id: string,
  updates: Partial<T>
): T | undefined {
  const existing = collection.get(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates };
  collection.set(id, updated);
  return updated;
}

function deleteEntity<T>(collection: Map<string, T>, id: string): boolean {
  return collection.delete(id);
}

// --- User operations ---

export const db = {
  // Users
  users: {
    create: (user: User) => createEntity(users, user, user.id),
    findById: (id: string) => findById(users, id),
    findByMobile: (mobile: string) =>
      findMany(users, (u) => u.mobile === mobile)[0] || null,
    findMany: (predicate?: (u: User) => boolean) => findMany(users, predicate),
    update: (id: string, updates: Partial<User>) =>
      updateEntity(users, id, updates),
    delete: (id: string) => deleteEntity(users, id),
  },

  // Customer Profiles
  customerProfiles: {
    create: (profile: CustomerProfile) =>
      createEntity(customerProfiles, profile, profile.userId),
    findByUserId: (userId: string) => findById(customerProfiles, userId),
  },

  // Driver Profiles
  driverProfiles: {
    create: (profile: DriverProfile) =>
      createEntity(driverProfiles, profile, profile.userId),
    findByUserId: (userId: string) => findById(driverProfiles, userId),
    findMany: (predicate?: (p: DriverProfile) => boolean) =>
      findMany(driverProfiles, predicate),
    update: (userId: string, updates: Partial<DriverProfile>) =>
      updateEntity(driverProfiles, userId, updates),
  },

  // API Clients
  apiClients: {
    create: (client: ApiClient) => createEntity(apiClients, client, client.id),
    findById: (id: string) => findById(apiClients, id),
    findByApiKey: (apiKey: string) =>
      findMany(apiClients, (c) => c.apiKey === apiKey)[0] || null,
    findMany: (predicate?: (c: ApiClient) => boolean) =>
      findMany(apiClients, predicate),
    update: (id: string, updates: Partial<ApiClient>) =>
      updateEntity(apiClients, id, updates),
  },

  // Businesses
  businesses: {
    create: (business: Business) => createEntity(businesses, business, business.id),
    findById: (id: string) => findById(businesses, id),
    findByApiClientId: (apiClientId: string) =>
      findMany(businesses, (b) => b.apiClientId === apiClientId),
    findMany: (predicate?: (b: Business) => boolean) =>
      findMany(businesses, predicate),
    update: (id: string, updates: Partial<Business>) =>
      updateEntity(businesses, id, updates),
  },

  // Delivery Jobs
  deliveryJobs: {
    create: (job: DeliveryJob) => createEntity(deliveryJobs, job, job.id),
    findById: (id: string) => findById(deliveryJobs, id),
    findMany: (predicate?: (j: DeliveryJob) => boolean) =>
      findMany(deliveryJobs, predicate),
    update: (id: string, updates: Partial<DeliveryJob>) =>
      updateEntity(deliveryJobs, id, updates),
  },

  // Status History
  statusHistory: {
    create: (entry: StatusHistoryEntry) =>
      createEntity(statusHistory, entry, entry.id),
    findByJobId: (jobId: string) =>
      findMany(statusHistory, (s) => s.jobId === jobId),
  },

  // Webhook Logs
  webhookLogs: {
    create: (log: WebhookLog) => createEntity(webhookLogs, log, log.id),
    findByApiClientId: (apiClientId: string) =>
      findMany(webhookLogs, (l) => l.apiClientId === apiClientId),
    findByJobId: (jobId: string) =>
      findMany(webhookLogs, (l) => l.jobId === jobId),
  },

  // OTP Sessions
  otpSessions: {
    create: (session: OTPSession) =>
      createEntity(otpSessions, session, session.mobile),
    findByMobile: (mobile: string) => findById(otpSessions, mobile),
    delete: (mobile: string) => deleteEntity(otpSessions, mobile),
  },
};
