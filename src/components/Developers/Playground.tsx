'use client';

import { useState } from 'react';

const resources = ['profile', 'work', 'projects', 'skills', 'contact'] as const;
type Resource = (typeof resources)[number];

export default function Playground() {
  const [resource, setResource] = useState<Resource>('profile');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(
    'Choose a resource and send a GET request.',
  );
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState('');

  async function sendRequest() {
    setLoading(true);
    setError('');
    setResult(null);
    setStatus(`Loading /api/v1/${resource}…`);
    try {
      const response = await fetch(`/api/v1/${resource}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        signal: AbortSignal.timeout(15000),
      });
      const body: unknown = await response.json();
      setResult(body);
      setStatus(`HTTP ${response.status} ${response.statusText}`.trim());
      if (!response.ok)
        setError('The API returned an error. Review the JSON response below.');
    } catch {
      setStatus('Request did not complete.');
      setError(
        'Unable to read a JSON response. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div aria-busy={loading}>
      <p id="playground-note">
        This playground sends a real GET request to this site’s public API. It
        reads published portfolio data without changing anything. There is no
        separate sandbox backend; requests read the same public resources as any
        other client.
      </p>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="playground-resource">Resource</label>
          <select
            id="playground-resource"
            value={resource}
            disabled={loading}
            aria-describedby="playground-note"
            className="rounded border border-(--color-border) bg-(--color-bg) p-3 text-(--color-fg-bold)"
            onChange={(event) => {
              const selected = resources.find(
                (value) => value === event.target.value,
              );
              if (selected) setResource(selected);
            }}
          >
            {resources.map((value) => (
              <option key={value} value={value}>
                /api/v1/{value}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="button"
          disabled={loading}
          onClick={sendRequest}
        >
          {loading ? 'Loading…' : 'Send GET request'}
        </button>
      </div>
      <p role="status" aria-live="polite">
        {status}
      </p>
      {error && <p role="alert">{error}</p>}
      {result !== null && (
        <pre tabIndex={0} aria-label="JSON response">
          <code>{JSON.stringify(result, null, 2)}</code>
        </pre>
      )}
      <noscript>
        JavaScript is required for the playground. Use the curl quickstart above
        instead.
      </noscript>
    </div>
  );
}
