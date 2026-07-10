export const examples = {
  createShipment: {
    pickup: {
      businessName: 'ABC Mobiles',
      ownerName: 'Ravi Kumar',
      fullAddress: '123 MG Road, Bangalore',
      mapLink: 'https://maps.google.com/',
      pincode: '560001'
    },
    drops: [
      {
        customerName: 'Customer 1',
        completeAddress: '456 Park Avenue, Bangalore',
        googleMapsLink: 'https://maps.google.com/',
        pincode: '560002'
      }
    ]
  },
  webhookPayload: {
    event: 'shipment.completed',
    timestamp: '2026-07-10T12:00:00Z',
    data: {
      shipmentId: 'shp_12345',
      trackingNumber: 'TRK-ABCDE',
      completedAt: '2026-07-10T12:00:00Z'
    }
  }
};
