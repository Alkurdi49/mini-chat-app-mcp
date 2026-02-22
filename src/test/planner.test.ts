import { describe, it, expect } from 'vitest';
import { plan } from '../tools/planner';

describe('planner', () => {
  it('creates a plan for weekly summary using notes', () => {
    const steps = plan('Generate a weekly planning summary based on my notes');

    expect(steps.length).toBeGreaterThanOrEqual(3);

    const s1 = steps[0];
    const s2 = steps[1];
    const s3 = steps[2];

    // Step 1: read file
    expect(s1.kind).toBe('tool');
    if (s1.kind === 'tool') {
      expect(s1.toolFullName).toBe('filesystem.read_file');
      expect(s1.saveAs).toBe('notes');
    }

    // Step 2: extract todos
    expect(s2.kind).toBe('tool');
    if (s2.kind === 'tool') {
      expect(s2.toolFullName).toBe('utility.extract_todos');
      expect(s2.saveAs).toBe('todos');
      expect((s2.args as any).textFromLast).toBe(true);
    }

    // Step 3: final template
    expect(s3.kind).toBe('final');
    if (s3.kind === 'final') {
      expect(s3.answer).toContain('{{notes}}');
      expect(s3.answer).toContain('{{todos}}');
    }
  });

  it('creates file-uppercase plan when .txt is explicitly mentioned', () => {
    const steps = plan('Read notes.txt and make it uppercase');

    expect(steps[0].kind).toBe('tool');
    if (steps[0].kind === 'tool') {
      expect(steps[0].toolFullName).toBe('filesystem.read_file');
    }

    expect(steps[1].kind).toBe('tool');
    if (steps[1].kind === 'tool') {
      expect(steps[1].toolFullName).toBe('utility.uppercase');
    }
  });
});