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
  Account,
  Shipment,
  Assignment,
  StatusHistoryEntry,
  WebhookLog,
  OTPSession,
} from './types';

// --- Collections ---

const users: Map<string, User> = new Map();
const customerProfiles: Map<string, CustomerProfile> = new Map();
const driverProfiles: Map<string, DriverProfile> = new Map();
const apiClients: Map<string, ApiClient> = new Map();
const accounts: Map<string, Account> = new Map();
const shipments: Map<string, Shipment> = new Map();
const assignments: Map<string, Assignment> = new Map();
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
      findMany(apiClients, (c) => c.apiKey === apiKey)[0] || null, // Will be updated to compare hashes in auth
    findMany: (predicate?: (c: ApiClient) => boolean) =>
      findMany(apiClients, predicate),
    update: (id: string, updates: Partial<ApiClient>) =>
      updateEntity(apiClients, id, updates),
  },

  // Accounts
  accounts: {
    create: (account: Account) => createEntity(accounts, account, account.id),
    findById: (id: string) => findById(accounts, id),
    findByUserId: (userId: string) =>
      findMany(accounts, (a) => a.userId === userId),
    findMany: (predicate?: (a: Account) => boolean) =>
      findMany(accounts, predicate),
    update: (id: string, updates: Partial<Account>) =>
      updateEntity(accounts, id, updates),
  },

  // Shipments
  shipments: {
    create: (shipment: Shipment) => createEntity(shipments, shipment, shipment.id),
    findById: (id: string) => findById(shipments, id),
    findMany: (predicate?: (s: Shipment) => boolean) =>
      findMany(shipments, predicate),
    update: (id: string, updates: Partial<Shipment>) =>
      updateEntity(shipments, id, updates),
  },

  // Assignments
  assignments: {
    create: (assignment: Assignment) => createEntity(assignments, assignment, assignment.id),
    findById: (id: string) => findById(assignments, id),
    findByShipmentId: (shipmentId: string) =>
      findMany(assignments, (a) => a.shipmentId === shipmentId),
    findByDriverId: (driverId: string) =>
      findMany(assignments, (a) => a.driverId === driverId),
    update: (id: string, updates: Partial<Assignment>) =>
      updateEntity(assignments, id, updates),
  },

  // Status History
  statusHistory: {
    create: (entry: StatusHistoryEntry) =>
      createEntity(statusHistory, entry, entry.id),
    findByShipmentId: (shipmentId: string) =>
      findMany(statusHistory, (s) => s.shipmentId === shipmentId),
  },

  // Webhook Logs
  webhookLogs: {
    create: (log: WebhookLog) => createEntity(webhookLogs, log, log.id),
    findByApiClientId: (apiClientId: string) =>
      findMany(webhookLogs, (l) => l.apiClientId === apiClientId),
    findByShipmentId: (shipmentId: string) =>
      findMany(webhookLogs, (l) => l.shipmentId === shipmentId),
  },

  // OTP Sessions
  otpSessions: {
    create: (session: OTPSession) =>
      createEntity(otpSessions, session, session.mobile),
    findByMobile: (mobile: string) => findById(otpSessions, mobile),
    delete: (mobile: string) => deleteEntity(otpSessions, mobile),
  },
};
