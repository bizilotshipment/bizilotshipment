# Bizilot Shipment - AI Developer Instructions

You are an AI coding assistant working on **Bizilot Shipment**, a headless delivery platform. 

This project uses an **AI Operating System / AI Registry** architecture. The entire platform's metadata, endpoints, schemas, workflows, and documentation are strictly governed by a single source of truth located in `lib/ai/`.

## 🛑 CRITICAL RULE: The AI Registry (`lib/ai/`)
Whenever you add a feature, edit an endpoint, fix a bug, or change a data model, you **MUST** update the corresponding file in `lib/ai/`. 

Never hardcode documentation, UI text in the Developer Dashboard, or API Playground examples. They are all dynamically generated from the AI Registry.

### Files to Update During Feature Work:
If you make changes to the codebase, check and update these files accordingly:
- **`lib/ai/endpoints.ts`**: Update this if you add/edit/remove an API route. Include the Method, Path, Auth, Request/Response payloads, and Errors.
- **`lib/ai/schemas.ts`**: Update this if you modify a database model or a validation schema in `lib/validators.ts`.
- **`lib/ai/events.ts`**: Update this if you add or modify a webhook event payload.
- **`lib/ai/concepts.ts`**: Update this if you introduce a new domain entity to the system.
- **`lib/ai/workflows.ts`**: Update this if the lifecycle of a shipment or business process changes.
- **`lib/ai/examples.ts`**: Update this if the shape of JSON requests/responses changes to ensure the Playground has accurate sample data.
- **`lib/ai/changelog.ts`**: ALWAYS add a changelog entry when you complete a feature or fix a significant bug.

## 🏗️ Architecture & Development Rules
- **Terminology**: Use generic terms like `Shipment` (never "Job"), `Pickup`, `Drop`, `Assignment`. 
- **Security**: API keys are hashed via SHA-256 in the database. Never store plaintext keys.
- **Validation**: Use Zod (`lib/validators.ts`) for all incoming API requests.
- **Routing**: This project uses Next.js App Router (`app/`).
- **Styling**: Use Tailwind CSS. Follow the existing dark-mode first, glassmorphism aesthetic. Do not use raw color names when theme semantic colors (e.g., `bg-brand-600`) are available.
- **Error Handling**: API routes must return a JSON response with a boolean `success` flag: `{ success: false, error: "Message" }`.

## 🔄 How the AI Registry is Consumed
When you update the files in `lib/ai/`, the following systems automatically update:
1. `GET /api/v1/ai-context` (The machine-readable context endpoint)
2. `app/docs/page.tsx` (The API Documentation UI)
3. `app/playground/page.tsx` (The API Testing UI)
4. `app/dashboard/developer/ai-integration/page.tsx` (The AI Prompts Dashboard)

Do NOT edit those 4 files to update text or schemas. Always edit `lib/ai/`.
