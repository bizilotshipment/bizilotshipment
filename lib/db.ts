import { PrismaClient } from '@prisma/client';
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Transform logic for Prisma JSON fields and Prisma return types to match our interfaces
const parseJson = (val: any) => (typeof val === 'string' ? JSON.parse(val) : val);

export const db = {
  // Users
  users: {
    create: async (user: User) => prisma.user.create({ data: user }),
    findById: async (id: string) => prisma.user.findUnique({ where: { id } }),
    findByMobile: async (mobile: string) => prisma.user.findUnique({ where: { mobile } }),
    findMany: async (where?: any) => prisma.user.findMany({ where }),
    update: async (id: string, data: Partial<User>) => prisma.user.update({ where: { id }, data }),
    delete: async (id: string) => prisma.user.delete({ where: { id } }),
  },

  // Customer Profiles
  customerProfiles: {
    create: async (profile: CustomerProfile) => prisma.customerProfile.create({ data: profile }),
    findByUserId: async (userId: string) => prisma.customerProfile.findUnique({ where: { userId } }),
  },

  // Driver Profiles
  driverProfiles: {
    create: async (profile: DriverProfile) => prisma.driverProfile.create({ data: profile }),
    findByUserId: async (userId: string) => prisma.driverProfile.findUnique({ where: { userId } }),
    findMany: async (where?: any) => prisma.driverProfile.findMany({ where }),
    update: async (userId: string, data: Partial<DriverProfile>) => prisma.driverProfile.update({ where: { userId }, data }),
  },

  // API Clients
  apiClients: {
    create: async (client: ApiClient) => prisma.apiClient.create({ data: client }),
    findById: async (id: string) => prisma.apiClient.findUnique({ where: { id } }),
    findByApiKey: async (apiKey: string) => prisma.apiClient.findUnique({ where: { apiKey } }),
    findMany: async (where?: any) => prisma.apiClient.findMany({ where }),
    update: async (id: string, data: Partial<ApiClient>) => prisma.apiClient.update({ where: { id }, data }),
  },

  // Accounts
  accounts: {
    create: async (account: Account) => prisma.account.create({ data: account }),
    findById: async (id: string) => prisma.account.findUnique({ where: { id } }),
    findByUserId: async (userId: string) => prisma.account.findMany({ where: { userId } }),
    findMany: async (where?: any) => prisma.account.findMany({ where }),
    update: async (id: string, data: Partial<Account>) => prisma.account.update({ where: { id }, data }),
  },

  // Shipments
  shipments: {
    create: async (shipment: Shipment) => {
      const result = await prisma.shipment.create({
        data: {
          ...shipment,
          pickup: shipment.pickup as any,
          drops: shipment.drops as any,
        },
      });
      return { ...result, pickup: parseJson(result.pickup), drops: parseJson(result.drops) } as unknown as Shipment;
    },
    findById: async (id: string) => {
      const result = await prisma.shipment.findUnique({ where: { id } });
      if (!result) return null;
      return { ...result, pickup: parseJson(result.pickup), drops: parseJson(result.drops) } as unknown as Shipment;
    },
    findMany: async (where?: any) => {
      const results = await prisma.shipment.findMany({ where });
      return results.map(result => ({
        ...result,
        pickup: parseJson(result.pickup),
        drops: parseJson(result.drops)
      })) as unknown as Shipment[];
    },
    update: async (id: string, data: Partial<Shipment>) => {
      const result = await prisma.shipment.update({
        where: { id },
        data: {
          ...data,
          ...(data.pickup && { pickup: data.pickup as any }),
          ...(data.drops && { drops: data.drops as any }),
        }
      });
      return { ...result, pickup: parseJson(result.pickup), drops: parseJson(result.drops) } as unknown as Shipment;
    },
  },

  // Assignments
  assignments: {
    create: async (assignment: Assignment) => prisma.assignment.create({ data: assignment }),
    findById: async (id: string) => prisma.assignment.findUnique({ where: { id } }),
    findByShipmentId: async (shipmentId: string) => prisma.assignment.findMany({ where: { shipmentId } }),
    findByDriverId: async (driverId: string) => prisma.assignment.findMany({ where: { driverId } }),
    update: async (id: string, data: Partial<Assignment>) => prisma.assignment.update({ where: { id }, data }),
  },

  // Status History
  statusHistory: {
    create: async (entry: StatusHistoryEntry) => prisma.statusHistory.create({ data: entry }),
    findByShipmentId: async (shipmentId: string) => prisma.statusHistory.findMany({ where: { shipmentId } }),
  },

  // Webhook Logs
  webhookLogs: {
    create: async (log: WebhookLog) => prisma.webhookLog.create({ 
      data: {
        ...log,
        responseStatus: log.statusCode, // Prisma schema name difference
        payload: log.payload as any,
        createdAt: new Date(log.sentAt)
      } 
    }),
    findByApiClientId: async (apiClientId: string) => prisma.webhookLog.findMany({ where: { apiClientId } }),
  },

  // OTP Sessions
  otpSessions: {
    create: async (session: OTPSession) => prisma.otpSession.create({ 
      data: {
        mobile: session.mobile,
        otp: session.otp,
        expiresAt: new Date(session.expiresAt),
        verified: session.verified
      } 
    }),
    findByMobile: async (mobile: string) => {
      const res = await prisma.otpSession.findUnique({ where: { mobile } });
      if (!res) return null;
      return { ...res, expiresAt: res.expiresAt.toISOString() } as OTPSession;
    },
    delete: async (mobile: string) => prisma.otpSession.delete({ where: { mobile } }),
  },
};
