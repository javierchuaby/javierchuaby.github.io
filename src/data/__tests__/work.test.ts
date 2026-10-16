import { describe, expect, it } from 'vitest';

import work from '../resume/work';

describe('work data', () => {
  it('exports an array of positions', () => {
    expect(Array.isArray(work)).toBe(true);
    expect(work.length).toBeGreaterThan(0);
  });

  it('each position has required properties', () => {
    for (const job of work) {
      expect(job).toHaveProperty('name');
      expect(job).toHaveProperty('position');
      expect(job).toHaveProperty('url');
      expect(job).toHaveProperty('startDate');

      expect(typeof job.name).toBe('string');
      expect(typeof job.position).toBe('string');
      expect(typeof job.url).toBe('string');
      expect(typeof job.startDate).toBe('string');
    }
  });

  it('startDate is a valid date string', () => {
    for (const job of work) {
      const date = new Date(job.startDate);
      expect(date.toString()).not.toBe('Invalid Date');
    }
  });

  it('endDate is valid when present', () => {
    for (const job of work) {
      if (job.endDate) {
        const date = new Date(job.endDate);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    }
  });

  it('endDate is after startDate when present', () => {
    for (const job of work) {
      if (job.endDate) {
        const start = new Date(job.startDate);
        const end = new Date(job.endDate);
        expect(end.getTime()).toBeGreaterThan(start.getTime());
      }
    }
  });

  it('urls are valid', () => {
    const urlRegex = /^https?:\/\/.+/;

    for (const job of work) {
      expect(job.url).toMatch(urlRegex);
    }
  });

  it('orders positions most-recent-first without requiring an ongoing position', () => {
    const starts = work.map((position) => position.startDate);
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it('highlights are arrays when present', () => {
    for (const job of work) {
      if (job.highlights) {
        expect(Array.isArray(job.highlights)).toBe(true);
        // expect(job.highlights.length).toBeGreaterThan(0);
      }
    }
  });

  it('does not duplicate positions', () => {
    const identities = work.map(
      (position) =>
        `${position.name}-${position.position}-${position.startDate}`,
    );
    expect(new Set(identities).size).toBe(work.length);
  });

  it('company names are non-empty', () => {
    for (const job of work) {
      expect(job.name.trim().length).toBeGreaterThan(0);
    }
  });
});
