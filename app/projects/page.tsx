import type { Metadata } from 'next';

import Cell from '@/components/Projects/Cell';
import PageWrapper from '@/components/Template/PageWrapper';
import data from '@/data/projects';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Archive',
  description: 'Early projects and experiments from Javier Chua.',
  path: '/projects/',
});

export default function ProjectsPage() {
  return (
    <PageWrapper>
      <section className="projects-page">
        <header className="projects-header">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            A collection of my side-projects and experiments
          </p>
        </header>

        {data.length > 0 && (
          <section className="projects-all">
            <div className="projects-grid">
              {data.map((project) => (
                <Cell data={project} key={project.title} />
              ))}
            </div>
          </section>
        )}
      </section>
    </PageWrapper>
  );
}
