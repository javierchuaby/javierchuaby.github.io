import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ApiDocsPage from '../api/page';

describe('API page', () => {
  it('renders with correct structure and styling classes', () => {
    const { container } = render(<ApiDocsPage />);

    // Verify main container
    expect(container.querySelector('main')).toBeInTheDocument();

    // Verify content container has api-content class
    expect(container.querySelector('article.api-content')).toBeInTheDocument();

    // Verify sections
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(4);

    // Verify inline code elements have appropriate classes
    const endpointCodes = container.querySelectorAll('code.api-endpoint');
    expect(endpointCodes).toHaveLength(9);

    const headerCodes = container.querySelectorAll('code.http-header');
    expect(headerCodes).toHaveLength(4);

    // Verify pre/code block for JSON
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(container.querySelector('pre code')).toBeInTheDocument();
  });

  it('contains all expected API documentation sections', () => {
    const { getByRole } = render(<ApiDocsPage />);

    // Check for all section headings
    expect(
      getByRole('heading', { level: 2, name: 'OpenAPI Specification' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { level: 2, name: 'Available Endpoints' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { level: 2, name: 'Access and Media Types' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { level: 2, name: 'Structured Error Responses' }),
    ).toBeInTheDocument();
  });

  it('includes API endpoint examples with proper styling', () => {
    const { container } = render(<ApiDocsPage />);

    const endpoints = [
      'GET /api/v1/profile',
      'GET /api/v1/work',
      'GET /api/v1/projects',
      'GET /api/v1/skills',
      'GET /api/v1/contact',
    ];

    const endpointCodes = container.querySelectorAll('code.api-endpoint');
    expect(endpointCodes.length).toBeGreaterThanOrEqual(endpoints.length);

    for (let i = 0; i < endpoints.length; i++) {
      expect(endpointCodes[i]).toHaveTextContent(endpoints[i]);
    }
  });

  it('includes HTTP header examples with proper styling', () => {
    const { container } = render(<ApiDocsPage />);

    const headers = [
      'Accept: application/json',
      'Accept: text/markdown',
      'Access-Control-Allow-Origin: *',
      'Allow: GET, HEAD',
    ];

    const headerCodes = container.querySelectorAll('code.http-header');
    expect(headerCodes).toHaveLength(headers.length);

    for (let i = 0; i < headers.length; i++) {
      expect(headerCodes[i]).toHaveTextContent(headers[i]);
    }
  });

  it('describes prominence and access without promising an enforced quota', () => {
    const { container } = render(<ApiDocsPage />);
    expect(container).toHaveTextContent(
      'No application-level request quota is enforced.',
    );
    expect(container).toHaveTextContent('prominence weight (1–5)');
    expect(container).toHaveTextContent('not proficiency');
    expect(container).not.toHaveTextContent('RateLimit-');
  });
});
