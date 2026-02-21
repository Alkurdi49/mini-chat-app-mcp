import type { AgentStep } from '../agent/types';

export function plan(goal: string): AgentStep[] {
  const lower = goal.toLowerCase();

  // حالة 1: لو الهدف فيه ملف txt (مثال: notes.txt)
  if (lower.includes('.txt')) {
    // نحاول نطلع اسم الملف من الكلام
    const match = goal.match(/[\w\-_.]+\.txt/);
    const fileName = match ? match[0] : 'notes.txt';

    return [
      {
        kind: 'tool',
        toolFullName: 'filesystem.read_file',
        args: { path: fileName },
        note: `Read file "${fileName}"`
      },
      {
        kind: 'tool',
        toolFullName: 'utility.uppercase',
        args: { textFromLast: true },
        note: 'Uppercase the file content'
      },
      {
        kind: 'final',
        answer: 'DONE'
      }
    ];
  }

  // حالة 2: لو الهدف فيه رابط
  if (lower.includes('http://') || lower.includes('https://')) {
    const url = goal.match(/https?:\/\/\S+/)?.[0] ?? 'https://example.com';

    return [
      {
        kind: 'tool',
        toolFullName: 'utility.fetch_url',
        args: { url },
        note: `Fetch URL: ${url}`
      },
      {
        kind: 'final',
        answer: 'DONE'
      }
    ];
  }

  // حالة 3: افتراضيًا نخليها uppercase للهدف نفسه
  return [
    {
      kind: 'tool',
      toolFullName: 'utility.uppercase',
      args: { text: goal },
      note: 'Uppercase the goal text'
    },
    {
      kind: 'final',
      answer: 'DONE'
    }
  ];
}