export const endpoints = [
  {
    method: 'POST',
    path: '/api/v1/api-clients',
    title: 'Register API Client',
    purpose: 'Register your external system to receive an API key.',
    auth: 'None',
    request: {
      name: 'string (required)',
      contactMobile: 'string (required)',
      webhookUrl: 'string (optional)'
    },
    response: {
      success: 'boolean',
      data: {
        clientId: 'string',
        apiKey: 'string (Plaintext - shown only once)',
        accountId: 'string'
      }
    },
    errors: [
      { code: 400, description: 'Validation failed' }
    ]
  },
  {
    method: 'POST',
    path: '/api/v1/shipments',
    title: 'Create Delivery Shipment',
    purpose: 'Submit a new shipment to the platform. A driver will be assigned automatically.',
    auth: 'Bearer API Key',
    request: {
      pickup: 'Pickup object (required)',
      drops: 'Array of Drop objects (required)'
    },
    response: {
      success: 'boolean',
      data: {
        shipmentId: 'string',
        trackingNumber: 'string',
        status: 'string',
        dropsCount: 'number',
        createdAt: 'string (ISO 8601)'
      }
    },
    errors: [
      { code: 401, description: 'Unauthorized - Invalid API Key' },
      { code: 400, description: 'Validation failed' }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/shipments',
    title: 'List Shipments',
    purpose: 'Retrieve all shipments created by your API Client.',
    auth: 'Bearer API Key',
    request: null,
    response: {
      success: 'boolean',
      data: {
        shipments: 'Array of Shipment objects',
        total: 'number'
      }
    },
    errors: [
      { code: 401, description: 'Unauthorized' }
    ]
  },
  {
    method: 'GET',
    path: '/api/v1/shipments/:shipmentId/status',
    title: 'Check Shipment Status',
    purpose: 'Lightweight polling endpoint to get the current status of a specific shipment.',
    auth: 'Bearer API Key',
    request: null,
    response: {
      success: 'boolean',
      data: {
        shipmentId: 'string',
        trackingNumber: 'string',
        status: 'string',
        driver: {
          name: 'string',
          vehicleNumber: 'string'
        },
        updatedAt: 'string (ISO 8601)'
      }
    },
    errors: [
      { code: 401, description: 'Unauthorized' },
      { code: 404, description: 'Shipment not found' }
    ]
  },
  {
    method: 'PUT',
    path: '/api/v1/webhooks',
    title: 'Configure Webhooks',
    purpose: 'Update webhook URL and subscribed events.',
    auth: 'Bearer API Key',
    request: {
      webhookUrl: 'string (required)',
      events: 'Array of strings (e.g. ["shipment.accepted", "shipment.completed"])'
    },
    response: {
      success: 'boolean',
      data: {
        webhookUrl: 'string',
        events: 'Array of strings'
      }
    },
    errors: [
      { code: 401, description: 'Unauthorized' },
      { code: 400, description: 'Validation failed' }
    ]
  }
];
