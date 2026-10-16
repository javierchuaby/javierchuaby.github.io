import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const entrypoint = readFileSync('app/tailwind.css', 'utf8');
const apiCss = readFileSync('app/styles/pages/api.css', 'utf8');

describe('API documentation CSS regression', () => {
  it('keeps the page stylesheet as a plain import so it can override global content styles', () => {
    expect(entrypoint).toMatch(
      /@import\s+['"]\.\/styles\/pages\/api\.css['"]\s*;/,
    );
    expect(entrypoint).not.toMatch(/@import[^;]*api\.css[^;]*layer\(/);
  });

  it('scopes block-code rules to API content and uses theme tokens in both color schemes', () => {
    const style = document.createElement('style');
    style.textContent = apiCss;
    document.head.append(style);
    const fixture = document.createElement('div');
    fixture.innerHTML =
      '<article class="api-content"><p><code class="api-endpoint">GET /api/profile</code></p><pre><code>{"example":true}</code></pre></article><article><pre><code>Other page</code></pre></article>';
    document.body.append(fixture);
    try {
      const rules = [...(style.sheet?.cssRules || [])].filter(
        (rule): rule is CSSStyleRule => 'selectorText' in rule,
      );
      const block = fixture.querySelector('.api-content pre > code');
      const outside = fixture.querySelector('article:not(.api-content) code');
      const blockRules = rules.filter((rule) =>
        block?.matches(rule.selectorText),
      );
      expect(blockRules.length).toBeGreaterThan(0);
      expect(
        blockRules.every((rule) => !outside?.matches(rule.selectorText)),
      ).toBe(true);
      const properties = Object.fromEntries(
        blockRules.flatMap((rule) =>
          [...rule.style].map((property) => [
            property,
            rule.style.getPropertyValue(property),
          ]),
        ),
      );
      expect(properties['white-space']).toBe('pre');
      expect(properties.background).toBe('transparent');
      expect(properties.color).toMatch(/var\(--color-/);
      const pre = fixture.querySelector('.api-content pre');
      const preRules = rules.filter((rule) => pre?.matches(rule.selectorText));
      expect(
        preRules.some(
          (rule) => rule.style.getPropertyValue('overflow-x') === 'auto',
        ),
      ).toBe(true);
      expect(
        preRules.some((rule) =>
          /var\(--color-/.test(rule.style.getPropertyValue('background')),
        ),
      ).toBe(true);
    } finally {
      style.remove();
      fixture.remove();
    }
  });
});
