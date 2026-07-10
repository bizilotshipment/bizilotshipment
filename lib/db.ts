// ============================================================
// Delivery Platform — File-Backed Data Store
// ============================================================
// Stores data in .bizilot-db.json so it survives server restarts.
// Will be replaced with a real database later.
// ============================================================

import fs from 'fs';
import path from 'path';

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

const DB_FILE = path.join(process.cwd(), '.bizilot-db.json');

let users: Map<string, User> = new Map();
let customerProfiles: Map<string, CustomerProfile> = new Map();
let driverProfiles: Map<string, DriverProfile> = new Map();
let apiClients: Map<string, ApiClient> = new Map();
let accounts: Map<string, Account> = new Map();
let shipments: Map<string, Shipment> = new Map();
let assignments: Map<string, Assignment> = new Map();
let statusHistory: Map<string, StatusHistoryEntry> = new Map();
let webhookLogs: Map<string, WebhookLog> = new Map();
let otpSessions: Map<string, OTPSession> = new Map();

// --- Persistence ---

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      users = new Map(Object.entries(data.users || {}));
      customerProfiles = new Map(Object.entries(data.customerProfiles || {}));
      driverProfiles = new Map(Object.entries(data.driverProfiles || {}));
      apiClients = new Map(Object.entries(data.apiClients || {}));
      accounts = new Map(Object.entries(data.accounts || {}));
      shipments = new Map(Object.entries(data.shipments || {}));
      assignments = new Map(Object.entries(data.assignments || {}));
      statusHistory = new Map(Object.entries(data.statusHistory || {}));
      webhookLogs = new Map(Object.entries(data.webhookLogs || {}));
      otpSessions = new Map(Object.entries(data.otpSessions || {}));
    }
  } catch (err) {
    console.error('Failed to load DB:', err);
  }
}

function persistDb() {
  const data = {
    users: Object.fromEntries(users),
    customerProfiles: Object.fromEntries(customerProfiles),
    driverProfiles: Object.fromEntries(driverProfiles),
    apiClients: Object.fromEntries(apiClients),
    accounts: Object.fromEntries(accounts),
    shipments: Object.fromEntries(shipments),
    assignments: Object.fromEntries(assignments),
    statusHistory: Object.fromEntries(statusHistory),
    webhookLogs: Object.fromEntries(webhookLogs),
    otpSessions: Object.fromEntries(otpSessions),
  };
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

loadDb();

// --- Generic CRUD helpers ---

function createEntity<T>(
  collection: Map<string, T>,
  entity: T,
  key: string
): T {
  collection.set(key, entity);
  persistDb();
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
  persistDb();
  return updated;
}

function deleteEntity<T>(collection: Map<string, T>, id: string): boolean {
  const result = collection.delete(id);
  if (result) persistDb();
  return result;
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
