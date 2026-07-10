export const instructions = {
  architectureRules: [
    'Strict separation of concerns: API layer, Database layer, Business Logic layer.',
    'All external integrations must go through the API layer.',
    'The AI Registry (lib/ai/) is the single source of truth for all documentation and prompts.'
  ],
  developmentRules: [
    'Always use generic terminology (e.g., Shipment instead of Job).',
    'Never hardcode API paths in documentation; pull from the AI Registry.',
    'Always validate incoming payloads using Zod schemas in lib/validators.ts.'
  ],
  namingConventions: [
    'Use PascalCase for types and interfaces.',
    'Use camelCase for variables and function names.',
    'Use kebab-case for URLs and file names.',
    'Prefix IDs with entity type (e.g., shp_ for shipments, usr_ for users, bus_ for businesses).'
  ],
  securityRequirements: [
    'Never store API keys in plaintext in the database. Use SHA-256 hashing.',
    'API keys are generated once and displayed to the user only at creation.',
    'Always verify webhook signatures using HMAC SHA-256 before processing.'
  ],
  uiPrinciples: [
    'Mobile-first design for Driver and Customer dashboards.',
    'Use Tailwind CSS for styling.',
    'Avoid Tailwind generic color classes; use theme-defined semantic colors (e.g., bg-brand-600).',
    'Follow a dark-mode first aesthetic with glassmorphism effects.'
  ],
  errorHandling: [
    'Always return JSON responses with a success boolean (e.g., { success: false, error: "message" }).',
    'Use appropriate HTTP status codes (400 for validation, 401 for auth, 404 for not found, 500 for server errors).',
    'Do not expose internal database errors or stack traces to the client.'
  ]
};
