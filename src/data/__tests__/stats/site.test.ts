import { describe, expect, it } from 'vitest';

import data from '../../stats/site';

describe('site stats data', () => {
  it('exports an array of stats', () => {
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('each stat has a label', () => {
    for (const stat of data) {
      expect(stat).toHaveProperty('label');
      expect(typeof stat.label).toBe('string');
      expect(stat.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('has GitHub API stats with expected pushed_at key', () => {
    const stat = data.find((s) => s.key === 'pushed_at');
    expect(stat).toBeDefined();
  });

  it('stats with links have valid URLs', () => {
    const statsWithLinks = data.filter((s) => s.link);

    for (const stat of statsWithLinks) {
      expect(stat.link).toMatch(/^https:\/\//);
    }
  });

  it('pushed_at stat has a format function', () => {
    const pushedAt = data.find((s) => s.key === 'pushed_at');

    expect(pushedAt).toBeDefined();
    expect(pushedAt!.format).toBeDefined();
    expect(typeof pushedAt!.format).toBe('function');
  });

  it('format function returns formatted date', () => {
    const pushedAt = data.find((s) => s.key === 'pushed_at');
    const formatted = pushedAt!.format!('2024-01-15T12:00:00Z');

    expect(formatted).toBe('January 15, 2024');
  });
});
