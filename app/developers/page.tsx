import type { Metadata } from 'next';
import Playground from '@/components/Developers/Playground';
import PageWrapper from '@/components/Template/PageWrapper';
import { createPageMetadata } from '@/lib/metadata';

const title = 'Javier Chua Developer Portal';
export const metadata: Metadata = {
  ...createPageMetadata({
    title,
    description:
      'Quickstart, interactive read-only API playground, OpenAPI reference, version policy, and CLI preview for Javier Chua’s public portfolio API.',
    path: '/developers/',
  }),
  title: { absolute: title },
};

export default function DevelopersPage() {
  return (
    <PageWrapper>
      <article className="api-content" id="developer-portal">
        <header className="mb-10">
          <h1>Javier Chua Developer Portal</h1>
          <p>
            Use Javier’s public portfolio data in your own tools and agents.
            Start with one request, explore the response, then consult the API
            reference.
          </p>
          <nav aria-label="Developer resources">
            <ul>
              <li>
                <a href="#quickstart">Quickstart</a>
              </li>
              <li>
                <a href="#playground">API playground</a>
              </li>
              <li>
                <a href="/api/">API reference</a> ·{' '}
                <a href="/openapi.json">OpenAPI JSON</a> ·{' '}
                <a href="/openapi.yaml">OpenAPI YAML</a>
              </li>
              <li>
                <a href="#version-policy">Version policy</a> ·{' '}
                <a href="/api/#errors-heading">Errors</a> ·{' '}
                <a href="#cli">CLI preview</a>
              </li>
            </ul>
          </nav>
        </header>
        <section
          id="quickstart"
          className="mb-10"
          aria-labelledby="quickstart-heading"
        >
          <h2 id="quickstart-heading">Quickstart</h2>
          <p>
            The API is public and read-only. No API key, account, or
            authentication is needed. All five resources support GET and HEAD,
            return UTF-8 JSON, and allow public cross-origin reads.
          </p>
          <pre>
            <code>{`curl --fail-with-body -H 'Accept: application/json' \\\n  https://javierchuaby.dev/api/v1/profile`}</code>
          </pre>
          <p>
            The response describes Javier’s identity, education, public contact
            details, and current Position when one exists. Other resources are{' '}
            <code className="api-endpoint">/api/v1/work</code>,{' '}
            <code className="api-endpoint">/api/v1/projects</code>,{' '}
            <code className="api-endpoint">/api/v1/skills</code>, and{' '}
            <code className="api-endpoint">/api/v1/contact</code>. Skills carry
            subjective display prominence, not proficiency scores.
          </p>
        </section>
        <section
          id="playground"
          className="mb-10"
          aria-labelledby="playground-heading"
        >
          <h2 id="playground-heading">API playground</h2>
          <Playground />
        </section>
        <section
          id="version-policy"
          className="mb-10"
          aria-labelledby="version-heading"
        >
          <h2 id="version-heading">Version and deprecation policy</h2>
          <p>
            Use <code className="api-endpoint">/api/v1/</code> for new
            integrations. JSON responses identify the contract with{' '}
            <code className="http-header">API-Version: v1</code>. Existing{' '}
            <code className="api-endpoint">/api/profile</code> and other
            unversioned resource URLs remain supported aliases of v1.
          </p>
          <p>
            Breaking changes require a new major path, such as /api/v2/.
            Additive fields may appear within v1; clients should tolerate
            unknown fields. If a version or alias is scheduled for retirement,
            the affected responses and documentation will give at least 90 days’
            notice with Deprecation and Sunset headers. There is no current
            sunset or scheduled retirement.
          </p>
          <p>
            See the{' '}
            <a href="https://github.com/javierchuaby/portfolio/blob/main/docs/api-policy.md">
              API policy
            </a>{' '}
            for compatibility, versioning, and deprecation details, and the{' '}
            <a href="/api/">API reference</a> for errors and response headers.
          </p>
        </section>
        <section id="cli" aria-labelledby="cli-heading">
          <h2 id="cli-heading">CLI preview</h2>
          <p>
            The{' '}
            <code className="api-endpoint">@javierchuaby/portfolio-cli</code>{' '}
            package is a local preview and has not been published to npm. Use
            the{' '}
            <a href="https://github.com/javierchuaby/portfolio/tree/main/cli">
              CLI source and setup instructions
            </a>{' '}
            to run it from a checkout.
          </p>
          <pre>
            <code>javier-portfolio profile --json</code>
          </pre>
          <p>
            The CLI reads the same v1 resources. This command assumes you have
            followed the local setup instructions; a registry installation
            command will be added after publication.
          </p>
        </section>
      </article>
    </PageWrapper>
  );
}
