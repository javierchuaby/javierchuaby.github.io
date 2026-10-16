import { describe, expect, it } from 'vitest';

import { aboutMarkdown } from '../about';

describe('about data', () => {
  it('exports aboutMarkdown as a string', () => {
    expect(typeof aboutMarkdown).toBe('string');
    expect(aboutMarkdown.length).toBeGreaterThan(0);
  });

  it('contains the intro section', () => {
    expect(aboutMarkdown).toContain('# Intro');
    const intro = aboutMarkdown
      .split(/\n# /)[0]
      .replace(/^# Intro\s*/, '')
      .trim();
    expect(intro.length).toBeGreaterThan(100);
  });

  it('keeps every editable section nonempty', () => {
    const sections = aboutMarkdown.trim().split(/\n(?=# )/);
    for (const section of sections) expect(section).toMatch(/^# .+\n\n\S/);
  });

  it('contains properly formatted headers', () => {
    const headerRegex = /^#+ .+$/gm;
    const headers = aboutMarkdown.match(headerRegex);

    expect(headers).not.toBeNull();
    expect(headers!.length).toBeGreaterThanOrEqual(1);
  });
});
