import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { ServerConfig } from './servers';

export async function connectClient(cfg: ServerConfig) {
  const transport = new StdioClientTransport({
    command: cfg.command,
    args: cfg.args
  });

  const client = new Client({ name: 'taskrunner-client', version: '1.0.0' }, { capabilities: {} });

  await client.connect(transport);
  return client;
}