import { describe, expect, it } from 'vitest';
import { contactGuidance, homeGuidance } from '../../src/data/site';
import { htmlToMarkdown, pageToMarkdown } from '../export-markdown.mjs';

describe('Markdown export', () => {
  it('does not attach homepage guidance to the exported error page', () => {
    expect(
      pageToMarkdown(
        '<main><h1>Not found</h1></main>',
        'https://javierchuaby.dev/404.html',
      ),
    ).not.toContain('## When to use this page');
  });
  it.each([
    ['/', homeGuidance],
    ['/contact/', contactGuidance],
  ])('keeps supplemental guidance publicly available in %s Markdown', (path, guidance) => {
    const html = '<main><h1>Page</h1><p>Visible content.</p></main>';
    const result = pageToMarkdown(html, `https://javierchuaby.dev${path}`);
    expect(result).toContain('Visible content.');
    expect(result).toContain('## When to use this page');
    for (const paragraph of guidance) expect(result).toContain(paragraph);
    expect(htmlToMarkdown(html)).not.toContain('## When to use this page');
    expect(
      pageToMarkdown(html, 'https://javierchuaby.dev/about/'),
    ).not.toContain('## When to use this page');
  });

  it('preserves content, sequential headings, links, lists and table cells without site chrome', () => {
    const html =
      '<nav>Navigation</nav><main><h1>Javier Chua</h1><h2>Projects</h2><p>A <a href="/projects/">project</a> &amp; <strong>code</strong>.</p><ul><li>Backend</li></ul><table><tr><td>School</td><td>NUS</td></tr></table><script>SECRET</script><svg><title>Icon</title></svg><span aria-hidden="true">Decoration</span></main><footer>Footer</footer>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('# Javier Chua');
    expect(result).toContain('## Projects');
    expect(result).toContain('[project](https://javierchuaby.dev/projects/)');
    expect(result).toContain('**code**');
    expect(result).toMatch(/-\s+Backend/);
    expect(result).toContain('School');
    expect(result).toContain('School | NUS');
    expect(result).not.toMatch(/Navigation|Footer|SECRET|Icon|Decoration/);
  });
  it('keeps adjacent inline text readable and image URLs absolute', () => {
    const result = htmlToMarkdown(
      '<main><h1>Profile</h1><span class="hero-chip">Backend</span><span class="hero-chip">Network</span><img src="/portrait.jpg" alt="Portrait" /></main>',
    );
    expect(result).toContain('Backend Network');
    expect(result).toContain('https://javierchuaby.dev/portrait.jpg');
  });
  it('retains accessible names for icon links after removing their SVGs', () => {
    const result = htmlToMarkdown(
      '<main><h1>Contact</h1><a href="https://github.com/javierchuaby" aria-label="GitHub profile"><svg><title>Icon</title></svg></a></main>',
    );
    expect(result).toContain(
      '[GitHub profile](https://github.com/javierchuaby)',
    );
  });
  it('fails the build rather than silently exporting an empty page', () => {
    expect(() => htmlToMarkdown('<nav>Only navigation</nav>')).toThrow(/main/i);
  });
  it('keeps email addresses assembled from inline spans intact', () => {
    const result = htmlToMarkdown(
      '<main><h1>Contact</h1><a href="mailto:javierchuaby@gmail.com"><span>javierchuaby</span><span>@gmail.com</span></a></main>',
    );
    expect(result).toContain(
      '[javierchuaby@gmail.com](mailto:javierchuaby@gmail.com)',
    );
  });
});
