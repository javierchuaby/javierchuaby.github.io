import type { Metadata } from 'next';
import Link from 'next/link';
import PageWrapper from '@/components/Template/PageWrapper';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'API & Developer Documentation',
  description:
    'Public read-only API documentation and OpenAPI 3.1.0 specification for Javier Chua portfolio, with structured JSON endpoints for profile, career, projects, and skills.',
  path: '/api/',
});

export default function ApiDocsPage() {
  return (
    <PageWrapper>
      <article className="api-content" id="api-docs">
        <header>
          <div className="title">
            <h1>
              <Link href="/api">Developer API</Link>
            </h1>
            <p>
              Machine-readable endpoints, OpenAPI 3.1.0 specification, and
              developer documentation for AI agents and automated clients.
            </p>
          </div>
        </header>

        <section aria-labelledby="openapi-heading">
          <h2 id="openapi-heading">OpenAPI Specification</h2>
          <p>
            This portfolio exposes a public, read-only developer API providing
            verified information about Javier Chua&apos;s background, education,
            engineering positions, projects, and skills. The complete API
            surface is specified using the OpenAPI 3.1.0 standard and is
            available in both JSON and YAML formats:
          </p>
          <ul>
            <li>
              <strong>OpenAPI JSON:</strong>{' '}
              <a href="/openapi.json" target="_blank" rel="noopener noreferrer">
                /openapi.json
              </a>{' '}
              (or{' '}
              <a
                href="/api/openapi.json"
                target="_blank"
                rel="noopener noreferrer"
              >
                /api/openapi.json
              </a>
              )
            </li>
            <li>
              <strong>OpenAPI YAML:</strong>{' '}
              <a href="/openapi.yaml" target="_blank" rel="noopener noreferrer">
                /openapi.yaml
              </a>{' '}
              (or{' '}
              <a
                href="/api/openapi.yaml"
                target="_blank"
                rel="noopener noreferrer"
              >
                /api/openapi.yaml
              </a>
              )
            </li>
            <li>
              <strong>Agent Guide:</strong>{' '}
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
                /llms.txt
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="endpoints-heading">
          <h2 id="endpoints-heading">Available Endpoints</h2>
          <p>
            All endpoints are accessible via HTTP GET and HEAD requests. No
            authentication or API key is required. Responses are encoded as
            UTF-8 JSON with standard rate-limiting headers.
          </p>
          <ul>
            <li>
              <code className="api-endpoint">GET /api/profile</code> — Personal
              biography, degree, contact address, and social links.
            </li>
            <li>
              <code className="api-endpoint">GET /api/work</code> — Work
              history, company details, roles, and date ranges.
            </li>
            <li>
              <code className="api-endpoint">GET /api/projects</code> — Software
              projects, repository links, dates, and technology tags.
            </li>
            <li>
              <code className="api-endpoint">GET /api/skills</code> — Technical
              proficiencies categorized by programming languages, cloud, and
              databases.
            </li>
            <li>
              <code className="api-endpoint">GET /api/contact</code> — Inquiries
              policy, email address, and response timeframe expectations.
            </li>
          </ul>
        </section>

        <section aria-labelledby="ratelimit-heading">
          <h2 id="ratelimit-heading">Rate Limiting Conventions</h2>
          <p>
            To ensure reliable availability for all visitors and automated
            agents, API endpoints enforce standard IETF RFC RateLimit headers.
            Clients can inspect these response headers to self-throttle in real
            time:
          </p>
          <ul>
            <li>
              <code className="http-header">RateLimit-Limit: 100</code> — The
              maximum number of requests allowed per 60-second window.
            </li>
            <li>
              <code className="http-header">RateLimit-Remaining</code> — The
              number of remaining requests in the current time window.
            </li>
            <li>
              <code className="http-header">RateLimit-Reset: 60</code> — The
              seconds remaining until the window resets.
            </li>
            <li>
              <code className="http-header">RateLimit-Policy: 100;w=60</code> —
              The quota policy parameters.
            </li>
          </ul>
        </section>

        <section aria-labelledby="errors-heading">
          <h2 id="errors-heading">Structured Error Responses</h2>
          <p>
            When an API route is requested with invalid parameters, an unmapped
            URL, or an unsupported method, the server returns a structured JSON
            error object rather than an HTML page:
          </p>
          <pre>
            <code>{`{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested API endpoint does not exist.",
    "resolution": "Check the OpenAPI specification at /openapi.json or documentation at /api/."
  }
}`}</code>
          </pre>
          <p>
            Supported HTTP error status codes include{' '}
            <code className="api-endpoint">404 Not Found</code>,{' '}
            <code className="api-endpoint">405 Method Not Allowed</code>, and{' '}
            <code className="api-endpoint">406 Not Acceptable</code>.
          </p>
        </section>
      </article>
    </PageWrapper>
  );
}
