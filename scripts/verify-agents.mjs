import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const base = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '');
const publicOrigin = 'https://javierchuaby.dev';
const request = (path, accept, method = 'GET', headers = {}) =>
  fetch(`${base}${path}`, {
    method,
    headers: { Accept: accept, ...headers },
    signal: AbortSignal.timeout(15000),
  });
const hasVary = (response) =>
  assert.match(response.headers.get('vary') || '', /(?:^|,\s*)Accept(?:,|$)/i);

const sitemap = await request('/sitemap.xml', 'application/xml');
assert.equal(sitemap.status, 200);
assert.match(sitemap.headers.get('content-type') || '', /xml/);
const xml = await sitemap.text();
const xmlDom = new JSDOM(xml, { contentType: 'text/xml' });
const paths = [...xmlDom.window.document.querySelectorAll('loc')].map(
  (node) => {
    const url = new URL(node.textContent);
    assert.equal(url.origin, publicOrigin);
    return url.pathname;
  },
);
xmlDom.window.close();
for (const path of ['/', '/about/', '/contact/', '/privacy/', '/activities/'])
  assert.ok(paths.includes(path));

for (const path of paths) {
  const htmlResponse = await request(path, 'text/html');
  assert.equal(htmlResponse.status, 200, path);
  assert.match(htmlResponse.headers.get('content-type') || '', /text\/html/);
  hasVary(htmlResponse);
  const dom = new JSDOM(await htmlResponse.text());
  try {
    const doc = dom.window.document;
    assert.equal(doc.documentElement.lang, 'en');
    assert.equal(
      doc.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      `${publicOrigin}${path}`,
    );
    assert.ok(doc.querySelector('meta[property="og:image"]'));
    assert.equal(
      doc.querySelector('meta[property="og:type"]')?.getAttribute('content'),
      'website',
    );
    const main = doc.querySelector('main');
    assert.ok(main, path);
    for (const element of main.querySelectorAll(
      'script, style, svg, [aria-hidden="true"]',
    ))
      element.remove();
    const text = main.textContent.replace(/\s+/g, ' ').trim();
    if (['/', '/about/', '/contact/', '/privacy/'].includes(path))
      assert.ok(text.length >= 500, `${path}: ${text.length} chars`);
    if (path === '/') {
      assert.equal(doc.querySelectorAll('h1').length, 1);
      let previous = 0;
      for (const heading of doc.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
        const level = Number(heading.tagName[1]);
        assert.ok(
          level <= previous + 1,
          `Skipped heading level: ${heading.textContent}`,
        );
        previous = level;
      }
      const schemaDom = new JSDOM(
        await (await request('/', 'text/html')).text(),
      );
      const person = JSON.parse(
        schemaDom.window.document.querySelector(
          'script[type="application/ld+json"]',
        ).textContent,
      );
      assert.equal(person['@type'], 'Person');
      assert.ok(person.description.length > 20);
      assert.equal(person.contactPoint.email, 'javierchuaby@gmail.com');
      schemaDom.window.close();
      assert.doesNotMatch(doc.title, /OpenAI|Promptfoo/);
      for (const selector of ['link[rel="stylesheet"]', 'main img[src]']) {
        const element = doc.querySelector(selector);
        assert.ok(element, selector);
        const assetPath = new URL(
          element.getAttribute('href') || element.getAttribute('src'),
          publicOrigin,
        ).pathname;
        const asset = await request(assetPath, 'text/markdown');
        assert.equal(asset.status, 200, assetPath);
        assert.match(
          asset.headers.get('content-type') || '',
          /text\/css|image\//,
        );
        const validator = asset.headers.get('etag');
        if (validator) {
          const conditional = await request(assetPath, 'text/markdown', 'GET', {
            'If-None-Match': validator,
          });
          assert.equal(conditional.status, 304, assetPath);
        }
      }
      const htmlValidator = htmlResponse.headers.get('etag');
      if (htmlValidator) {
        const conditional = await request('/', 'text/markdown', 'GET', {
          'If-None-Match': htmlValidator,
        });
        assert.equal(conditional.status, 200);
        assert.match(
          conditional.headers.get('content-type') || '',
          /^text\/markdown/,
        );
      }
    }
    const markdownResponse = await request(path, 'text/markdown');
    assert.equal(markdownResponse.status, 200, path);
    assert.match(
      markdownResponse.headers.get('content-type') || '',
      /^text\/markdown/,
    );
    hasVary(markdownResponse);
    const markdown = await markdownResponse.text();
    assert.match(markdown, /^# /m);
    assert.doesNotMatch(markdown, /<script|<!doctype|<html/i);
    assert.ok(markdown.length > 100);
    const alternate = doc
      .querySelector('link[rel="alternate"][type="text/markdown"]')
      ?.getAttribute('href');
    assert.ok(alternate, path);
    const direct = await request(new URL(alternate).pathname, 'text/markdown');
    assert.equal(direct.status, 200);
    assert.match(direct.headers.get('content-type') || '', /^text\/markdown/);
    assert.equal(await direct.text(), markdown);
    console.log(
      `${path}: HTML + Markdown + canonical + alternate verified (${text.length} HTML chars)`,
    );
  } finally {
    dom.window.close();
  }
}

const llms = await request('/llms.txt', 'text/plain');
assert.equal(llms.status, 200);
assert.match(llms.headers.get('content-type') || '', /text\/plain/);
const guide = await llms.text();
assert.match(guide, /^# Javier Chua\n\n> /);
assert.match(guide, /## When to use this/);
assert.equal(guide.match(/^# /gm)?.length, 1);
for (const section of guide.split(/^## /m).slice(1)) {
  for (const line of section
    .trim()
    .split('\n')
    .slice(1)
    .filter((line) => line.trim())) {
    assert.match(line, /^- \[.+\]\(https:\/\/.+\)(?:: .+)?$/);
  }
}
for (const match of guide.matchAll(
  /\]\((https:\/\/javierchuaby\.dev[^)]+)\)/g,
)) {
  const response = await request(new URL(match[1]).pathname, '*/*');
  assert.equal(response.status, 200, match[1]);
}
const robots = await request('/robots.txt', 'text/plain');
assert.equal(robots.status, 200);
assert.match(
  await robots.text(),
  /Sitemap: https:\/\/javierchuaby.dev\/sitemap.xml/,
);

for (const accept of ['text/markdown', 'text/html']) {
  const response = await request('/__ora-404-probe-vqal51sr', accept);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type') || '', new RegExp(accept));
  hasVary(response);
  const body = await response.text();
  assert.ok(body.length >= 20);
  if (accept === 'text/markdown') assert.match(body, /\[.+\]\(.*llms.txt\)/);
  const head = await request('/', accept, 'HEAD');
  assert.equal(head.status, 200);
  assert.match(head.headers.get('content-type') || '', new RegExp(accept));
  assert.equal(await head.text(), '');
}
assert.equal((await request('/', 'application/json')).status, 406);
for (const path of ['/about', '/contact', '/privacy']) {
  const response = await request(path, 'text/markdown');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /^text\/markdown/);
}
console.log(
  `Verified ${paths.length} public pages, their Markdown files, llms.txt and every linked resource, sitemap.xml, robots.txt, HEAD, redirects, 406 and HTML/Markdown 404s at ${base}.`,
);
