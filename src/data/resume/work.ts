/**
 * Conforms to https://jsonresume.org/schema/
 */
export interface Position {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  employmentType?: string;
}

const work: Position[] = [
  {
    name: 'Visa',
    position: 'Network Engineer (AIOps)',
    url: 'https://www.visa.com.sg',
    startDate: '2026-05-12',
    summary: 'Infrastructure Reliability Engineering (IRE) - Network',
    highlights: ['Anomaly detection, event prediction & outage prevention'],
    employmentType: 'Internship',
  },
  {
    name: 'Central Provident Fund Board',
    position: 'Software Engineer',
    url: 'https://www.cpf.gov.sg',
    startDate: '2026-01-02',
    endDate: '2026-05-22',
    summary: 'AI Enablement Office (AEO) - Frontier Products',
    highlights: [],
    employmentType: 'Internship',
  },
];

export default work;
