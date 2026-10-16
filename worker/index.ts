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

async function respond(request: Request, env: Env): Promise<Response> {
  const accept = request.headers.get('Accept') || '*/*';
  const htmlQuality = quality(accept, 'text/html');
  const markdownQuality = quality(accept, 'text/markdown');
  const pathname = new URL(request.url).pathname;
  const explicitMarkdown = pathname.endsWith('.md');
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
