import path from 'node:path';

export type ServerConfig = {
  name: 'filesystem' | 'utility';
  command: string;
  args: string[];
};

const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export function filesystemServerConfig(allowedDir: string): ServerConfig {
  return {
    name: 'filesystem',
    command: NPX,
    args: ['-y', '@modelcontextprotocol/server-filesystem', allowedDir]
  };
}

export function utilityServerConfig(): ServerConfig {
  const entry = path.join(process.cwd(), 'src', 'mcp', 'utilityServer.ts');

  return {
    name: 'utility',
    command: NPX,
    args: ['-y', 'tsx', entry]
  };
}