import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import contacts from '../../src/data/contact';
import projects from '../../src/data/projects';
import education from '../../src/data/resume/degrees';
import { skills } from '../../src/data/resume/skills';
import work from '../../src/data/resume/work';
import {
  contactEmail,
  contactGuidance,
  siteDescription,
} from '../../src/data/site';
import { AUTHOR_HANDLE, AUTHOR_NAME } from '../../src/lib/utils';
import { buildApiData, exportApi } from '../export-api-data.mjs';

const temporaryDirectories: string[] = [];

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-api-'));
  temporaryDirectories.push(root);
  await mkdir(join(root, 'public'));
  await writeFile(join(root, 'public/openapi.json'), '{"openapi":"3.1.0"}\n');
  await writeFile(join(root, 'public/openapi.yaml'), 'openapi: 3.1.0\n');
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

describe('API export', () => {
  it('uses the shared content and exposes prominence without proficiency claims', () => {
    const data = buildApiData({ asOf: new Date('2026-10-16T00:00:00Z') });
    expect(data.work).toEqual(work);
    expect(data.projects).toEqual(projects);
    expect(data.skills).toEqual(skills);
    expect(
      data.skills.every(
        (skill) => 'prominence' in skill && !('competency' in skill),
      ),
    ).toBe(true);
    expect(data.profile).toMatchObject({
      name: AUTHOR_NAME,
      handle: AUTHOR_HANDLE,
      description: siteDescription,
      email: contactEmail,
      education,
      currentPosition: null,
    });
    const social = contacts
      .filter(({ link }) => !link.startsWith('mailto:'))
      .map(({ label, link }) => ({ label, link }));
    expect(data.profile.social).toEqual(social);
    expect(data.contact).toEqual({
      email: contactEmail,
      guidelines: contactGuidance,
      social,
    });
    expect(JSON.stringify(data)).not.toContain('"icon"');
    expect(data.profile).not.toHaveProperty('title');
    expect(data.contact).not.toHaveProperty('responseTime');
  });

  it('uses inclusive Position dates and excludes past and future Positions', () => {
    const position = {
      name: 'Fixture',
      position: 'Engineer',
      url: 'https://example.com',
      startDate: '2026-10-01',
      endDate: '2026-10-16',
    };
    const at = (date: string) =>
      buildApiData({
        positions: [position],
        asOf: new Date(`${date}T00:00:00Z`),
      }).profile.currentPosition;
    expect(at('2026-09-30')).toBeNull();
    expect(at('2026-10-01')).toEqual(position);
    expect(at('2026-10-16')).toEqual(position);
    expect(at('2026-10-17')).toBeNull();
  });

  it('runs directly on Node 24 without a bundler or TypeScript loader', () => {
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import { buildApiData } from ${JSON.stringify(resolve('scripts/export-api-data.mjs'))}; console.log(JSON.stringify(buildApiData()));`,
      ],
      { encoding: 'utf8' },
    );
    const data = JSON.parse(output);
    expect(data.projects).toEqual(projects);
    expect(data.profile.education).toEqual(education);
    expect(data.skills).toEqual(skills);
  });

  it('creates output directories and writes every JSON resource and OpenAPI mirror', async () => {
    const root = await fixture();
    const data = buildApiData({ asOf: new Date('2026-10-16T00:00:00Z') });
    await exportApi({ root, targets: ['public', 'out'], data });
    for (const target of ['public', 'out']) {
      for (const [name, value] of Object.entries(data)) {
        expect(
          JSON.parse(
            await readFile(join(root, target, 'api', `${name}.json`), 'utf8'),
          ),
        ).toEqual(value);
      }
      for (const extension of ['json', 'yaml']) {
        const source = await readFile(
          join(root, 'public', `openapi.${extension}`),
          'utf8',
        );
        expect(
          await readFile(join(root, target, `openapi.${extension}`), 'utf8'),
        ).toBe(source);
        expect(
          await readFile(
            join(root, target, 'api', `openapi.${extension}`),
            'utf8',
          ),
        ).toBe(source);
      }
    }
  });

  it('propagates missing inputs and output write failures', async () => {
    const root = await fixture();
    await writeFile(join(root, 'out'), 'blocking file');
    await expect(exportApi({ root })).rejects.toThrow();
    await rm(join(root, 'public/openapi.yaml'));
    await expect(
      exportApi({ root, targets: ['other-output'] }),
    ).rejects.toThrow(/ENOENT/);
  });
});
