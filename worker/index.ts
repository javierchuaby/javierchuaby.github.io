interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const RATE_LIMIT_HEADERS = {
  'RateLimit-Limit': '100',
  'RateLimit-Remaining': '99',
  'RateLimit-Reset': '60',
  'RateLimit-Policy': '100;w=60',
};

// Specific exclusions (q=0) take precedence over broader wildcards.
function quality(accept: string, type: string): number {
  let specificity = -1;
  let quality = 0;
  for (const entry of accept.toLowerCase().split(',')) {
    const [mediaType, ...parameters] = entry.trim().split(';');
    const range = mediaType.trim();
    const score =
      range === type ? 2 : range === 'text/*' ? 1 : range === '*/*' ? 0 : -1;
    if (score < 0 || score < specificity) continue;
    const parameter = parameters
      .map((part) => part.trim())
      .find((part) => part.startsWith('q='));
    const value = parameter ? Number(parameter.slice(2)) : 1;
    const q = Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0;
    quality = score === specificity ? Math.max(quality, q) : q;
    specificity = score;
  }
  return quality;
}

function varyAccept(response: Response): Response {
  const result = new Response(response.body, response);
  const vary = result.headers.get('Vary');
  if (
    !vary
      ?.split(',')
      .some((field) => ['accept', '*'].includes(field.trim().toLowerCase()))
  ) {
    result.headers.set('Vary', vary ? `${vary}, Accept` : 'Accept');
  }
  return result;
}

function markdown(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' },
  });
}

function json(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  const content =
    typeof body === 'string' ? body : `${JSON.stringify(body, null, 2)}\n`;
  return new Response(content, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      Vary: 'Accept',
      ...RATE_LIMIT_HEADERS,
      ...extraHeaders,
    },
  });
}

function jsonError(
  code: string,
  message: string,
  resolution: string,
  status = 404,
): Response {
  return json({ error: { code, message, resolution } }, status);
}

async function respond(request: Request, env: Env): Promise<Response> {
  const accept = request.headers.get('Accept') || '*/*';
  const htmlQuality = quality(accept, 'text/html');
  const markdownQuality = quality(accept, 'text/markdown');
  const jsonQuality = quality(accept, 'application/json');
  const pathname = new URL(request.url).pathname;
  const explicitMarkdown = pathname.endsWith('.md');

  // Handle OpenAPI specification endpoints
  if (pathname === '/openapi.json' || pathname === '/api/openapi.json') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError(
        'METHOD_NOT_ALLOWED',
        'Only GET and HEAD methods are supported.',
        'Use HTTP GET to access the OpenAPI specification.',
        405,
      );
    }
    const asset = await env.ASSETS.fetch(
      new Request('https://javierchuaby.dev/openapi.json', { method: 'GET' }),
    );
    if (asset.ok) {
      return json(await asset.text(), 200, {
        'Content-Type': 'application/vnd.oai.openapi+json; charset=utf-8',
      });
    }
  }

  if (pathname === '/openapi.yaml' || pathname === '/api/openapi.yaml') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError(
        'METHOD_NOT_ALLOWED',
        'Only GET and HEAD methods are supported.',
        'Use HTTP GET to access the OpenAPI specification.',
        405,
      );
    }
    const asset = await env.ASSETS.fetch(
      new Request('https://javierchuaby.dev/openapi.yaml', { method: 'GET' }),
    );
    if (asset.ok) {
      return new Response(await asset.text(), {
        status: 200,
        headers: {
          'Content-Type': 'application/yaml; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          Vary: 'Accept',
          ...RATE_LIMIT_HEADERS,
        },
      });
    }
  }

  // Handle structured API data endpoints
  const apiEndpoints = [
    '/api/profile',
    '/api/work',
    '/api/projects',
    '/api/skills',
    '/api/contact',
  ];
  const matchedEndpoint = apiEndpoints.find(
    (ep) => pathname === ep || pathname === `${ep}.json`,
  );
  if (matchedEndpoint) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError(
        'METHOD_NOT_ALLOWED',
        'Only GET and HEAD methods are supported.',
        'Use HTTP GET to retrieve this resource.',
        405,
      );
    }
    const targetUrl = new URL(request.url);
    targetUrl.pathname = `${matchedEndpoint}.json`;
    targetUrl.search = '';
    const asset = await env.ASSETS.fetch(
      new Request(targetUrl, { method: 'GET' }),
    );
    if (asset.ok) {
      return json(await asset.text());
    }
  }

  // Handle /api root when requested as JSON directory
  if (
    (pathname === '/api' || pathname === '/api/') &&
    jsonQuality > htmlQuality &&
    jsonQuality > markdownQuality
  ) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return jsonError(
        'METHOD_NOT_ALLOWED',
        'Only GET and HEAD methods are supported.',
        'Use HTTP GET to access the API index.',
        405,
      );
    }
    return json({
      message: 'Javier Chua Developer Portfolio API',
      openapi: 'https://javierchuaby.dev/openapi.json',
      docs: 'https://javierchuaby.dev/api/',
      endpoints: {
        profile: 'https://javierchuaby.dev/api/profile',
        work: 'https://javierchuaby.dev/api/work',
        projects: 'https://javierchuaby.dev/api/projects',
        skills: 'https://javierchuaby.dev/api/skills',
        contact: 'https://javierchuaby.dev/api/contact',
      },
    });
  }

  // Handle unmapped /api/* endpoints
  if (
    pathname.startsWith('/api/') &&
    pathname !== '/api/' &&
    pathname !== '/api' &&
    !explicitMarkdown
  ) {
    return jsonError(
      'NOT_FOUND',
      'The requested API endpoint does not exist.',
      'Check the OpenAPI specification at /openapi.json or developer documentation at /api/.',
      404,
    );
  }

  const probe = new Request(request);
  if (!explicitMarkdown && markdownQuality > htmlQuality) {
    for (const header of [
      'If-None-Match',
      'If-Modified-Since',
      'Range',
      'If-Range',
    ])
      probe.headers.delete(header);
  }
  const asset = await env.ASSETS.fetch(probe);
  if (explicitMarkdown && (asset.ok || asset.status === 304)) {
    const response = new Response(asset.body, asset);
    response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
    return response;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return asset;
  if (asset.status === 304) return varyAccept(asset);
  if (!asset.headers.get('Content-Type')?.includes('text/html')) return asset;

  if (htmlQuality === 0 && markdownQuality === 0) {
    if (jsonQuality > 0) {
      return jsonError(
        'NOT_ACCEPTABLE',
        'Available representations for page routes are text/html and text/markdown.',
        'Use Accept: text/html or Accept: text/markdown, or see /openapi.json for API endpoints.',
        406,
      );
    }
    return new Response(
      'Available representations: text/html and text/markdown.\n',
      {
        status: 406,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Vary: 'Accept',
        },
      },
    );
  }
  if (markdownQuality <= htmlQuality) return varyAccept(asset);
  if (asset.status === 404) {
    if (jsonQuality > htmlQuality && jsonQuality > markdownQuality) {
      return jsonError(
        'NOT_FOUND',
        'The requested page does not exist or has moved.',
        'Find available content in the agent guide (/llms.txt) or sitemap (/sitemap.xml).',
        404,
      );
    }
    return markdown(
      '# Page not found\n\nThe requested page does not exist or has moved. Find available content in the [agent guide](/llms.txt) or [sitemap](/sitemap.xml).\n',
      404,
    );
  }
  if (!asset.ok) return varyAccept(asset);

  const url = new URL(request.url);
  url.pathname = pathname.endsWith('/')
    ? `${pathname}index.md`
    : pathname.replace(/\.html$/, '.md');
  url.search = '';
  // Fetch a distinct asset with its own validators, never the HTML conditional headers.
  const source = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
  const body = source.ok ? await source.text() : '';
  if (
    !body.trim() ||
    source.headers.get('Content-Type')?.includes('text/html')
  ) {
    return markdown(
      '# Markdown temporarily unavailable\n\nPlease use the HTML page or [agent guide](/llms.txt).\n',
      503,
    );
  }
  return markdown(body);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Resolve HEAD as GET so negotiation and status match; only omit the final body.
    const response = await respond(
      request.method === 'HEAD'
        ? new Request(request, { method: 'GET' })
        : request,
      env,
    );
    return request.method === 'HEAD' ? new Response(null, response) : response;
  },
};
