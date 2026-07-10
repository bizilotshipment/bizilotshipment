export const concepts = {
  Shipment: 'A generic entity representing a delivery request. It contains exactly one Pickup and one or more Drops.',
  Pickup: 'The origin location where the driver collects the goods (usually an Account/Shop).',
  Drop: 'The destination location(s) where the driver delivers the goods to Customers.',
  Assignment: 'The relationship connecting a Driver to a Shipment. Decoupled from the Shipment entity to allow multi-driver broadcasts and rejections in the future.',
  Account: 'The neutral entity owning the API Clients and Shipments. Can represent an individual, a local shop, or a software integration.',
  Customer: 'The end-user receiving the delivered goods.',
  Driver: 'The independent contractor executing the shipment.',
  ApiClient: 'An external system (ERP, Shopify plugin, custom app) that interacts with the Bizilot Shipment API.',
  TrackingNumber: 'A human-readable, unique identifier (e.g., TRK-12345) used by customers to track shipments, hiding the internal UUID.'
};
