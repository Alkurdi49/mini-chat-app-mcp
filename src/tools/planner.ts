import type { AgentStep } from '../agent/types';

export function plan(goal: string): AgentStep[] {
  const lower = goal.toLowerCase().trim();

  // helper: detect txt filename, otherwise default to notes.txt
  const match = goal.match(/[\w\-_.]+\.txt/);
  const fileName = match ? match[0] : 'notes.txt';

  // ✅ PRIORITY 1: explicit "uppercase" request with a .txt file
  // This avoids routing to weekly-summary branch when user intention is clearly transformation.
  if (lower.includes('.txt') && lower.includes('uppercase')) {
    return [
      {
        kind: 'tool',
        toolFullName: 'filesystem.read_file',
        args: { path: fileName },
        note: `Read file "${fileName}"`,
        saveAs: 'file'
      },
      {
        kind: 'tool',
        toolFullName: 'utility.uppercase',
        args: { textFromLast: true },
        note: 'Uppercase the file content',
        saveAs: 'upper'
      },
      {
        kind: 'final',
        answer: 'File content (uppercased):\n{{upper}}'
      }
    ];
  }

  // ✅ PRIORITY 2: Weekly/notes/summary intent
  if (
    lower.includes('weekly') ||
    lower.includes('summary') ||
    lower.includes('planning') ||
    // keep notes triggers, but now uppercase+txt is already handled above
    lower.includes('notes') ||
    lower.includes('note')
  ) {
    return [
      {
        kind: 'tool',
        toolFullName: 'filesystem.read_file',
        args: { path: fileName },
        note: `Read file "${fileName}"`,
        saveAs: 'notes'
      },
      {
        kind: 'tool',
        toolFullName: 'utility.extract_todos',
        args: { textFromLast: true },
        note: 'Extract TODOs from notes',
        saveAs: 'todos'
      },
      {
        kind: 'final',
        answer:
          'Weekly Planning Summary\n\nNotes:\n{{notes}}\n\nExtracted TODOs:\n{{todos}}\n'
      }
    ];
  }

  // PRIORITY 3: explicit .txt read without uppercase intent
  if (lower.includes('.txt')) {
    return [
      {
        kind: 'tool',
        toolFullName: 'filesystem.read_file',
        args: { path: fileName },
        note: `Read file "${fileName}"`,
        saveAs: 'file'
      },
      {
        kind: 'tool',
        toolFullName: 'utility.uppercase',
        args: { textFromLast: true },
        note: 'Uppercase the file content',
        saveAs: 'upper'
      },
      {
        kind: 'final',
        answer: 'File content (uppercased):\n{{upper}}'
      }
    ];
  }

  // PRIORITY 4: URL fetch
  if (lower.includes('http://') || lower.includes('https://')) {
    const url = goal.match(/https?:\/\/\S+/)?.[0] ?? 'https://example.com';

    return [
      {
        kind: 'tool',
        toolFullName: 'utility.fetch_url',
        args: { url },
        note: `Fetch URL: ${url}`,
        saveAs: 'page'
      },
      {
        kind: 'final',
        answer: 'Fetched content:\n{{page}}'
      }
    ];
  }

  // Fallback: uppercase goal
  return [
    {
      kind: 'tool',
      toolFullName: 'utility.uppercase',
      args: { text: goal },
      note: 'Uppercase the goal text',
      saveAs: 'upperGoal'
    },
    {
      kind: 'final',
      answer: '{{upperGoal}}'
    }
  ];
}