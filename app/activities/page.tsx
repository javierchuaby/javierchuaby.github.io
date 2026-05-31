import type { Metadata } from 'next';

import Cell from '@/components/Projects/Cell';
import PageWrapper from '@/components/Template/PageWrapper';
import data from '@/data/activities';
import { createPageMetadata } from '@/lib/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Activities',
  description:
    'Leadership, sporting, and military experience from Javier Chua.',
  path: '/activities/',
});

export default function ActivitiesPage() {
  return (
    <PageWrapper>
      <section className="projects-page">
        <header className="projects-header">
          <h1 className="page-title">Activities</h1>
          <p className="page-subtitle">
            A collection of other cool experiences
          </p>
        </header>

        {data.length > 0 && (
          <section className="projects-all">
            <div className="activities-grid">
              {data.map((activity) => (
                <Cell data={activity} key={activity.title} layout="list" />
              ))}
            </div>
          </section>
        )}
      </section>
    </PageWrapper>
  );
}
