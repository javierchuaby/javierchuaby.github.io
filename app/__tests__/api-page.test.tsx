import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ApiDocsPage from '../api/page';

describe('API page', () => {
  it('renders with correct structure and styling classes', () => {
    const { container } = render(<ApiDocsPage />);

    // Verify main container
    expect(container.querySelector('main')).toBeInTheDocument();

    // Verify content container has api-content class
    expect(container.querySelector('article')).toBeInTheDocument();

    // Verify sections
    const sections = container.querySelectorAll('section');
    expect(sections).toHaveLength(4);

    // Verify inline code elements have appropriate classes
    const endpointCodes = container.querySelectorAll('code.api-endpoint');
    expect(endpointCodes).toHaveLength(8);

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
      getByRole('heading', { level: 2, name: 'Rate Limiting Conventions' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { level: 2, name: 'Structured Error Responses' }),
    ).toBeInTheDocument();
  });

  it('includes API endpoint examples with proper styling', () => {
    const { container } = render(<ApiDocsPage />);

    const endpoints = [
      'GET /api/profile',
      'GET /api/work',
      'GET /api/projects',
      'GET /api/skills',
      'GET /api/contact',
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
      'RateLimit-Limit: 100',
      'RateLimit-Remaining',
      'RateLimit-Reset: 60',
      'RateLimit-Policy: 100;w=60',
    ];

    const headerCodes = container.querySelectorAll('code.http-header');
    expect(headerCodes).toHaveLength(headers.length);

    for (let i = 0; i < headers.length; i++) {
      expect(headerCodes[i]).toHaveTextContent(headers[i]);
    }
  });
});
