export interface VisitedCountry {
  country: string;
  cities: readonly string[];
}

/**
 * Countries and cities visited.
 *
 * City entries use recognised urban cities only. Towns, villages, resorts,
 * islands, natural regions and airport-only transits are excluded.
 */
export const VISITED_COUNTRIES = [
  {
    country: 'Australia',
    cities: ['Gold Coast', 'Melbourne', 'Sydney'],
  },
  {
    country: 'Brunei',
    cities: [],
  },
  {
    country: 'China',
    cities: ['Beijing', 'Chongqing', 'Harbin', 'Shanghai'],
  },
  {
    country: 'France',
    cities: ['Paris'],
  },
  {
    country: 'Hong Kong',
    cities: ['Hong Kong'],
  },
  {
    country: 'Indonesia',
    cities: ['Batam', 'Surabaya'],
  },
  {
    country: 'Italy',
    cities: ['Milan', 'Pisa', 'Rome', 'Venice'],
  },
  {
    country: 'Japan',
    cities: ['Osaka', 'Tokyo'],
  },
  {
    country: 'Malaysia',
    cities: ['Johor Bahru', 'Kuala Lumpur', 'Malacca City'],
  },
  {
    country: 'Philippines',
    cities: ['Lucena City', 'Manila'],
  },
  {
    country: 'Singapore',
    cities: ['Singapore'],
  },
  {
    country: 'South Korea',
    cities: ['Seoul'],
  },
  {
    country: 'Switzerland',
    cities: ['Lucerne', 'Zurich'],
  },
  {
    country: 'Taiwan',
    cities: ['New Taipei City', 'Taipei'],
  },
  {
    country: 'Thailand',
    cities: ['Bangkok', 'Kanchanaburi'],
  },
  {
    country: 'United Arab Emirates',
    cities: ['Abu Dhabi', 'Dubai'],
  },
  {
    country: 'Vietnam',
    cities: ['Ha Giang', 'Hanoi', 'Ho Chi Minh City'],
  },
] as const satisfies readonly VisitedCountry[];

export const COUNTRIES_VISITED_COUNT = VISITED_COUNTRIES.length;

export const CITIES_VISITED_COUNT = VISITED_COUNTRIES.reduce(
  (total, { cities }) => total + cities.length,
  0,
);
