# ⚡ Mini Chat App – MCP Agent

A lightweight agentic CLI system built with **TypeScript** and the **Model Context Protocol (MCP)**.

The system accepts high-level user goals, decomposes them into agentic steps, orchestrates MCP tools, and produces a final result with minimal human input.

---

## 🚀 Features

- ✅ Terminal chat interface (`npm run dev`)
- ✅ Agent loop (plan → execute → store intermediate result → finalize)
- ✅ MCP-based tool orchestration
- ✅ Filesystem tool (read/write local files)
- ✅ Utility tool (fetch URL, uppercase text, add numbers)
- ✅ TypeScript with type safety
- ✅ One meaningful unit test (Vitest)

---

## 🏗 Architecture Overview

The system is divided into clear layers:

### 1️⃣ Planner (`src/tools/planner.ts`)

- Converts a high-level goal into structured steps.

Example:



Becomes:

- Step 1: `filesystem.read_file`
- Step 2: `utility.uppercase`
- Final step

This separation makes the system easy to extend or replace with an LLM-based planner later.

---

### 2️⃣ TaskRunner (Agent Loop) (`src/agent/TaskRunner.ts`)

Responsible for:

- Iterating through planned steps
- Selecting the correct MCP client
- Calling tools
- Storing intermediate results in state
- Returning the final output

The agent maintains a simple internal state:

```ts
{
  goal: string,
  artifacts: {
    lastText?: string
  }
}


 
 


MCP Tool Servers

The agent does not hardcode tools directly.
Instead, tools are exposed via MCP servers.

🔹 Filesystem Server

Based on @modelcontextprotocol/server-filesystem

Restricted to the project directory

Provides file read/write functionality

🔹 Utility Server (src/mcp/utilityServer.ts)

Custom MCP server exposing:

fetch_url

uppercase

add

This design keeps the agent modular and tool-agnostic




🔁 Agent Loop Execution Flow

User enters a goal

Planner generates structured steps

TaskRunner:

Selects appropriate MCP client

Calls tool

Stores intermediate result

Stops when final step is reached

Returns final result to CLI


How to Run

npm install
npm run dev

Fetch https://example.com
or
Read notes.txt and make it uppercase

Running Tests
npm test



 Why This Architecture?

I separated planning from execution for clarity and extensibility:

The Planner focuses on reasoning.

The TaskRunner focuses on orchestration.

Tools are decoupled via MCP servers.

This makes the system:

Modular

Testable

Extensible

Easy to evolve into an LLM-driven agent

The architecture also allows replacing the rule-based planner with a more advanced LLM-based reasoning engine without modifying the execution layer





🚀 What I Would Improve With More Time

Replace rule-based planner with LLM-based planning

Add retry logic and improved error recovery

Add richer memory (multi-artifact support)

Add integration tests for tool execution

Improve safety controls around filesystem access

Add structured logging and tracing