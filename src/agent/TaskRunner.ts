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

export class TaskRunner {
  constructor(private clients: Clients) {}

  async run(goal: string): Promise<string> {
    const state: AgentState = {
      goal,
      artifacts: {}
    };

    const steps = plan(goal);

    for (const step of steps) {
      if (step.kind === 'final') break;

      const { server, tool } = splitToolName(step.toolFullName);
      const client = server === 'filesystem' ? this.clients.filesystem : this.clients.utility;

      const args = 'textFromLast' in step.args ? { text: state.artifacts.lastText ?? '' } : step.args;

      const result = await client.callTool({
        name: tool,
        arguments: args
      });

      const contentArray = result.content as any[];
      const text = contentArray?.find((c: any) => c.type === 'text')?.text ?? '';

      state.artifacts.lastText = text;
    }

    return state.artifacts.lastText ?? 'No result';
  }
}