import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import { contactGuidance, homeGuidance } from '../src/data/site.ts';

export function htmlToMarkdown(html, pageUrl = 'https://javierchuaby.dev/') {
  const dom = new JSDOM(html);
  try {
    const main = dom.window.document.querySelector('main');
    if (!main) throw new Error('Exported page is missing main content');
    for (const element of main.querySelectorAll(
      'script, style, svg, [aria-hidden="true"]',
    ))
      element.remove();
    for (const link of main.querySelectorAll('a[href]')) {
      if (!link.textContent.trim()) {
        link.textContent =
          link.getAttribute('aria-label') ||
          link.getAttribute('title') ||
          link.getAttribute('href');
      }
      link.setAttribute(
        'href',
        new URL(link.getAttribute('href'), pageUrl).href,
      );
    }
    for (const image of main.querySelectorAll('img[src]')) {
      image.setAttribute(
        'src',
        new URL(image.getAttribute('src'), pageUrl).href,
      );
    }
    for (const element of main.querySelectorAll('.hero-chip, a')) {
      element.after(dom.window.document.createTextNode(' '));
    }
    const converter = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });
    converter.addRule('table-cell', {
      filter: ['td', 'th'],
      replacement: (content, node) =>
        `${content.trim()}${node.nextElementSibling ? ' | ' : ''}`,
    });
    converter.addRule('table-row', {
      filter: 'tr',
      replacement: (content) => `\n\n${content.trim()}\n\n`,
    });
    const markdown = converter.turndown(main.innerHTML);
    if (!markdown.trim())
      throw new Error('Exported page has empty main content');
    return `${markdown}\n`;
  } finally {
    dom.window.close();
  }
}

// Public Markdown includes supplemental retrieval guidance, without hidden HTML.
export function pageToMarkdown(html, pageUrl) {
  const markdown = htmlToMarkdown(html, pageUrl);
  const path = new URL(pageUrl).pathname;
  const guidance =
    path === '/' ? homeGuidance : path === '/contact/' ? contactGuidance : [];
  return guidance.length
    ? `${markdown}\n## When to use this page\n\n${guidance.join('\n\n')}\n`
    : markdown;
}

async function exportDirectory(directory, path = '/') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      await exportDirectory(
        join(directory, entry.name),
        `${path}${entry.name}/`,
      );
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const html = await readFile(join(directory, entry.name), 'utf8');
      const pagePath =
        entry.name === 'index.html' ? path : `${path}${entry.name}`;
      const markdown = pageToMarkdown(
        html,
        `https://javierchuaby.dev${pagePath}`,
      );
      await writeFile(
        join(directory, entry.name.replace(/\.html$/, '.md')),
        markdown,
      );
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await exportDirectory('out');
}
