import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const binary = fileURLToPath(
  new URL('../bin/javier-portfolio.mjs', import.meta.url),
);
let server;
let baseUrl;
let requests = [];
let mode = 'ok';

before(async () => {
  server = createServer((request, response) => {
    requests.push({ path: request.url, accept: request.headers.accept });
    if (mode === 'timeout') return;
    if (mode === 'rate') {
      response.writeHead(429, { 'Retry-After': '17' });
      response.end('PRIVATE REMOTE ERROR');
      return;
    }
    if (mode === 'error') {
      response.writeHead(503);
      response.end('PRIVATE REMOTE ERROR');
      return;
    }
    if (mode === 'redirect') {
      response.writeHead(302, { Location: '/unexpected' });
      response.end();
      return;
    }
    response.setHeader(
      'Content-Type',
      mode === 'html' ? 'text/html' : 'application/json; charset=utf-8',
    );
    response.end(
      mode === 'invalid'
        ? '{invalid'
        : JSON.stringify({ resource: request.url, name: 'Javier Chua' }),
    );
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});

function invoke(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [binary, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('native binary shows help/version without making requests', async () => {
  const count = requests.length;
  const help = await invoke(['--help']);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /Usage: javier-portfolio/);
  assert.equal(help.stderr, '');
  const version = await invoke(['--version']);
  assert.equal(version.code, 0);
  assert.equal(version.stdout, '1.0.0\n');
  assert.equal(requests.length, count);
});

test('all five commands use the canonical versioned route and stable JSON stdout', async () => {
  mode = 'ok';
  for (const resource of ['profile', 'work', 'projects', 'skills', 'contact']) {
    const result = await invoke([resource, '--json', '--base-url', baseUrl]);
    assert.equal(result.code, 0);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), {
      resource: `/api/v1/${resource}`,
      name: 'Javier Chua',
    });
    assert.deepEqual(requests.at(-1), {
      path: `/api/v1/${resource}`,
      accept: 'application/json',
    });
    assert.ok(result.stdout.endsWith('\n'));
  }
  const result = await invoke(['profile', '--base-url', baseUrl]);
  assert.equal(result.code, 0);
  assert.equal(JSON.parse(result.stdout).resource, '/api/v1/profile');
});

test('invalid commands and options fail before networking without exposing credentials', async () => {
  const count = requests.length;
  for (const args of [
    [],
    ['unknown'],
    ['profile', 'work'],
    ['profile', '--bogus'],
    ['profile', '--base-url'],
    ['profile', '--timeout-ms', '-1'],
    ['profile', '--timeout-ms', '1.5'],
    ['profile', '--timeout-ms', '120001'],
    ['profile', '--base-url', 'http://example.com'],
    ['profile', '--base-url', 'https://user:TOPSECRET@example.com'],
    ['profile', '--base-url', 'https://example.com/api/v1'],
    ['profile', '--base-url', 'https://example.com/?secret=TOPSECRET'],
  ]) {
    const result = await invoke(args);
    assert.equal(result.code, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /javier-portfolio:/);
    assert.doesNotMatch(result.stderr, /TOPSECRET/);
  }
  assert.equal(requests.length, count);
});

test('HTTP 429 reports Retry-After with one request and no remote error body', async () => {
  mode = 'rate';
  const count = requests.length;
  const result = await invoke(['profile', '--base-url', baseUrl]);
  assert.equal(result.code, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /HTTP 429.*Retry after 17 seconds/);
  assert.doesNotMatch(result.stderr, /PRIVATE/);
  assert.equal(requests.length, count + 1);
});

test('HTTP failures, malformed JSON, unsupported media and redirects fail cleanly', async () => {
  for (const [nextMode, message] of [
    ['error', /HTTP 503/],
    ['invalid', /invalid JSON/],
    ['html', /unexpected media type/],
    ['redirect', /Could not reach the API/],
  ]) {
    mode = nextMode;
    const count = requests.length;
    const result = await invoke(['profile', '--base-url', baseUrl]);
    assert.equal(result.code, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, message);
    assert.doesNotMatch(result.stderr, /PRIVATE/);
    assert.equal(requests.length, count + 1);
  }
});

test('request timeout exits nonzero without hidden retries', async () => {
  mode = 'timeout';
  const count = requests.length;
  const result = await invoke([
    'profile',
    '--base-url',
    baseUrl,
    '--timeout-ms',
    '100',
  ]);
  assert.equal(result.code, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /timed out/);
  assert.equal(requests.length, count + 1);
});
