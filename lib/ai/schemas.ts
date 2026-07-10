export const schemas = {
  Shipment: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Internal UUID (e.g., shp_xxx)' },
      trackingNumber: { type: 'string', description: 'Public tracking number (e.g., TRK-XXX)' },
      accountId: { type: 'string', description: 'ID of the account that owns the shipment' },
      status: { type: 'string', enum: ['pending', 'accepted', 'picked_up', 'out_for_delivery', 'completed'] },
      pickup: { $ref: '#/components/schemas/Pickup' },
      drops: { type: 'array', items: { $ref: '#/components/schemas/Drop' } },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  Pickup: {
    type: 'object',
    properties: {
      businessName: { type: 'string' },
      ownerName: { type: 'string' },
      fullAddress: { type: 'string' },
      mapLink: { type: 'string', format: 'url' },
      pincode: { type: 'string' }
    }
  },
  Drop: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      customerName: { type: 'string' },
      completeAddress: { type: 'string' },
      googleMapsLink: { type: 'string', format: 'url' },
      pincode: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'completed', 'failed'] }
    }
  },
  Assignment: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      shipmentId: { type: 'string' },
      driverId: { type: 'string' },
      status: { type: 'string', enum: ['assigned', 'accepted', 'rejected', 'completed'] },
      assignedAt: { type: 'string', format: 'date-time' }
    }
  },
  ApiClient: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      accountId: { type: 'string' },
      webhookUrl: { type: 'string', format: 'url', nullable: true },
      webhookEvents: { type: 'array', items: { type: 'string' } },
      createdAt: { type: 'string', format: 'date-time' }
    }
  }
};
