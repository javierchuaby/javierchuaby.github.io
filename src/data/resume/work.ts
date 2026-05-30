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
    highlights: [
      'Implemented a zero-rebuild ECS rollback mechanism by querying ECR manifests and forcing immediate cluster state reconciliations, enabling sub-minute incident recovery',
      'Built a dynamic Infrastructure-as-Code provisioning engine with Terraform, isolating zero-trust multi-tenant projects within a shared AWS ECS and ALB architecture',
      'Developed an automated multi-step project orchestration pipeline, reducing manual setup time from days to seconds',
      'Engineered a shift-left DevSecOps pipeline featuring automated SonarQube quality gating and dynamic Trivy container scanning with automatic hardened base-image injection',
    ],
    employmentType: 'Internship',
  },
];

export default work;
