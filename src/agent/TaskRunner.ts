import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { AgentState } from './types';
import { plan } from '../tools/planner';

type Clients = {
  filesystem: Client;
  utility: Client;
};

function splitToolName(full: string) {
  const [server, ...rest] = full.split('.');
  return {
    server,
    tool: rest.join('.')
  };
}

// Simple template renderer: replaces {{key}} with artifacts[key]
function renderTemplate(template: string, artifacts: Record<string, any>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = artifacts[key];
    if (v === undefined || v === null) return '';
    return String(v);
  });
}

// ✅ Robust extractor for MCP tool results (supports text + resource.text)
function extractTextFromToolResult(result: any): string {
  const contentArray = Array.isArray(result?.content) ? (result.content as any[]) : [];
  if (contentArray.length === 0) return '';

  // Prefer explicit text blocks
  const textItem = contentArray.find((c: any) => c?.type === 'text' && typeof c.text === 'string');
  if (textItem) return textItem.text;

  // Filesystem servers often return "resource" with resource.text
  const resourceItem = contentArray.find((c: any) => c?.type === 'resource');
  if (resourceItem?.resource?.text && typeof resourceItem.resource.text === 'string') {
    return resourceItem.resource.text;
  }

  // Other fallbacks
  if (typeof contentArray[0]?.text === 'string') return contentArray[0].text;

  // Last resort: stringify so you at least see something
  return JSON.stringify(result.content ?? result, null, 2);
}

export class TaskRunner {
  constructor(private clients: Clients) {}

  async run(goal: string): Promise<string> {
    const state: AgentState = {
      goal,
      artifacts: {}
    };

    const steps = plan(goal);

    for (const step of steps) {
      if (step.kind === 'tool') {
        const { server, tool } = splitToolName(step.toolFullName);
        const client = server === 'filesystem' ? this.clients.filesystem : this.clients.utility;

        const args =
          step.args && typeof step.args === 'object' && 'textFromLast' in step.args
            ? { text: state.artifacts.lastText ?? '' }
            : step.args;

        const result = await client.callTool({
          name: tool,
          arguments: args
        });

        const text = extractTextFromToolResult(result);

        // store lastText always
        state.artifacts.lastText = text;

        // ✅ store per step if saveAs exists
        const saveAs = (step as any).saveAs;
        if (typeof saveAs === 'string' && saveAs.length > 0) {
          state.artifacts[saveAs] = text;
        }

        continue;
      }

      // ✅ handle final properly
      if (step.kind === 'final') {
        const output = renderTemplate(step.answer, {
          ...state.artifacts,
          goal: state.goal
        });

        return output || state.artifacts.lastText || 'No result';
      }
    }

    return state.artifacts.lastText ?? 'No result';
  }
}