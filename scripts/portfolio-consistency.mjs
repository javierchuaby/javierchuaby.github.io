import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const normalize = (text) =>
  text
    .replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
const sorted = (values) => [...new Set(values)].sort();
const contains = (text, value, context) =>
  assert.ok(
    normalize(text).includes(normalize(value)),
    `${context}: missing ${JSON.stringify(value)}`,
  );

// Check public representations against one another, independently of how the
// exporter constructs them. Used for both deployed responses and local tests.
export function verifyPortfolioConsistency({ html, markdown, api }) {
  const doms = Object.fromEntries(
    Object.entries(html).map(([path, body]) => [path, new JSDOM(body)]),
  );
  try {
    const document = (path) => {
      assert.ok(doms[path], `Missing HTML for ${path}`);
      assert.equal(
        typeof markdown[path],
        'string',
        `Missing Markdown for ${path}`,
      );
      return doms[path].window.document;
    };
    const mainText = (path) =>
      document(path).querySelector('main')?.textContent || '';
    const inBoth = (path, value) => {
      contains(mainText(path), value, `${path} HTML`);
      contains(markdown[path], value, `${path} Markdown`);
    };
    const home = document('/');
    const person = JSON.parse(
      home.querySelector('script[type="application/ld+json"]')?.textContent ||
        '{}',
    );
    assert.equal(person.name, api.profile.name, 'Person/API identity');
    assert.equal(person.alternateName, api.profile.handle, 'Person/API handle');
    assert.equal(
      person.description,
      api.profile.description,
      'Person/API description',
    );
    assert.equal(
      person.contactPoint?.email,
      api.profile.email,
      'Person/API email',
    );
    assert.equal(api.contact.email, api.profile.email, 'Contact/profile email');
    assert.deepEqual(
      sorted(person.sameAs),
      sorted(api.profile.social.map(({ link }) => link)),
    );
    assert.deepEqual(
      api.contact.social,
      api.profile.social,
      'Contact/profile public profiles',
    );
    inBoth('/', api.profile.name);
    inBoth('/resume/', api.profile.description);
    if (api.profile.currentPosition) {
      assert.equal(person.jobTitle, api.profile.currentPosition.position);
      assert.equal(person.worksFor?.name, api.profile.currentPosition.name);
      inBoth(
        '/',
        `${api.profile.currentPosition.position} at ${api.profile.currentPosition.name}`,
      );
    } else {
      assert.equal(
        person.jobTitle,
        undefined,
        'Completed positions must not be presented as current',
      );
      assert.equal(person.worksFor, undefined);
    }

    const contact = document('/contact/');
    const emails = [...contact.querySelectorAll('main a[href^="mailto:"]')];
    assert.ok(emails.length > 0, 'Contact HTML email link');
    for (const email of emails)
      assert.equal(email.getAttribute('href'), `mailto:${api.contact.email}`);
    contains(
      markdown['/contact/'],
      `mailto:${api.contact.email}`,
      'Contact Markdown email',
    );
    for (const { link } of api.contact.social) {
      assert.ok(
        [...contact.querySelectorAll('main a[href]')].some(
          (a) => a.getAttribute('href') === link,
        ),
        `Contact HTML public profile: ${link}`,
      );
      contains(markdown['/contact/'], link, 'Contact Markdown public profile');
    }

    const resume = document('/resume/');
    const education = [...resume.querySelectorAll('.degree-container')];
    assert.equal(
      education.length,
      api.profile.education.length,
      'HTML/API Education count',
    );
    for (const [index, degree] of api.profile.education.entries()) {
      const article = education[index];
      assert.equal(
        article.querySelector('.degree')?.textContent,
        degree.degree,
      );
      assert.equal(article.querySelector('a')?.textContent, degree.school);
      assert.equal(
        article.querySelector('a')?.getAttribute('href'),
        degree.link,
      );
      assert.equal(
        article.querySelector('time')?.dateTime,
        String(degree.year),
        'Education graduation year',
      );
      for (const value of [
        degree.degree,
        degree.school,
        String(degree.year),
        degree.link,
      ])
        contains(markdown['/resume/'], value, 'Education Markdown');
    }
    const positions = [...resume.querySelectorAll('.jobs-container')];
    assert.equal(positions.length, api.work.length, 'HTML/API Position count');
    for (const [index, position] of api.work.entries()) {
      const article = positions[index];
      assert.equal(
        article.querySelector('h4')?.textContent,
        position.name,
        'Position order/name',
      );
      assert.equal(
        article.querySelector('.role')?.textContent,
        position.position,
      );
      assert.equal(
        article.querySelector('a')?.getAttribute('href'),
        position.url,
      );
      assert.deepEqual(
        [...article.querySelectorAll('time')].map((time) => time.dateTime),
        [position.startDate, position.endDate].filter(Boolean),
        'Position dates',
      );
      assert.deepEqual(
        [...article.querySelectorAll('.points li')].map(
          (item) => item.textContent,
        ),
        position.highlights || [],
        'Position highlights',
      );
      contains(
        markdown['/resume/'],
        article.querySelector('.daterange')?.textContent || '',
        'Position Markdown dates',
      );
      for (const value of [
        position.name,
        position.position,
        position.summary,
        ...(position.highlights || []),
      ].filter(Boolean)) {
        contains(article.textContent, value, 'Position HTML');
        contains(markdown['/resume/'], value, 'Position Markdown');
      }
      contains(markdown['/resume/'], position.url, 'Position Markdown link');
    }

    const projects = [
      ...document('/projects/').querySelectorAll('.project-card'),
    ];
    assert.equal(
      projects.length,
      api.projects.length,
      'HTML/API Project count',
    );
    for (const [index, project] of api.projects.entries()) {
      const article = projects[index];
      assert.equal(
        article.querySelector('.project-card-title')?.textContent,
        project.title,
        'Project order/title',
      );
      assert.equal(
        article.querySelector('.project-card-link')?.getAttribute('href'),
        project.link,
      );
      assert.equal(article.querySelector('time')?.dateTime, project.startDate);
      assert.equal(
        article.querySelector('.project-card-desc')?.textContent,
        project.desc,
      );
      assert.deepEqual(
        [...article.querySelectorAll('.tech-tag')].map(
          (tag) => tag.textContent,
        ),
        project.tech || [],
        'Project technologies',
      );
      contains(
        markdown['/projects/'],
        article.querySelector('time')?.textContent || '',
        'Project Markdown dates',
      );
      for (const value of [
        project.title,
        project.subtitle,
        project.desc,
        ...(project.tech || []),
      ].filter(Boolean)) {
        contains(article.textContent, value, 'Project HTML');
        contains(markdown['/projects/'], value, 'Project Markdown');
      }
      if (project.link)
        contains(markdown['/projects/'], project.link, 'Project Markdown link');
    }
    assert.deepEqual(
      sorted(
        [...resume.querySelectorAll('.skill-tag-name')].map(
          (tag) => tag.textContent,
        ),
      ),
      sorted(api.skills.map(({ title }) => title)),
      'HTML/API Skill names',
    );
    for (const group of resume.querySelectorAll('.skill-group')) {
      const category = group.querySelector('.skill-group-title')?.textContent;
      assert.deepEqual(
        sorted(
          [...group.querySelectorAll('.skill-tag-name')].map(
            (tag) => tag.textContent,
          ),
        ),
        sorted(
          api.skills
            .filter((skill) => skill.category.includes(category))
            .map(({ title }) => title),
        ),
        `Skill membership in ${category}`,
      );
    }
    for (const skill of api.skills) {
      contains(markdown['/resume/'], skill.title, 'Skill Markdown');
      assert.ok(
        !Object.hasOwn(skill, 'competency'),
        'Skill prominence is not proficiency (ADR-0002)',
      );
      assert.ok(
        Number.isInteger(skill.prominence) &&
          skill.prominence >= 1 &&
          skill.prominence <= 5,
        'Skill prominence must be a display weight from 1 to 5',
      );
      for (const category of skill.category) inBoth('/resume/', category);
    }
  } finally {
    for (const dom of Object.values(doms)) dom.window.close();
  }
}
