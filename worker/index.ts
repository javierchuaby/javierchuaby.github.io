interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

// Specific exclusions (q=0) take precedence over broader wildcards.
function quality(accept: string, type: string): number {
  let specificity = -1;
  let quality = 0;
  for (const entry of accept.toLowerCase().split(',')) {
    const [mediaType, ...parameters] = entry.trim().split(';');
    const range = mediaType.trim();
    const score =
      range === type
        ? 2
        : range === `${type.split('/')[0]}/*`
          ? 1
          : range === '*/*'
            ? 0
            : -1;
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
  return json(
    { error: { code, message, resolution } },
    status,
    status === 405 ? { Allow: 'GET, HEAD' } : {},
  );
}

async function respond(request: Request, env: Env): Promise<Response> {
  const accept = request.headers.get('Accept') || '*/*';
  const htmlQuality = quality(accept, 'text/html');
  const markdownQuality = quality(accept, 'text/markdown');
  const jsonQuality = quality(accept, 'application/json');
  const pathname = new URL(request.url).pathname;
  const explicitMarkdown = pathname.endsWith('.md');

  const notAcceptable = () =>
    jsonError(
      'NOT_ACCEPTABLE',
      'The requested media type is unavailable for this resource.',
      'Use a media type listed in /openapi.json or Accept: */*.',
      406,
    );
  const unavailable = () =>
    jsonError(
      'SERVICE_UNAVAILABLE',
      'The requested API resource is temporarily unavailable.',
      'Retry later or use the portfolio pages.',
      503,
    );

  // The API directory also has HTML and Markdown representations.
  if (
    (pathname === '/api' || pathname === '/api/') &&
    request.method !== 'GET' &&
    request.method !== 'HEAD'
  ) {
    return jsonError(
      'METHOD_NOT_ALLOWED',
      'Only GET and HEAD methods are supported.',
      'Use HTTP GET to access the API directory.',
      405,
    );
  }

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
    const openapiQuality = quality(accept, 'application/vnd.oai.openapi+json');
    if (jsonQuality === 0 && openapiQuality === 0) return notAcceptable();
    const contentType =
      jsonQuality >= openapiQuality
        ? 'application/json'
        : 'application/vnd.oai.openapi+json';
    const asset = await env.ASSETS.fetch(
      new Request('https://javierchuaby.dev/openapi.json', { method: 'GET' }),
    );
    if (asset.ok) {
      return json(await asset.text(), 200, {
        'Content-Type': `${contentType}; charset=utf-8`,
      });
    }
    return unavailable();
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
    if (quality(accept, 'application/yaml') === 0) return notAcceptable();
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
        },
      });
    }
    return unavailable();
  }

  // Handle structured API data endpoints. `/api/v1/<resource>` is canonical;
  // unversioned `/api/<resource>` and `.json` forms remain compatible aliases.
  const dataResources = ['profile', 'work', 'projects', 'skills', 'contact'];
  const dataMatch = pathname.match(/^\/api\/(?:v1\/)?([a-z]+)(?:\.json)?$/);
  const resource =
    dataMatch && dataResources.includes(dataMatch[1]) ? dataMatch[1] : null;
  if (resource) {
    const versioned = (response: Response) => {
      response.headers.set('API-Version', 'v1');
      return response;
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return versioned(
        jsonError(
          'METHOD_NOT_ALLOWED',
          'Only GET and HEAD methods are supported.',
          'Use HTTP GET to retrieve this resource.',
          405,
        ),
      );
    }
    if (jsonQuality === 0) return versioned(notAcceptable());
    const targetUrl = new URL(request.url);
    targetUrl.pathname = `/api/${resource}.json`;
    targetUrl.search = '';
    const asset = await env.ASSETS.fetch(
      new Request(targetUrl, { method: 'GET' }),
    );
    if (asset.ok) {
      return versioned(json(await asset.text()));
    }
    return versioned(unavailable());
  }

  // Handle /api root when requested as JSON directory
  if (
    (pathname === '/api' || pathname === '/api/') &&
    jsonQuality > htmlQuality &&
    jsonQuality > markdownQuality
  ) {
    return json({
      message: 'Javier Chua Developer Portfolio API',
      version: 'v1',
      openapi: 'https://javierchuaby.dev/openapi.json',
      docs: 'https://javierchuaby.dev/api/',
      endpoints: {
        profile: 'https://javierchuaby.dev/api/v1/profile',
        work: 'https://javierchuaby.dev/api/v1/work',
        projects: 'https://javierchuaby.dev/api/v1/projects',
        skills: 'https://javierchuaby.dev/api/v1/skills',
        contact: 'https://javierchuaby.dev/api/v1/contact',
      },
    });
  }

  // Next.js fetches these exported route payloads during client navigation.
  // Keep their native media type and request headers, as with other static assets.
  if (
    (request.method === 'GET' || request.method === 'HEAD') &&
    [
      '/api/index.txt',
      '/api/__next._tree.txt',
      '/api/__next._full.txt',
      '/api/__next.api.__PAGE__.txt',
    ].includes(pathname)
  ) {
    const payload = await env.ASSETS.fetch(request);
    if (payload.status !== 404) return payload;
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
