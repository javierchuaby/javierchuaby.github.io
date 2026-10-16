import { readFileSync } from 'node:fs';

const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);
const resources = ['profile', 'work', 'projects', 'skills', 'contact'];
const defaultBaseUrl = 'https://javierchuaby.dev';
const help = `javier-portfolio ${version}

Usage: javier-portfolio <profile|work|projects|skills|contact> [options]

Read the public portfolio API at ${defaultBaseUrl}/api/v1/.
JSON is written to stdout; errors are written to stderr. No API key is needed.

Options:
  --json                Output JSON (the default)
  --base-url <url>      API origin; HTTPS or HTTP on localhost
  --timeout-ms <ms>     Request timeout, 1–120000 (default: 10000)
  --help, -h            Show help
  --version, -v         Show version
`;

function parseArguments(args) {
  const options = { baseUrl: defaultBaseUrl, timeout: 10000, resource: '' };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--version' || arg === '-v') return { version: true };
    if (arg === '--json') continue;
    if (arg === '--base-url' || arg === '--timeout-ms') {
      const value = args[++i];
      if (!value || value.startsWith('--'))
        throw new Error(`${arg} requires a value.`);
      if (arg === '--base-url') options.baseUrl = value;
      else {
        if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 120000)
          throw new Error('--timeout-ms must be an integer from 1 to 120000.');
        options.timeout = Number(value);
      }
      continue;
    }
    if (!resources.includes(arg))
      throw new Error(
        'Unknown argument. Use --help for supported commands and options.',
      );
    if (options.resource)
      throw new Error('Choose exactly one resource command.');
    options.resource = arg;
  }
  if (!options.resource)
    throw new Error('A resource command is required. Use --help.');
  let base;
  try {
    base = new URL(options.baseUrl);
  } catch {
    throw new Error('--base-url must be a valid URL.');
  }
  const localhost = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if (
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== '/'
  )
    throw new Error(
      '--base-url must be an origin without credentials, path, query, or fragment.',
    );
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && localhost))
    throw new Error('--base-url requires HTTPS, or HTTP on localhost.');
  return { ...options, baseUrl: base.origin };
}

function retryGuidance(value) {
  if (!value) return '';
  if (/^\d{1,9}$/.test(value)) return ` Retry after ${value} seconds.`;
  const date = Date.parse(value);
  if (Number.isFinite(date) && value.length <= 100)
    return ` Retry after ${new Date(date).toUTCString()}.`;
  return '';
}

export async function run(
  args,
  { stdout = process.stdout, stderr = process.stderr } = {},
) {
  try {
    const options = parseArguments(args);
    if (options.help) {
      stdout.write(help);
      return 0;
    }
    if (options.version) {
      stdout.write(`${version}\n`);
      return 0;
    }
    const response = await fetch(
      `${options.baseUrl}/api/v1/${options.resource}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(options.timeout),
        redirect: 'error',
      },
    );
    if (!response.ok) {
      const hint =
        response.status === 429
          ? retryGuidance(response.headers.get('Retry-After'))
          : '';
      // Error bodies can come from arbitrary origins; do not echo them to the terminal.
      await response.body?.cancel();
      throw new Error(`API request failed (HTTP ${response.status}).${hint}`);
    }
    if (
      !response.headers
        .get('Content-Type')
        ?.toLowerCase()
        .startsWith('application/json')
    ) {
      await response.body?.cancel();
      throw new Error(
        'API returned an unexpected media type; expected application/json.',
      );
    }
    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError')
        throw error;
      throw new Error('API returned invalid JSON.');
    }
    stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    return 0;
  } catch (error) {
    const message =
      error?.name === 'TimeoutError' || error?.name === 'AbortError'
        ? 'API request timed out. Use --timeout-ms to change the timeout.'
        : error?.message === 'fetch failed'
          ? 'Could not reach the API. Check the base URL and network connection.'
          : error.message;
    stderr.write(`javier-portfolio: ${message}\n`);
    return 1;
  }
}
