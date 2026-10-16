import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));

describe('production deployment', () => {
  it('uses the validated Cloudflare deployment by default', () => {
    expect(manifest.scripts.deploy).toBe('pnpm run deploy:worker');
    expect(manifest.scripts['deploy:worker']).toContain(
      'pnpm test && pnpm build && wrangler deploy',
    );
    expect(manifest.scripts['deploy:worker']).toContain(
      'pnpm verify:agents https://javierchuaby.dev',
    );
    expect(manifest.scripts.predeploy).toBeUndefined();
  });
  it('retains the production domain when Wrangler reconciles routes', () => {
    expect(config.routes).toEqual([
      { pattern: 'javierchuaby.dev', custom_domain: true },
    ]);
    expect(config.assets.not_found_handling).toBe('404-page');
    expect(config.assets.run_worker_first).toContain('/*');
    expect(config.assets.run_worker_first).toContain('!/_next/*');
    expect(config.assets.run_worker_first).toContain('!/images/*');
  });
});
