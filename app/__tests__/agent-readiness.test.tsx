import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import PersonSchema from '@/components/Schema/PersonSchema';
import { contactEmail, siteDescription } from '@/data/site';
import { AUTHOR_NAME, SITE_URL } from '@/lib/utils';
import AboutPage from '../about/page';
import ContactPage from '../contact/page';
import HomePage, { metadata } from '../page';

const mainContent = (page: React.ReactNode) => {
  const doc = new DOMParser().parseFromString(
    renderToStaticMarkup(page),
    'text/html',
  );
  for (const element of doc.querySelectorAll('script, style, svg'))
    element.remove();
  return doc.querySelector('main');
};

describe('agent readiness', () => {
  it.each([
    ['home', HomePage],
    ['about', AboutPage],
    ['contact', ContactPage],
  ])('%s provides 500 meaningful characters without JavaScript', (_, Page) => {
    const main = mainContent(<Page />);
    expect(
      main?.textContent?.replace(/\s+/g, ' ').trim().length,
    ).toBeGreaterThanOrEqual(500);
    expect(main?.querySelectorAll('h1')).toHaveLength(1);
  });

  it('identifies the real portfolio and homepage canonical', () => {
    expect(metadata.title).toMatchObject({
      absolute: expect.stringContaining(AUTHOR_NAME),
    });
    expect(metadata.description).toBe(siteDescription);
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/`);
  });

  it('describes the Person without inventing a portfolio business', () => {
    const { container } = render(<PersonSchema />);
    const person = JSON.parse(
      container.querySelector('script')?.textContent || '{}',
    );
    expect(person.description).toBe(siteDescription);
    expect(person.description.trim().length).toBeGreaterThan(20);
    expect(person.contactPoint).toMatchObject({
      '@type': 'ContactPoint',
      contactType: 'professional inquiries',
      email: contactEmail,
    });
    expect(person['@type']).toBe('Person');
  });
});
