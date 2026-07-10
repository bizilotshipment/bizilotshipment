// ============================================================
// Delivery Platform — File-Backed Data Store
// ============================================================
// Stores data in .bizilot-db.json so it survives server restarts.
// Reads synchronously to prevent stale data across Next.js isolates.
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

const DB_FILE = path.join(process.cwd(), '.bizilot-db.json');

// --- Persistence ---

interface DbData {
  users: Record<string, User>;
  customerProfiles: Record<string, CustomerProfile>;
  driverProfiles: Record<string, DriverProfile>;
  apiClients: Record<string, ApiClient>;
  accounts: Record<string, Account>;
  shipments: Record<string, Shipment>;
  assignments: Record<string, Assignment>;
  statusHistory: Record<string, StatusHistoryEntry>;
  webhookLogs: Record<string, WebhookLog>;
  otpSessions: Record<string, OTPSession>;
  [key: string]: any;
}

const defaultData: DbData = {
  users: {},
  customerProfiles: {},
  driverProfiles: {},
  apiClients: {},
  accounts: {},
  shipments: {},
  assignments: {},
  statusHistory: {},
  webhookLogs: {},
  otpSessions: {},
};

function readData(): DbData {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to read DB file:', err);
  }
  return { ...defaultData };
}

function writeData(data: DbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write DB file:', err);
  }
}

// --- Generic CRUD helpers ---

function createEntity<T>(collectionName: string, entity: T, key: string): T {
  const data = readData();
  if (!data[collectionName]) data[collectionName] = {};
  data[collectionName][key] = entity;
  writeData(data);
  return entity;
}

function findById<T>(collectionName: string, id: string): T | undefined {
  return readData()[collectionName]?.[id];
}

function findMany<T>(collectionName: string, predicate?: (item: T) => boolean): T[] {
  const all = Object.values(readData()[collectionName] || {}) as T[];
  return predicate ? all.filter(predicate) : all;
}

function updateEntity<T>(collectionName: string, id: string, updates: Partial<T>): T | undefined {
  const data = readData();
  const existing = data[collectionName]?.[id];
  if (!existing) return undefined;
  const updated = { ...existing, ...updates };
  data[collectionName][id] = updated;
  writeData(data);
  return updated;
}

function deleteEntity(collectionName: string, id: string): boolean {
  const data = readData();
  if (!data[collectionName]?.[id]) return false;
  delete data[collectionName][id];
  writeData(data);
  return true;
}

// --- Collections ---

export const db = {
  // Users
  users: {
    create: (user: User) => createEntity('users', user, user.id),
    findById: (id: string) => findById<User>('users', id),
    findByMobile: (mobile: string) =>
      findMany<User>('users', (u) => u.mobile === mobile)[0] || null,
    findMany: (predicate?: (u: User) => boolean) => findMany<User>('users', predicate),
    update: (id: string, updates: Partial<User>) =>
      updateEntity<User>('users', id, updates),
    delete: (id: string) => deleteEntity('users', id),
  },

  // Customer Profiles
  customerProfiles: {
    create: (profile: CustomerProfile) =>
      createEntity('customerProfiles', profile, profile.userId),
    findByUserId: (userId: string) => findById<CustomerProfile>('customerProfiles', userId),
  },

  // Driver Profiles
  driverProfiles: {
    create: (profile: DriverProfile) =>
      createEntity('driverProfiles', profile, profile.userId),
    findByUserId: (userId: string) => findById<DriverProfile>('driverProfiles', userId),
    findMany: (predicate?: (p: DriverProfile) => boolean) =>
      findMany<DriverProfile>('driverProfiles', predicate),
    update: (userId: string, updates: Partial<DriverProfile>) =>
      updateEntity<DriverProfile>('driverProfiles', userId, updates),
  },

  // API Clients
  apiClients: {
    create: (client: ApiClient) => createEntity('apiClients', client, client.id),
    findById: (id: string) => findById<ApiClient>('apiClients', id),
    findByApiKey: (apiKey: string) =>
      findMany<ApiClient>('apiClients', (c) => c.apiKey === apiKey)[0] || null,
    findMany: (predicate?: (c: ApiClient) => boolean) =>
      findMany<ApiClient>('apiClients', predicate),
    update: (id: string, updates: Partial<ApiClient>) =>
      updateEntity<ApiClient>('apiClients', id, updates),
  },

  // Accounts
  accounts: {
    create: (account: Account) => createEntity('accounts', account, account.id),
    findById: (id: string) => findById<Account>('accounts', id),
    findByUserId: (userId: string) =>
      findMany<Account>('accounts', (a) => a.userId === userId),
    findMany: (predicate?: (a: Account) => boolean) =>
      findMany<Account>('accounts', predicate),
    update: (id: string, updates: Partial<Account>) =>
      updateEntity<Account>('accounts', id, updates),
  },

  // Shipments
  shipments: {
    create: (shipment: Shipment) => createEntity('shipments', shipment, shipment.id),
    findById: (id: string) => findById<Shipment>('shipments', id),
    findMany: (predicate?: (s: Shipment) => boolean) =>
      findMany<Shipment>('shipments', predicate),
    update: (id: string, updates: Partial<Shipment>) =>
      updateEntity<Shipment>('shipments', id, updates),
  },

  // Assignments
  assignments: {
    create: (assignment: Assignment) => createEntity('assignments', assignment, assignment.id),
    findById: (id: string) => findById<Assignment>('assignments', id),
    findByShipmentId: (shipmentId: string) =>
      findMany<Assignment>('assignments', (a) => a.shipmentId === shipmentId),
    findByDriverId: (driverId: string) =>
      findMany<Assignment>('assignments', (a) => a.driverId === driverId),
    update: (id: string, updates: Partial<Assignment>) =>
      updateEntity<Assignment>('assignments', id, updates),
  },

  // Status History
  statusHistory: {
    create: (entry: StatusHistoryEntry) =>
      createEntity('statusHistory', entry, entry.id),
    findByShipmentId: (shipmentId: string) =>
      findMany<StatusHistoryEntry>('statusHistory', (s) => s.shipmentId === shipmentId),
  },

  // Webhook Logs
  webhookLogs: {
    create: (log: WebhookLog) => createEntity('webhookLogs', log, log.id),
    findByApiClientId: (apiClientId: string) =>
      findMany<WebhookLog>('webhookLogs', (l) => l.apiClientId === apiClientId),
    findByShipmentId: (shipmentId: string) =>
      findMany<WebhookLog>('webhookLogs', (l) => l.shipmentId === shipmentId),
  },

  // OTP Sessions
  otpSessions: {
    create: (session: OTPSession) =>
      createEntity('otpSessions', session, session.mobile),
    findByMobile: (mobile: string) => findById<OTPSession>('otpSessions', mobile),
    delete: (mobile: string) => deleteEntity('otpSessions', mobile),
  },
};
