# Agent Rules

> **The Shipment Console is the official reference implementation of the Public API. It is a human-operated API client, not a privileged backend. All features must be implemented in the Public API first and then consumed by the Console. Authentication methods (JWT for humans and API Keys for systems) are different entry points that resolve to the same Account context. Business-specific assumptions are prohibited within the Shipment platform. The platform must remain account-centric and integration-agnostic.**

## Key Directives

1. **API-First Development**:
   - The Public API (`/api/v1`) is the platform's contract.
   - Any new feature required by the UI must be designed and implemented in the Public API first.

2. **No Dashboard Business Logic**:
   - The Shipment Console must not bypass the Public API to read/write directly to the database for domain logic.
   - It acts purely as a UI client (like Postman or a mobile app) executing against the API.

3. **Account-Centric Architecture**:
   - Entities like Shipments and API Clients belong to an `Account`.
   - Never assume the user is a "Business". The platform supports individuals, local shops, and massive ERP integrations equally via the `Account` model.

4. **AI Synchronization**:
   - The AI Registry (`lib/ai/`) is the single source of truth.
   - Any modification to API endpoints, schemas, auth, or workflows must immediately update the AI Registry.
   - API Docs, the Playground, and the Shipment Console rely on the AI Registry for configuration. Documentation drift is considered a critical bug.
