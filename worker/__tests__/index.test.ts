import { describe, expect, it } from 'vitest';
import worker from '../index';

const assets = {
  async fetch(request: Request) {
    const path = new URL(request.url).pathname;
    if (path === '/index.md' || path === '/about/index.md')
      return new Response(
        '# Javier Chua\n\nBackend and infrastructure portfolio.\n',
        { headers: { 'Content-Type': 'text/plain', ETag: '"markdown"' } },
      );
    if (path === '/' || path === '/about/')
      return new Response('<!doctype html><h1>Javier Chua</h1>', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          Vary: 'Accept-Encoding',
          ETag: '"html"',
        },
      });
    if (path === '/about')
      return new Response(null, {
        status: 307,
        headers: { Location: '/about/' },
      });
    if (path === '/llms.txt')
      return new Response('# Javier Chua\n', {
        headers: { 'Content-Type': 'text/plain' },
      });
    if (path === '/openapi.json')
      return new Response('{"openapi":"3.1.0"}', {
        headers: { 'Content-Type': 'application/json' },
      });
    if (path === '/openapi.yaml')
      return new Response('openapi: 3.1.0\n', {
        headers: { 'Content-Type': 'application/yaml' },
      });
    if (path === '/api/profile.json')
      return new Response('{"name":"Javier Chua"}', {
        headers: { 'Content-Type': 'application/json' },
      });
    if (path === '/api/work.json')
      return new Response('[{"name":"Visa"}]', {
        headers: { 'Content-Type': 'application/json' },
      });
    if (path === '/api/projects.json')
      return new Response('[{"title":"city.ai"}]', {
        headers: { 'Content-Type': 'application/json' },
      });
    if (path === '/api/skills.json')
      return new Response('[{"title":"Python"}]', {
        headers: { 'Content-Type': 'application/json' },
      });
    if (path === '/api/contact.json')
      return new Response('{"email":"javierchua.dev@gmail.com"}', {
        headers: { 'Content-Type': 'application/json' },
      });
    return new Response('<h1>Page Not Found</h1>', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  },
};
const get = (accept?: string, path = '/', method = 'GET') =>
  worker.fetch(
    new Request(`https://javierchuaby.dev${path}`, {
      method,
      headers: accept ? { Accept: accept } : {},
    }),
    { ASSETS: assets },
  );

describe('content negotiation', () => {
  it.each([
    'text/markdown',
    'TEXT/MARKDOWN',
    'text/html;q=0.5, text/markdown;q=0.9',
    'text/*;q=0.2, text/markdown;q=1',
    'text/html;q=0, */*;q=1',
  ])('serves Markdown for %s', async (accept) => {
    const response = await get(accept);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
    expect(response.headers.get('Vary')).toMatch(/Accept/);
    expect(await response.text()).toMatch(/^# Javier Chua/);
  });
  it.each([
    undefined,
    '*/*',
    'text/html',
    'text/html, text/markdown',
    'text/markdown;q=0, text/html',
    'text/markdown;q=0.2, text/html;q=0.8',
  ])('preserves HTML for %s', async (accept) => {
    const response = await get(accept);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('Vary')).toBe('Accept-Encoding, Accept');
    expect(await response.text()).toContain('<h1>');
  });
  it.each([
    'application/json',
    'text/html;q=0, text/markdown;q=0, */*;q=1',
  ])('rejects unsupported media ranges: %s', async (accept) => {
    expect((await get(accept)).status).toBe(406);
  });
  it('returns an explanatory Markdown 404 with discovery links', async () => {
    const response = await get('text/markdown', '/__missing/deep');
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
    expect(response.headers.get('Vary')).toContain('Accept');
    const body = await response.text();
    expect(body.length).toBeGreaterThan(20);
    expect(body).toMatch(/\[.+\]\(.*llms.txt\)/);
  });
  it('preserves HTML 404s', async () => {
    const response = await get('text/html', '/__missing');
    expect(response.status).toBe(404);
    expect(await response.text()).toContain('Page Not Found');
  });
  it('keeps canonical redirects and negotiates the final page', async () => {
    expect((await get('text/markdown', '/about')).status).toBe(307);
    expect(await (await get('text/markdown', '/about/')).text()).toMatch(
      /^# Javier/,
    );
  });
  it('does not negotiate machine-readable files', async () => {
    const response = await get('application/json', '/llms.txt');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/plain');
  });
  it('serves HEAD without a body for HTML, Markdown, errors and 406', async () => {
    for (const [accept, path, status] of [
      ['text/markdown', '/', 200],
      ['text/html', '/', 200],
      ['text/markdown', '/missing', 404],
      ['application/json', '/', 406],
    ] as const) {
      const response = await get(accept, path, 'HEAD');
      expect(response.status).toBe(status);
      expect(await response.text()).toBe('');
    }
  });
  it('does not reuse the HTML validator for Markdown', async () => {
    expect((await get('text/markdown')).headers.get('ETag')).not.toBe('"html"');
  });
  it('does not let an HTML validator or range suppress the Markdown body', async () => {
    const response = await worker.fetch(
      new Request('https://javierchuaby.dev/', {
        headers: {
          Accept: 'text/markdown',
          'If-None-Match': '"html"',
          Range: 'bytes=0-4',
        },
      }),
      {
        ASSETS: {
          async fetch(request: Request) {
            if (request.headers.has('If-None-Match'))
              return new Response(null, { status: 304 });
            if (request.headers.has('Range'))
              return new Response('part', { status: 206 });
            return assets.fetch(request);
          },
        },
      },
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toMatch(/^# Javier Chua/);
  });

  it('returns 503 rather than a successful HTML fallback when a Markdown export is missing', async () => {
    const response = await worker.fetch(
      new Request('https://javierchuaby.dev/', {
        headers: { Accept: 'text/markdown' },
      }),
      {
        ASSETS: {
          async fetch(request: Request) {
            if (new URL(request.url).pathname.endsWith('.md'))
              return new Response('missing', { status: 404 });
            return assets.fetch(request);
          },
        },
      },
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    expect(await response.text()).toContain('temporarily unavailable');
  });

  it('labels explicit Markdown files correctly without negotiating other assets', async () => {
    const response = await get('text/html', '/index.md');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'text/markdown; charset=utf-8',
    );
    expect(await response.text()).toMatch(/^# Javier/);
  });
  it('accepts optional whitespace before media type parameters', async () => {
    const response = await get('text/markdown ; q=1, text/html ; q=0.5');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
  });

  it.each([
    '',
    '<!doctype html><h1>Fallback</h1>',
  ])('rejects an empty or HTML Markdown asset: %s', async (body) => {
    const response = await worker.fetch(
      new Request('https://javierchuaby.dev/', {
        headers: { Accept: 'text/markdown' },
      }),
      {
        ASSETS: {
          async fetch(request: Request) {
            if (new URL(request.url).pathname.endsWith('.md'))
              return new Response(body, {
                headers: { 'Content-Type': body ? 'text/html' : 'text/plain' },
              });
            return assets.fetch(request);
          },
        },
      },
    );
    expect(response.status).toBe(503);
  });

  it('preserves conditional requests for explicit Markdown files', async () => {
    const response = await worker.fetch(
      new Request('https://javierchuaby.dev/index.md', {
        headers: { Accept: 'text/markdown', 'If-None-Match': '"markdown"' },
      }),
      {
        ASSETS: {
          async fetch(request: Request) {
            if (request.headers.get('If-None-Match') === '"markdown"')
              return new Response(null, {
                status: 304,
                headers: { ETag: '"markdown"' },
              });
            return assets.fetch(request);
          },
        },
      },
    );
    expect(response.status).toBe(304);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
    expect(await response.text()).toBe('');
  });
});

describe('OpenAPI and JSON API endpoints', () => {
  it('serves OpenAPI 3.1.0 JSON specification with rate limit headers', async () => {
    const response = await get('application/json', '/openapi.json');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('openapi+json');
    expect(response.headers.get('RateLimit-Limit')).toBe('100');
    expect(response.headers.get('RateLimit-Remaining')).toBe('99');
    expect(response.headers.get('RateLimit-Reset')).toBe('60');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    const data = JSON.parse(await response.text());
    expect(data.openapi).toBe('3.1.0');
  });

  it('serves OpenAPI YAML specification at /openapi.yaml', async () => {
    const response = await get('*/*', '/openapi.yaml');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/yaml');
    expect(response.headers.get('RateLimit-Limit')).toBe('100');
    expect(await response.text()).toContain('openapi: 3.1.0');
  });

  it('serves profile data at /api/profile and /api/profile.json', async () => {
    for (const path of ['/api/profile', '/api/profile.json']) {
      const response = await get('application/json', path);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain(
        'application/json',
      );
      expect(response.headers.get('RateLimit-Limit')).toBe('100');
      const data = JSON.parse(await response.text());
      expect(data.name).toBe('Javier Chua');
    }
  });

  it('rejects non-GET/HEAD methods on API endpoints with 405 JSON error', async () => {
    const response = await get('application/json', '/api/profile', 'POST');
    expect(response.status).toBe(405);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const data = JSON.parse(await response.text());
    expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    expect(data.error.resolution).toBeDefined();
  });

  it('returns structured JSON 404 for nonexistent /api/* endpoints', async () => {
    const response = await get('application/json', '/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get('RateLimit-Limit')).toBe('100');
    const data = JSON.parse(await response.text());
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toContain('API endpoint does not exist');
    expect(data.error.resolution).toContain('/openapi.json');
  });

  it('returns structured JSON 406 when Accept: application/json is sent to a page route', async () => {
    const response = await get('application/json', '/');
    expect(response.status).toBe(406);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const data = JSON.parse(await response.text());
    expect(data.error.code).toBe('NOT_ACCEPTABLE');
    expect(data.error.resolution).toBeDefined();
  });

  it('returns structured JSON 406 when Accept: application/json is sent to any page route', async () => {
    const response = await get('application/json', '/missing-page');
    expect(response.status).toBe(406);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const data = JSON.parse(await response.text());
    expect(data.error.code).toBe('NOT_ACCEPTABLE');
  });

  it('returns API directory at /api when requested with Accept: application/json', async () => {
    const response = await get('application/json', '/api');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    const data = JSON.parse(await response.text());
    expect(data.openapi).toBe('https://javierchuaby.dev/openapi.json');
    expect(data.endpoints.profile).toBeDefined();
  });
});
