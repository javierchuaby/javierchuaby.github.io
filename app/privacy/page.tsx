import type { Metadata } from 'next';
import PageWrapper from '@/components/Template/PageWrapper';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy',
  description:
    'How this personal portfolio handles hosting, analytics, browser preferences, and contact messages.',
  path: '/privacy/',
});

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <section className="about-page">
        <header className="about-header">
          <h1 className="page-title">Privacy</h1>
        </header>
        <article className="about-content">
          <p>
            This is Javier Chua&apos;s personal portfolio. You can read the
            public pages without creating an account or submitting personal
            information. This notice describes the data flows used by the site
            and how to ask questions about them.
          </p>
          <section className="about-section">
            <h2>Hosting and external services</h2>
            <p>
              The hosting provider receives information needed to deliver a
              page, such as your IP address, requested URL, and browser headers.
              Cloudflare hosts the published site and processes these requests.
              Cloudflare handles service logs under its own privacy policy.
            </p>
            <p>
              Links to GitHub, LinkedIn, Instagram, and other websites take you
              to services with their own privacy practices. The site statistics
              are fetched from public GitHub data at build time.
            </p>
          </section>
          <section className="about-section">
            <h2>Analytics and browser storage</h2>
            <p>
              The site supports Google Analytics when a tracking ID is
              configured for the build. When enabled, Google Analytics loads in
              your browser and may collect page visits and device information
              and use cookies. Browser privacy settings and content blockers can
              limit these requests. The site stores your light or dark theme
              preference in local storage so that your choice persists across
              visits.
            </p>
          </section>
          <section className="about-section">
            <h2>Contact and questions</h2>
            <p>
              The contact links open your email application or an external
              profile. If you email me, your email provider and mine process
              that message, and I receive the information you choose to include.
              Please avoid sending credentials or confidential material. For
              privacy questions or requests concerning a message you sent, email{' '}
              <a href="mailto:javierchuaby@gmail.com">javierchuaby@gmail.com</a>{' '}
              with enough context to identify it.
            </p>
          </section>
        </article>
      </section>
    </PageWrapper>
  );
}
