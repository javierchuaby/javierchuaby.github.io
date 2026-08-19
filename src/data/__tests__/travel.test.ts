import { describe, expect, it } from 'vitest';

import {
  CITIES_VISITED_COUNT,
  COUNTRIES_VISITED_COUNT,
  VISITED_COUNTRIES,
} from '../travel';

describe('travel data', () => {
  it('has the verified totals', () => {
    expect(COUNTRIES_VISITED_COUNT).toBe(17);
    expect(CITIES_VISITED_COUNT).toBe(35);
  });

  it('has unique countries', () => {
    const countries = VISITED_COUNTRIES.map(({ country }) => country);

    expect(new Set(countries).size).toBe(countries.length);
  });

  it('has unique cities within each country', () => {
    for (const { cities } of VISITED_COUNTRIES) {
      expect(new Set(cities).size).toBe(cities.length);
    }
  });
});
