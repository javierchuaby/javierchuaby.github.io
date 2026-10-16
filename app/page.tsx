import type { Metadata } from 'next';
import { PersonSchema } from '@/components/Schema';
import Hero from '@/components/Template/Hero';
import PageWrapper from '@/components/Template/PageWrapper';
import { siteDescription } from '@/data/site';
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
    </PageWrapper>
  );
}
