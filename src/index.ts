import readline from 'node:readline';
import { filesystemServerConfig, utilityServerConfig } from './mcp/servers';
import { connectClient } from './mcp/client';
import { TaskRunner } from './agent/TaskRunner';

async function main() {
  const allowedDir = process.cwd();

  const filesystem = await connectClient(filesystemServerConfig(allowedDir));
  const utility = await connectClient(utilityServerConfig());

  const runner = new TaskRunner({ filesystem, utility });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('✅ Mini Chat App (MCP Agent)');
  console.log('اكتب هدفك (Goal) ثم Enter. اكتب "exit" للخروج.\n');
  console.log('أمثلة:');
  console.log('- Read notes.txt and make it uppercase');
  console.log('- Fetch https://example.com\n');

  rl.on('line', async (line) => {
    const goal = line.trim();
    if (!goal) return;

    if (goal.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      const result = await runner.run(goal);
      console.log('\n--- RESULT ---');
      console.log(result);
      console.log('--------------\n');
    } catch (err) {
      console.error('❌ Error:', err);
    }
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});