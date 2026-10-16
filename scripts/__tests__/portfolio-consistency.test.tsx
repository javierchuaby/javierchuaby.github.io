import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import contact from '@/data/contact';
import projects from '@/data/projects';
import degrees from '@/data/resume/degrees';
import { skills } from '@/data/resume/skills';
import work from '@/data/resume/work';
import { contactEmail, siteDescription } from '@/data/site';
import { AUTHOR_NAME } from '@/lib/utils';
import ContactPage from '../../app/contact/page';
import HomePage from '../../app/page';
import ProjectsPage from '../../app/projects/page';
import ResumePage from '../../app/resume/page';
import { buildApiData } from '../export-api-data.mjs';
import { htmlToMarkdown } from '../export-markdown.mjs';
import { verifyPortfolioConsistency } from '../portfolio-consistency.mjs';

const representations = () => {
  const html = {
    '/': renderToStaticMarkup(<HomePage />),
    '/contact/': renderToStaticMarkup(<ContactPage />),
    '/resume/': renderToStaticMarkup(<ResumePage />),
    '/projects/': renderToStaticMarkup(<ProjectsPage />),
  };
  return {
    html,
    markdown: Object.fromEntries(
      Object.entries(html).map(([path, body]) => [path, htmlToMarkdown(body)]),
    ),
    api: buildApiData(),
  };
};

describe('public portfolio representations', () => {
  it('exports the authoritative portfolio data and preserves it in HTML and Markdown', () => {
    const result = representations();
    expect(result.api.profile.name).toBe(AUTHOR_NAME);
    expect(result.api.profile.description).toBe(siteDescription);
    expect(result.api.profile.email).toBe(contactEmail);
    expect(result.api.profile.education).toEqual(degrees);
    expect(result.api.work).toEqual(work);
    expect(result.api.projects).toEqual(projects);
    expect(result.api.skills).toEqual(skills);
    expect(result.api.contact.social).toEqual(
      contact
        .filter(({ link }) => !link.startsWith('mailto:'))
        .map(({ label, link }) => ({ label, link })),
    );
    expect(() => verifyPortfolioConsistency(result)).not.toThrow();
  });

  it('propagates edits to source Positions, Projects, Skills and ContactItems without exporter edits', () => {
    const originalWork = [...work];
    const originalDegrees = [...degrees];
    const originalProjects = [...projects];
    const originalSkills = [...skills];
    const originalContact = [...contact];
    try {
      degrees.splice(0, 1, { ...degrees[0], year: 2099 });
      work.unshift({
        name: 'Portfolio Fixture Labs',
        position: 'Infrastructure Researcher',
        url: 'https://example.org/position',
        startDate: '2000-01-01',
        summary: 'Systems research fixture',
        highlights: ['A distinct published result'],
      });
      projects.push({
        title: 'Portfolio Fixture Project',
        subtitle: 'Source edit regression fixture',
        link: 'https://example.org/project',
        image: '/images/projects/bitcoin.jpg',
        startDate: '2000-01-01',
        desc: 'A newly authored independent project.',
        tech: ['Fixture Runtime'],
      });
      skills.push({
        title: 'Fixture Runtime',
        prominence: 2,
        category: ['Languages'],
      });
      contact.splice(0, 1, {
        ...contact[0],
        label: 'Fixture Profile',
        link: 'https://example.org/profile',
      });
      const result = representations();
      expect(result.api.profile.education[0].year).toBe(2099);
      expect(result.api.work[0].name).toBe('Portfolio Fixture Labs');
      expect(result.api.profile.currentPosition?.name).toBe(
        'Portfolio Fixture Labs',
      );
      expect(result.api.projects.at(-1)?.title).toBe(
        'Portfolio Fixture Project',
      );
      expect(result.api.skills.at(-1)?.title).toBe('Fixture Runtime');
      expect(result.api.contact.social[0].link).toBe(
        'https://example.org/profile',
      );
      expect(() => verifyPortfolioConsistency(result)).not.toThrow();
    } finally {
      work.splice(0, work.length, ...originalWork);
      degrees.splice(0, degrees.length, ...originalDegrees);
      projects.splice(0, projects.length, ...originalProjects);
      skills.splice(0, skills.length, ...originalSkills);
      contact.splice(0, contact.length, ...originalContact);
    }
  });

  it.each([
    'identity',
    'education',
    'contact',
    'work',
    'projects',
    'skills',
    'markdown',
  ])('rejects a stale %s representation', (kind) => {
    const result = representations();
    result.api = structuredClone(result.api);
    if (kind === 'education') result.api.profile.education[0].year = 1970;
    if (kind === 'identity') result.api.profile.name = 'Wrong Person';
    if (kind === 'contact') result.api.contact.email = 'wrong@example.org';
    if (kind === 'work') result.api.work[0].position = 'Wrong Position';
    if (kind === 'projects')
      result.api.projects[0].desc = 'Stale project description';
    if (kind === 'skills') result.api.skills.pop();
    if (kind === 'markdown')
      result.markdown['/projects/'] = '# Projects\nMissing content';
    expect(() => verifyPortfolioConsistency(result)).toThrow();
  });
});
