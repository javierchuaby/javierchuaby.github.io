import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SITE_URL } from '@/lib/utils';
import PrivacyPage, { metadata } from '../privacy/page';
import sitemap from '../sitemap';

it('publishes a substantive privacy page with contact and analytics disclosure', () => {
  const { container, getByRole } = render(<PrivacyPage />);
  expect(container.querySelector('main')?.textContent?.length).toBeGreaterThan(
    500,
  );
  expect(getByRole('heading', { level: 1 })).toHaveTextContent('Privacy');
  expect(container).toHaveTextContent('Google Analytics');
  expect(container).toHaveTextContent('Cloudflare hosts the published site');
  expect(container).not.toHaveTextContent('GitHub Pages currently hosts');
  expect(getByRole('link', { name: 'javierchuaby@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:javierchuaby@gmail.com',
  );
  expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/privacy/`);
});

describe('trust page discovery', () => {
  it.each([
    'about',
    'contact',
    'privacy',
    'activities',
  ])('includes %s in the sitemap', (path) => {
    expect(
      sitemap().some((entry) => entry.url === `${SITE_URL}/${path}/`),
    ).toBe(true);
  });
});
