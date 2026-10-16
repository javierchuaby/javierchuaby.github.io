import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import contacts from '../src/data/contact.ts';
import projects from '../src/data/projects.ts';
import education from '../src/data/resume/degrees.ts';
import { skills } from '../src/data/resume/skills.ts';
import work from '../src/data/resume/work.ts';
import {
  contactEmail,
  contactGuidance,
  siteDescription,
} from '../src/data/site.ts';
import { getCurrentPosition } from '../src/lib/positions.ts';
import { AUTHOR_HANDLE, AUTHOR_NAME } from '../src/lib/utils.ts';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

export function buildApiData({ asOf = new Date(), positions = work } = {}) {
  const social = contacts
    .filter(({ link }) => !link.startsWith('mailto:'))
    .map(({ label, link }) => ({ label, link }));

  return {
    profile: {
      name: AUTHOR_NAME,
      handle: AUTHOR_HANDLE,
      description: siteDescription,
      email: contactEmail,
      education,
      currentPosition: getCurrentPosition(positions, asOf) ?? null,
      social,
    },
    work: positions,
    projects,
    skills,
    contact: {
      email: contactEmail,
      guidelines: contactGuidance,
      social,
    },
  };
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function exportApi({
  root = rootDir,
  targets = ['out'],
  data = buildApiData(),
} = {}) {
  // Read both source files before writing any output so missing input fails clearly.
  const openapiJson = await readFile(
    join(root, 'public', 'openapi.json'),
    'utf8',
  );
  const openapiYaml = await readFile(
    join(root, 'public', 'openapi.yaml'),
    'utf8',
  );

  for (const dir of targets) {
    const base = join(root, dir);
    for (const [name, value] of Object.entries(data)) {
      await writeJson(join(base, 'api', `${name}.json`), value);
    }
    await writeFile(join(base, 'openapi.json'), openapiJson, 'utf8');
    await writeFile(join(base, 'openapi.yaml'), openapiYaml, 'utf8');
    await writeFile(join(base, 'api', 'openapi.json'), openapiJson, 'utf8');
    await writeFile(join(base, 'api', 'openapi.yaml'), openapiYaml, 'utf8');
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await exportApi({
    targets: process.argv.includes('--update-public')
      ? ['public', 'out']
      : ['out'],
  });
  console.log('Exported API JSON and OpenAPI files successfully.');
}
