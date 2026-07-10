export const events = [
  {
    event: 'shipment.created',
    description: 'Fired when a new shipment is successfully created in the system.',
    payload: {
      shipmentId: 'string',
      trackingNumber: 'string',
      createdAt: 'string (ISO)'
    }
  },
  {
    event: 'shipment.accepted',
    description: 'Fired when a driver accepts the shipment assignment.',
    payload: {
      shipmentId: 'string',
      trackingNumber: 'string',
      driver: { name: 'string', vehicleNumber: 'string' }
    }
  },
  {
    event: 'shipment.picked_up',
    description: 'Fired when the driver confirms pickup of the goods.',
    payload: {
      shipmentId: 'string',
      trackingNumber: 'string'
    }
  },
  {
    event: 'shipment.out_for_delivery',
    description: 'Fired when the driver is en route to the first drop location.',
    payload: {
      shipmentId: 'string',
      trackingNumber: 'string'
    }
  },
  {
    event: 'shipment.completed',
    description: 'Fired when all drops have been successfully completed.',
    payload: {
      shipmentId: 'string',
      trackingNumber: 'string',
      completedAt: 'string (ISO)'
    }
  }
];
