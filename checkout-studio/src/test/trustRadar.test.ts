import { describe, it, expect } from 'vitest';
import { analyzeTrust } from '../core/trustRadar';
import { createDefaultScene } from '../core/initialScene';

describe('trustRadar', () => {
  it('analyzes trust for a default scene', () => {
    const scene = createDefaultScene();
    const score = analyzeTrust(scene);
    
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(100);
    expect(score.issues).toBeInstanceOf(Array);
  });
});
