import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import contact from '@/data/contact';
import type { Position } from '@/data/resume/work';
import ContactPage from '../contact/page';
import HomePage from '../page';
import PrivacyPage from '../privacy/page';
import ResumePage, { metadata as resumeMetadata } from '../resume/page';

const positions: Position[] = vi.hoisted(() => [
  {
    name: 'Example Networks',
    position: 'Network Engineer',
    url: 'https://example.com',
    startDate: '2000-01-01',
    endDate: '2001-01-01',
  },
]);
vi.mock('@/data/resume/work', () => ({ default: positions }));
const documentFor = (page: React.ReactNode) =>
  new DOMParser().parseFromString(renderToStaticMarkup(page), 'text/html');

beforeEach(() => {
  positions[0].startDate = '2000-01-01';
  positions[0].endDate = '2001-01-01';
});

describe('profile consistency', () => {
  it('does not present a completed position as current in the hero, footer, or Person schema', () => {
    const doc = documentFor(<HomePage />);
    expect(doc.querySelector('.hero-tagline')?.textContent).not.toContain(
      ' at Visa',
    );
    expect(doc.querySelector('.footer-role')?.textContent).not.toContain(
      'Example Networks',
    );
    const person = JSON.parse(
      doc.querySelector('script[type="application/ld+json"]')?.textContent ||
        '{}',
    );
    expect(person.worksFor).toBeUndefined();
    expect(person.jobTitle).toBeUndefined();
  });
  it('uses a dated current position consistently when one exists', () => {
    positions[0].endDate = undefined;
    const doc = documentFor(<HomePage />);
    expect(doc.querySelector('.hero-tagline')?.textContent).toContain(
      'Network Engineer at Example Networks',
    );
    expect(doc.querySelector('.footer-role')?.textContent).toContain(
      'Network Engineer at Example Networks',
    );
    const person = JSON.parse(
      doc.querySelector('script[type="application/ld+json"]')?.textContent ||
        '{}',
    );
    expect(person.worksFor.name).toBe('Example Networks');
    expect(person.jobTitle).toBe('Network Engineer');
  });
  it('keeps the resume introduction truthful without a current employer', () => {
    const doc = documentFor(<ResumePage />);
    expect(doc.querySelector('.resume-summary')?.textContent).not.toMatch(
      /currently|Visa/,
    );
    expect(resumeMetadata.description).not.toMatch(/Senior Software Engineer/);
  });
  it('uses the configured public email across visible and privacy contact links', () => {
    const emailLink = contact.find((item) =>
      item.link.startsWith('mailto:'),
    )?.link;
    const doc = documentFor(
      <>
        <ContactPage />
        <PrivacyPage />
      </>,
    );
    const links = [...doc.querySelectorAll('a[href^="mailto:"]')];
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) expect(link.getAttribute('href')).toBe(emailLink);
  });
});
