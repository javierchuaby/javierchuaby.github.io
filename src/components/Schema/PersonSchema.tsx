import contact from '@/data/contact';
import degrees from '@/data/resume/degrees';
import work from '@/data/resume/work';
import { siteDescription } from '@/data/site';
import { getCurrentPosition } from '@/lib/positions';
import { AUTHOR_NAME, SITE_URL } from '@/lib/utils';
import JsonLd from './JsonLd';

export default function PersonSchema() {
  // Extract social links for sameAs (excluding email)
  const socialLinks = contact
    .filter((item) => !item.link.startsWith('mailto:'))
    .map((item) => item.link);

  // Extract email from contact data
  const emailItem = contact.find((item) => item.link.startsWith('mailto:'));
  const email = emailItem?.link.replace('mailto:', '');

  const currentPosition = getCurrentPosition(work);

  const personData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    description: siteDescription,
    url: SITE_URL,
    image: `${SITE_URL}/images/me.jpg`,
    ...(email && {
      email,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'professional inquiries',
        email,
      },
    }),
    sameAs: socialLinks,
    ...(currentPosition && {
      jobTitle: currentPosition.position,
      worksFor: {
        '@type': 'Organization',
        name: currentPosition.name,
        url: currentPosition.url,
      },
    }),
    alumniOf: degrees.map((degree) => ({
      '@type': 'CollegeOrUniversity',
      name: degree.school,
      url: degree.link,
    })),
  };

  return <JsonLd data={personData} />;
}
