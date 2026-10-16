import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { verifyPortfolioConsistency } from './portfolio-consistency.mjs';

const directory = process.argv[2] || 'out';
const representations = { html: {}, markdown: {}, api: {} };
for (const path of ['/', '/contact/', '/resume/', '/projects/']) {
  for (const [kind, extension] of [
    ['html', 'html'],
    ['markdown', 'md'],
  ]) {
    representations[kind][path] = await readFile(
      join(directory, path, `index.${extension}`),
      'utf8',
    );
  }
}
for (const resource of ['profile', 'work', 'projects', 'skills', 'contact']) {
  representations.api[resource] = JSON.parse(
    await readFile(join(directory, 'api', `${resource}.json`), 'utf8'),
  );
}
verifyPortfolioConsistency(representations);
console.log(
  `Verified exported HTML/Markdown/JSON portfolio consistency in ${directory}.`,
);
