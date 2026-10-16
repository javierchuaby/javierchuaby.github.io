import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { verifyPortfolioConsistency } from './portfolio-consistency.mjs';

const base = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '');
const publicOrigin = 'https://javierchuaby.dev';
const request = (path, accept, method = 'GET', headers = {}) =>
  fetch(new URL(path, `${base}/`), {
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
for (const path of [
  '/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/activities/',
  '/api/',
])
  assert.ok(paths.includes(path));

let profileEmail;
const representations = { html: {}, markdown: {}, api: {} };
for (const path of paths) {
  const htmlResponse = await request(path, 'text/html');
  assert.equal(htmlResponse.status, 200, path);
  assert.match(htmlResponse.headers.get('content-type') || '', /text\/html/);
  hasVary(htmlResponse);
  const html = await htmlResponse.text();
  representations.html[path] = html;
  const dom = new JSDOM(html);
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
    if (['/about/', '/privacy/', '/api/'].includes(path))
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
      assert.match(person.contactPoint.email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/);
      profileEmail = person.contactPoint.email;
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
    if (['/contact/', '/privacy/'].includes(path)) {
      const links = [...doc.querySelectorAll('main a[href^="mailto:"]')];
      assert.ok(links.length > 0, path);
      for (const link of links)
        assert.equal(link.getAttribute('href'), `mailto:${profileEmail}`);
    }
    const markdownResponse = await request(path, 'text/markdown');
    assert.equal(markdownResponse.status, 200, path);
    assert.match(
      markdownResponse.headers.get('content-type') || '',
      /^text\/markdown/,
    );
    hasVary(markdownResponse);
    const markdown = await markdownResponse.text();
    representations.markdown[path] = markdown;
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
for (const path of ['/about', '/contact', '/privacy', '/api']) {
  const response = await request(path, 'text/markdown');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /^text\/markdown/);
}

// Next.js uses these static payloads for navigation into the API docs page.
for (const path of ['/api/index.txt', '/api/__next._tree.txt']) {
  const response = await request(path, '*/*', 'GET', { RSC: '1' });
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type') || '', /text\/plain/);
  assert.ok((await response.text()).trim().length > 0, path);
}

const openapi = await request('/openapi.json', 'application/json');
assert.equal(openapi.status, 200);
assert.match(openapi.headers.get('content-type') || '', /json/);
assert.equal(openapi.headers.get('ratelimit-limit'), null);
const openapiText = await openapi.text();
const openapiSpec = JSON.parse(openapiText);
assert.equal(openapiSpec.openapi, '3.1.0');
assert.ok(openapiSpec.paths['/api/profile']);
assert.ok(openapiSpec.paths['/api/v1/profile']);
assert.ok(openapiSpec.components.headers['API-Version']);
assert.doesNotMatch(openapiText, /RateLimit/);

const openapiYaml = await request('/openapi.yaml', '*/*');
assert.equal(openapiYaml.status, 200);
const openapiYamlText = await openapiYaml.text();
assert.match(openapiYamlText, /openapi: 3\.1\.0/);
assert.doesNotMatch(openapiYamlText, /RateLimit/);

const profile = await request('/api/v1/profile', 'application/json');
assert.equal(profile.status, 200);
assert.equal(profile.headers.get('api-version'), 'v1');
assert.equal(profile.headers.get('ratelimit-limit'), null);
const profileData = JSON.parse(await profile.text());
representations.api.profile = profileData;
const legacyProfile = await request('/api/profile', 'application/json');
assert.equal(legacyProfile.status, 200);
assert.equal(legacyProfile.headers.get('api-version'), 'v1');
assert.deepEqual(await legacyProfile.json(), profileData);
for (const resource of ['work', 'projects', 'skills', 'contact']) {
  const response = await request(`/api/v1/${resource}`, 'application/json');
  assert.equal(response.status, 200, resource);
  assert.match(response.headers.get('content-type') || '', /json/);
  assert.equal(response.headers.get('api-version'), 'v1');
  assert.equal(response.headers.get('ratelimit-limit'), null);
  representations.api[resource] = await response.json();
  const legacy = await request(`/api/${resource}`, 'application/json');
  assert.equal(legacy.status, 200, resource);
  assert.equal(legacy.headers.get('api-version'), 'v1');
  assert.deepEqual(await legacy.json(), representations.api[resource]);
}
verifyPortfolioConsistency(representations);

const api404 = await request('/api/nonexistent', 'application/json');
assert.equal(api404.status, 404);
const api404Data = JSON.parse(await api404.text());
assert.equal(api404Data.error.code, 'NOT_FOUND');

// Reuse the final GET URL: a hostname-canonicalizing 301 can turn POST into
// GET before it reaches the API, hiding the endpoint's method handling.
const api405 = await request(profile.url, 'application/json', 'POST');
assert.equal(api405.status, 405);
const api405Data = JSON.parse(await api405.text());
assert.equal(api405Data.error.code, 'METHOD_NOT_ALLOWED');
console.log(
  `Verified ${paths.length} public pages, their Markdown files, llms.txt and every linked resource, sitemap.xml, robots.txt, HEAD, redirects, 406 and HTML/Markdown 404s, plus HTML/Markdown/JSON portfolio consistency at ${base}.`,
);
