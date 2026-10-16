import type { Metadata } from 'next';
import { PersonSchema } from '@/components/Schema';
import Hero from '@/components/Template/Hero';
import PageWrapper from '@/components/Template/PageWrapper';
import { homeParagraphs, siteDescription } from '@/data/site';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Backend & Infrastructure Engineering Portfolio',
    description: siteDescription,
    path: '/',
  }),
  title: {
    absolute: 'Javier Chua — Backend & Infrastructure Engineering Portfolio',
  },
};

export default function HomePage() {
  return (
    <PageWrapper>
      <PersonSchema />
      <Hero />
      <section className="home-section" aria-labelledby="portfolio-heading">
        <h2 id="portfolio-heading" className="section-title">
          Backend &amp; Infrastructure Engineering
        </h2>
        {homeParagraphs.map((paragraph) => (
          <p key={paragraph} className="section-desc">
            {paragraph}
          </p>
        ))}
      </section>
    </PageWrapper>
  );
}
