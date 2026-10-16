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
              developer documentation for AI agents and automated clients. Start
              at the{' '}
              <Link href="/developers/">Javier Chua Developer Portal</Link>
              for a quickstart, live playground, and CLI preview.
            </p>
          </div>
        </header>

        <section aria-labelledby="openapi-heading">
          <h2 id="openapi-heading">OpenAPI Specification</h2>
          <p>
            This portfolio exposes a public, read-only developer API providing
            information about Javier Chua&apos;s background, education,
            engineering positions, projects, and skills. The data endpoints are
            documented using the OpenAPI 3.1.0 standard, with the specification
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
            UTF-8 JSON with public CORS access and identify the contract with an{' '}
            <code>API-Version: v1</code> header. Each data endpoint also accepts
            a .json suffix. Unversioned resource URLs remain supported aliases
            of v1. New integrations should use /api/v1/. See the{' '}
            <Link href="/developers/#version-policy">
              version and deprecation policy
            </Link>
            .
          </p>
          <ul>
            <li>
              <code className="api-endpoint">GET /api/v1/profile</code> —
              Personal biography, degree, contact address, and social links.
            </li>
            <li>
              <code className="api-endpoint">GET /api/v1/work</code> —
              Positions, company details, and date ranges.
            </li>
            <li>
              <code className="api-endpoint">GET /api/v1/projects</code> —
              Software projects, repository links, dates, and technology tags.
            </li>
            <li>
              <code className="api-endpoint">GET /api/v1/skills</code> — Skills
              with Categories and a subjective prominence weight (1–5) for
              display size and ordering, not proficiency.
            </li>
            <li>
              <code className="api-endpoint">GET /api/v1/contact</code> —
              Inquiries guidelines, email address, and public social links.
            </li>
          </ul>
        </section>

        <section aria-labelledby="access-heading">
          <h2 id="access-heading">Access and Media Types</h2>
          <p>
            JSON data endpoints accept application/json and compatible
            wildcards. The JSON specification accepts application/json or
            application/vnd.oai.openapi+json; the YAML specification accepts
            application/yaml. Unsupported media types return 406.
          </p>
          <ul>
            <li>
              <code className="http-header">Accept: application/json</code> —
              Request JSON data or the JSON directory at /api/.
            </li>
            <li>
              <code className="http-header">Accept: text/markdown</code> —
              Request Markdown documentation at /api/.
            </li>
            <li>
              <code className="http-header">
                Access-Control-Allow-Origin: *
              </code>{' '}
              — JSON data and specifications allow public cross-origin reads.
            </li>
            <li>
              <code className="http-header">Allow: GET, HEAD</code> — Method
              errors identify the supported read-only methods.
            </li>
          </ul>
          <p>
            HEAD returns the same status and headers as GET with no response
            body. Responses identify the served data contract with an{' '}
            <code>API-Version: v1</code> header.
          </p>
          <p>
            No application-level request quota is enforced. No rate-limit
            headers are emitted.
          </p>
        </section>

        <section aria-labelledby="errors-heading">
          <h2 id="errors-heading">Structured Error Responses</h2>
          <p>
            Unmapped API URLs, unsupported methods or media types, and
            unavailable data exports return a structured JSON error object:
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
            <code className="api-endpoint">405 Method Not Allowed</code>,{' '}
            <code className="api-endpoint">406 Not Acceptable</code>, and{' '}
            <code className="api-endpoint">503 Service Unavailable</code>.
            Method errors include Allow: GET, HEAD.
          </p>
        </section>
      </article>
    </PageWrapper>
  );
}
