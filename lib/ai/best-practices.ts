export const bestPractices = [
  'Store your API Key securely. It is only shown once during client registration.',
  'Do not expose internal UUIDs (e.g. shp_xxxx) to end customers. Use the trackingNumber (e.g. TRK-XXXX).',
  'Always verify webhook signatures using HMAC SHA-256 to ensure payloads genuinely came from Bizilot Shipment.',
  'Prefer Webhooks over polling. If you must poll, do so via the lightweight /status endpoint and limit polling to once every 10-30 seconds.'
];
