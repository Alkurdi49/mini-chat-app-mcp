import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// 1) نجهّز السيرفر
const server = new Server(
  { name: 'utility-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 2) نعرّف شكل المدخلات لكل tool (Validation)
const UppercaseArgs = z.object({ text: z.string() });
const AddArgs = z.object({ a: z.number(), b: z.number() });
const FetchArgs = z.object({ url: z.string().url() });

// 3) لما العميل يطلب "قائمة الأدوات"
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'uppercase',
        description: 'Convert text to uppercase',
        inputSchema: {
          type: 'object',
          properties: { text: { type: 'string' } },
          required: ['text']
        }
      },
      {
        name: 'add',
        description: 'Add two numbers',
        inputSchema: {
          type: 'object',
          properties: { a: { type: 'number' }, b: { type: 'number' } },
          required: ['a', 'b']
        }
      },
      {
        name: 'fetch_url',
        description: 'Fetch URL content (first 3000 chars)',
        inputSchema: {
          type: 'object',
          properties: { url: { type: 'string' } },
          required: ['url']
        }
      }
    ]
  };
});

// 4) لما العميل ينادي tool معيّن
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  // Tool: uppercase
  if (name === 'uppercase') {
    const parsed = UppercaseArgs.parse(args);
    return { content: [{ type: 'text', text: parsed.text.toUpperCase() }] };
  }

  // Tool: add
  if (name === 'add') {
    const parsed = AddArgs.parse(args);
    return { content: [{ type: 'text', text: String(parsed.a + parsed.b) }] };
  }

  // Tool: fetch_url
  if (name === 'fetch_url') {
    const parsed = FetchArgs.parse(args);
    const res = await fetch(parsed.url);
    const text = await res.text();
    return { content: [{ type: 'text', text: text.slice(0, 3000) }] };
  }

  // لو tool غير معروف
  return {
    content: [{ type: 'text', text: `Unknown tool: ${name}` }]
  };
});

// 5) تشغيل السيرفر عبر stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});