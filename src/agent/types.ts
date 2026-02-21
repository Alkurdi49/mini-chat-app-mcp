export type AgentStep =
  | {
      kind: 'tool';
      toolFullName: string; // مثال: "utility.uppercase" أو "filesystem.read_file"
      args: Record<string, unknown>;
      note: string; // شرح بسيط ليش بنعمل الخطوة
    }
  | {
      kind: 'final';
      answer: string;
    };

export type AgentState = {
  goal: string;
  // نحتفظ بنتائج وسيطة
  artifacts: {
    lastText?: string;
  };
};