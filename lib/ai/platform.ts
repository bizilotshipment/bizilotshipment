export const platform = {
  name: 'Bizilot Shipment',
  description: 'A headless delivery platform for businesses to dispatch and track shipments using independent drivers.',
  version: '1.0.0',
  apiVersion: 'v1',
  mission: 'To provide a generic, API-first delivery infrastructure that any eCommerce, ERP, or custom software can integrate with to dispatch shipments.',
  futureRoadmap: [
    'Multi-driver assignment broadcasting',
    'Driver routing optimization',
    'SDK generation for Node, Python, Go',
    'Model Context Protocol (MCP) server support'
  ],
  knownLimitations: [
    'Drivers can only accept one full shipment at a time',
    'Billing and invoicing is handled externally',
    'No automated retry for failed webhook events yet'
  ]
};
