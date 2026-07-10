export const workflows = {
  generalLifecyle: [
    'API Client calls POST /api/v1/shipments',
    'Shipment Created (status: pending)',
    'Driver accepts Assignment (status: accepted)',
    'Driver goes to Pickup and confirms (status: picked_up)',
    'Driver heads to Drops (status: out_for_delivery)',
    'All drops completed (status: completed)'
  ],
  webhookWorkflow: [
    'System transitions Shipment status',
    'Webhook job dispatched asynchronously',
    'Payload signed with Client API Key',
    'POST request sent to Client Webhook URL',
    'Client verifies HMAC SHA-256 signature'
  ]
};
