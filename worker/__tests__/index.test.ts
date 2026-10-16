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
  it('serves OpenAPI 3.1.0 JSON specification without quota headers', async () => {
    const response = await get('application/json', '/openapi.json');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(response.headers.get('RateLimit-Limit')).toBeNull();
    expect(response.headers.get('RateLimit-Remaining')).toBeNull();
    expect(response.headers.get('RateLimit-Reset')).toBeNull();
    expect(response.headers.get('RateLimit-Policy')).toBeNull();
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    const data = JSON.parse(await response.text());
    expect(data.openapi).toBe('3.1.0');
  });

  it.each([
    ['application/json', 'application/json'],
    [
      'application/json, application/vnd.oai.openapi+json;q=0',
      'application/json',
    ],
    [
      'application/json;q=0, application/vnd.oai.openapi+json',
      'application/vnd.oai.openapi+json',
    ],
    [
      'application/json;q=0.5, application/vnd.oai.openapi+json;q=0.9',
      'application/vnd.oai.openapi+json',
    ],
    [
      'application/json;q=0.9, application/vnd.oai.openapi+json;q=0.5',
      'application/json',
    ],
  ])('selects an acceptable OpenAPI JSON media type for %s', async (accept, expectedType) => {
    for (const path of ['/openapi.json', '/api/openapi.json']) {
      const response = await get(accept, path);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe(
        `${expectedType}; charset=utf-8`,
      );
      expect((await response.json()).openapi).toBe('3.1.0');
    }
  });

  it('rejects OpenAPI JSON when both media types are explicitly excluded', async () => {
    const response = await get(
      'application/json;q=0, application/vnd.oai.openapi+json;q=0, */*;q=1',
      '/openapi.json',
    );
    expect(response.status).toBe(406);
  });

  it('serves OpenAPI YAML specification at /openapi.yaml', async () => {
    const response = await get('*/*', '/openapi.yaml');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/yaml');
    expect(response.headers.get('RateLimit-Limit')).toBeNull();
    expect(await response.text()).toContain('openapi: 3.1.0');
  });

  it('serves profile data at canonical and alias routes with API-Version', async () => {
    for (const path of [
      '/api/v1/profile',
      '/api/v1/profile.json',
      '/api/profile',
      '/api/profile.json',
    ]) {
      const response = await get('application/json', path);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain(
        'application/json',
      );
      expect(response.headers.get('API-Version')).toBe('v1');
      expect(response.headers.get('RateLimit-Limit')).toBeNull();
      const data = JSON.parse(await response.text());
      expect(data.name).toBe('Javier Chua');
    }
  });

  it.each([
    'profile',
    'work',
    'projects',
    'skills',
    'contact',
  ])('serves /api/v1/%s and its unversioned alias with API-Version', async (resource) => {
    for (const path of [`/api/v1/${resource}`, `/api/${resource}`]) {
      const response = await get('application/json', path);
      expect(response.status).toBe(200);
      expect(response.headers.get('API-Version')).toBe('v1');
      expect(response.headers.get('Content-Type')).toContain(
        'application/json',
      );
    }
  });

  it('rejects non-GET/HEAD methods on API endpoints with 405 JSON error', async () => {
    for (const path of ['/api/profile', '/api/v1/profile']) {
      const response = await get('application/json', path, 'POST');
      expect(response.status).toBe(405);
      expect(response.headers.get('Content-Type')).toContain(
        'application/json',
      );
      expect(response.headers.get('API-Version')).toBe('v1');
      expect(response.headers.get('Allow')).toBe('GET, HEAD');
      const data = JSON.parse(await response.text());
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
      expect(data.error.resolution).toBeDefined();
    }
  });

  it('returns structured JSON 404 for nonexistent /api/* endpoints', async () => {
    const response = await get('application/json', '/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect(response.headers.get('RateLimit-Limit')).toBeNull();
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

  it.each([
    ['/api/profile', 'text/*'],
    ['/api/v1/profile', 'text/*'],
    ['/api/profile.json', 'application/json;q=0, */*;q=1'],
    ['/openapi.json', 'text/html'],
    ['/api/openapi.yaml', 'application/json'],
  ])('rejects unavailable media on %s: %s', async (path, accept) => {
    const response = await get(accept, path);
    expect(response.status).toBe(406);
    expect((await response.json()).error.code).toBe('NOT_ACCEPTABLE');
  });

  it.each([
    ['/api/profile', 'application/*'],
    ['/api/v1/work', 'application/*'],
    ['/api/work.json', '*/*'],
    ['/api/openapi.json', 'application/vnd.oai.openapi+json'],
    ['/api/openapi.yaml', 'application/yaml'],
  ])('supports matching media ranges and aliases on %s', async (path, accept) => {
    expect((await get(accept, path)).status).toBe(200);
  });

  it.each([
    '/api',
    '/api/',
    '/api/profile',
    '/api/contact.json',
    '/openapi.json',
    '/api/openapi.yaml',
  ])('includes Allow on method errors at %s regardless of Accept', async (path) => {
    const response = await get('text/html', path, 'POST');
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, HEAD');
    expect((await response.json()).error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it.each([
    '/api/profile',
    '/api/v1/profile',
    '/api/work.json',
    '/openapi.json',
    '/api/openapi.yaml',
  ])('returns a structured 503 when the backing asset is missing at %s', async (path) => {
    const response = await worker.fetch(
      new Request(`https://javierchuaby.dev${path}`),
      {
        ASSETS: { fetch: async () => new Response('missing', { status: 404 }) },
      },
    );
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe('SERVICE_UNAVAILABLE');
  });

  it.each([
    ['/api/profile', 'application/json'],
    ['/api/v1/profile', 'application/json'],
    ['/api/nonexistent', 'application/json'],
    ['/api/', 'application/json'],
    ['/openapi.json', 'application/json'],
    ['/api/openapi.yaml', 'application/yaml'],
    ['/api/profile', 'text/html'],
  ])('preserves GET status and headers for HEAD at %s', async (path, accept) => {
    const response = await get(accept, path);
    const head = await get(accept, path, 'HEAD');
    expect(head.status).toBe(response.status);
    expect([...head.headers]).toEqual([...response.headers]);
    expect(await head.text()).toBe('');
  });

  it.each([
    '/api/index.txt',
    '/api/__next._tree.txt',
    '/api/__next._full.txt',
    '/api/__next.api.__PAGE__.txt',
  ])('serves the exported Next.js navigation payload at %s without negotiation', async (path) => {
    for (const accept of [
      '*/*',
      'text/x-component',
      'text/markdown',
      'application/json',
    ]) {
      for (const method of ['GET', 'HEAD']) {
        const request = new Request(
          `https://javierchuaby.dev${path}?_rsc=fixture`,
          {
            method,
            headers: {
              Accept: accept,
              RSC: '1',
              'If-None-Match': '"old-payload"',
            },
          },
        );
        const response = await worker.fetch(request, {
          ASSETS: {
            async fetch(assetRequest: Request) {
              expect(assetRequest.url).toBe(request.url);
              expect(assetRequest.headers.get('Accept')).toBe(accept);
              expect(assetRequest.headers.get('RSC')).toBe('1');
              expect(assetRequest.headers.get('If-None-Match')).toBe(
                '"old-payload"',
              );
              return new Response('route payload', {
                headers: {
                  'Content-Type': 'text/plain; charset=utf-8',
                  ETag: '"payload"',
                },
              });
            },
          },
        });
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe(
          'text/plain; charset=utf-8',
        );
        expect(response.headers.get('ETag')).toBe('"payload"');
        expect(await response.text()).toBe(
          method === 'HEAD' ? '' : 'route payload',
        );
      }
    }
  });

  it.each([
    '/api/unknown.txt',
    '/api/__next.unknown.txt',
    '/api/unknown.json',
  ])('keeps unmapped API files as structured JSON 404s: %s', async (path) => {
    const response = await get('text/x-component', path);
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect((await response.json()).error.code).toBe('NOT_FOUND');
  });

  it('returns the API JSON 404 when a known navigation payload is absent', async () => {
    const response = await get('text/x-component', '/api/__next._tree.txt');
    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toContain('application/json');
    expect((await response.json()).error.code).toBe('NOT_FOUND');
  });
});
