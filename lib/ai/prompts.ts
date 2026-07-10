import { platform } from './platform';
import { instructions } from './instructions';
import { concepts } from './concepts';
import { schemas } from './schemas';
import { authentication } from './authentication';
import { workflows } from './workflows';
import { endpoints } from './endpoints';
import { events } from './events';
import { bestPractices } from './best-practices';
import { changelog } from './changelog';
import { examples } from './examples';

// Helper to stringify objects cleanly
const formatJson = (obj: any) => JSON.stringify(obj, null, 2);

export const prompts = {
  getPlatformOverview: () => `
# Platform Overview: ${platform.name}
**Version:** ${platform.version} | **API Version:** ${platform.apiVersion}

## Mission
${platform.mission}

## Future Roadmap
${platform.futureRoadmap.map(r => '- ' + r).join('\n')}

## Known Limitations
${platform.knownLimitations.map(l => '- ' + l).join('\n')}
`,

  getDeveloperIntegration: () => `
# Developer Integration Guide

## Authentication
${formatJson(authentication)}

## Core Concepts
${formatJson(concepts)}

## API Best Practices
${bestPractices.map(bp => '- ' + bp).join('\n')}
`,

  getCurrentPlatformState: () => `
# Current Platform State
**Generated at:** ${new Date().toISOString()}

## Schemas
${formatJson(schemas)}

## Endpoints
${formatJson(endpoints)}

## Webhooks
${formatJson(events)}
`,

  getBusinessWorkflow: () => `
# Workflow: ${platform.name}

## Lifecycle
${workflows.generalLifecyle.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Webhook Flow
${workflows.webhookWorkflow.map((step, i) => `${i + 1}. ${step}`).join('\n')}
`,

  getAIInstructions: () => `
# AI Agent Instructions

## Architecture Rules
${instructions.architectureRules.map(r => '- ' + r).join('\n')}

## Development Rules
${instructions.developmentRules.map(r => '- ' + r).join('\n')}

## Naming Conventions
${instructions.namingConventions.map(r => '- ' + r).join('\n')}

## Security Requirements
${instructions.securityRequirements.map(r => '- ' + r).join('\n')}

## UI Principles
${instructions.uiPrinciples.map(r => '- ' + r).join('\n')}

## Error Handling
${instructions.errorHandling.map(r => '- ' + r).join('\n')}
`
};
