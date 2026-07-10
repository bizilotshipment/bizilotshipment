export const authentication = {
  api: {
    type: 'Bearer Token',
    header: 'Authorization: Bearer <API_KEY>',
    description: 'Used by API Clients (external systems) to create shipments and check status.',
    securityNote: 'API keys are shown once upon creation and stored hashed (SHA-256) in the database.'
  },
  dashboard: {
    type: 'JWT Cookie',
    header: 'Cookie: auth-token=<JWT>',
    description: 'Used by Drivers and Customers accessing the web dashboard.',
    flow: 'Mobile Number + OTP verification.'
  },
  webhooks: {
    type: 'HMAC SHA-256 Signature',
    header: 'x-bizilot-signature',
    description: 'Used by API Clients to verify that incoming webhook payloads originated from Bizilot Shipment.',
    implementation: 'Generate HMAC SHA-256 hash of the JSON payload string using the API Key as the secret.'
  }
};
