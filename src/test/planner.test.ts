import { describe, it, expect } from 'vitest';
import { plan } from '../tools/planner';

describe('planner', () => {
  it('creates filesystem step when goal mentions a txt file', () => {
    const steps = plan('Read notes.txt and make it uppercase');

    expect(steps[0].kind).toBe('tool');
    expect((steps[0] as any).toolFullName).toBe('filesystem.read_file');
  });
});