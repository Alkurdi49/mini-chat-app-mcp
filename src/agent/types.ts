export type AgentStep =
  | {
      kind: 'tool';
      toolFullName: string;
      args: Record<string, unknown>;
      note: string;
      saveAs?: string; // ✅ NEW
    }
  | {
      kind: 'final';
      answer: string;
    };

export type AgentState = {
  goal: string;
  artifacts: Record<string, string>;
};