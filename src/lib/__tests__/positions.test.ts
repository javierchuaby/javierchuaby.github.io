import { describe, expect, it } from 'vitest';
import type { Position } from '@/data/resume/work';
import { getCurrentPosition } from '../positions';

const asOf = new Date('2026-10-16T12:00:00Z');
const past: Position = {
  name: 'Past',
  position: 'Engineer',
  url: 'https://example.com',
  startDate: '2026-01-01',
  endDate: '2026-07-31',
};

describe('current position', () => {
  it('allows a portfolio with only completed positions', () => {
    expect(getCurrentPosition([past], asOf)).toBeUndefined();
    expect(getCurrentPosition([], asOf)).toBeUndefined();
  });
  it('finds a current position even when the most recent entry has ended', () => {
    const ongoing = { ...past, name: 'Current', endDate: undefined };
    expect(getCurrentPosition([past, ongoing], asOf)).toBe(ongoing);
  });
  it('does not announce future positions as current', () => {
    expect(
      getCurrentPosition(
        [{ ...past, startDate: '2027-01-01', endDate: undefined }],
        asOf,
      ),
    ).toBeUndefined();
  });
  it('treats the stated end date as inclusive', () => {
    const current = { ...past, endDate: '2026-10-16' };
    expect(getCurrentPosition([current], asOf)).toBe(current);
    expect(
      getCurrentPosition([current], new Date('2026-10-17T00:00:00Z')),
    ).toBeUndefined();
  });
});
