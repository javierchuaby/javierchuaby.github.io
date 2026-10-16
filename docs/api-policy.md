# API compatibility and quota policy

Canonical data endpoints use `/api/v1/profile`, `/api/v1/work`,
`/api/v1/projects`, `/api/v1/skills`, and `/api/v1/contact`. Each also accepts a
`.json` suffix. Existing `/api/{resource}` and `/api/{resource}.json` URLs remain
backward-compatible aliases. Data responses identify the served major version
with `API-Version: v1`. No authentication or API key is required.

Breaking response or behavior changes require a new major version path. Optional
additive fields may be introduced within v1; clients should tolerate unknown
fields. Versioning does not freeze portfolio facts: shared content and the
build-date evaluation of the current Position can change between builds.

No version or alias is currently scheduled for retirement, and no `Deprecation`
or `Sunset` header is currently emitted. If retirement is scheduled, affected
clients will receive at least **90 days of advance notice**, migration guidance,
and both of these response headers before removal:

- [`Deprecation` (RFC 9745)](https://www.rfc-editor.org/rfc/rfc9745.html) identifies
  the deprecation date using a structured date (`@` followed by Unix seconds).
- [`Sunset` (RFC 8594)](https://www.rfc-editor.org/rfc/rfc8594.html) identifies the
  planned removal date using an HTTP-date. The removal date must be at least 90
  days after the retirement announcement.

The [developer portal](https://javierchuaby.dev/developers/#version-policy) and
OpenAPI `x-versioning-policy` describe this same policy.

## Request quota

No application-level request quota is enforced. The API emits no `RateLimit`
headers and does not return `429` responses. Data requests are limited only by
the Cloudflare platform's own protections.
