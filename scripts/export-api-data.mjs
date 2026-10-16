import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const profileData = {
  name: 'Javier Chua',
  handle: 'javierchuaby',
  title: 'Backend & Infrastructure Engineer',
  description:
    'Javier Chua is a Computer Science student at the National University of Singapore (NUS), interested in backend systems, network engineering, and software engineering.',
  email: 'javierchua.dev@gmail.com',
  education: [
    {
      school: 'National University of Singapore',
      degree: 'B.Comp in Computer Science (Honours)',
      link: 'https://www.comp.nus.edu.sg',
      year: 2026,
    },
  ],
  currentPosition: null,
  social: [
    {
      label: 'LinkedIn',
      link: 'https://www.linkedin.com/in/javierchuaby/',
    },
    {
      label: 'GitHub',
      link: 'https://github.com/javierchuaby',
    },
    {
      label: 'Instagram',
      link: 'https://www.instagram.com/javierchuaby/',
    },
  ],
};

const workData = [
  {
    name: 'Visa',
    position: 'Network Engineer (AIOps)',
    url: 'https://www.visa.com.sg',
    startDate: '2026-05-12',
    endDate: '2026-07-31',
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

const projectsData = [
  {
    title: 'city.ai',
    subtitle: 'Hyperlocal Intelligence Agent for Singapore',
    link: 'https://github.com/javierchuaby/city.ai',
    image: '/images/projects/city-ai.jpg',
    startDate: '2026-01-01',
    endDate: '2026-03-01',
    desc: 'Agent designed for travellers and residents seeking authentic community knowledge about Singapore. It automatically extracts and indexes chunks from targeted subreddits (r/singapore, r/singaporefood), and uses a RAG pipeline for reasoning and vector-based semantic search.',
    tech: [
      'Python',
      'JavaScript',
      'React',
      'Cloudflare Pages',
      'Supabase (pgvector)',
      'Gemini 2.5 Flash',
      'gemini-embedding-001',
    ],
    featured: true,
  },
  {
    title: 'Splend',
    subtitle: 'Group Travel Planning & Expense iOS App',
    link: 'https://github.com/javierchuaby/splend',
    image: '/images/projects/splend/splend-flow.png',
    startDate: '2025-05-01',
    endDate: '2025-08-01',
    desc: 'An iOS app for groups planning trips together. It centralises itineraries, expenses, and logistics in one place, and includes a bill-splitting algorithm that settles debts at the end of a trip automatically. Users can also photograph receipts to log expenses instantly, with OCR handling the data entry.',
    tech: [
      'React Native',
      'TypeScript',
      'Firebase',
      'Google Cloud Run',
      'OpenAI Vision API',
    ],
  },
  {
    title: 'Java Blockchain',
    subtitle: 'Multithreaded Block Generation & Persistence',
    link: 'https://github.com/javierchuaby/My-New-Blockchain.git',
    image: '/images/projects/bitcoin.jpg',
    startDate: '2025-07-01',
    endDate: '2025-09-01',
    desc: 'Java-based implementation of a distributed ledger system designed as an educational framework for exploring decentralised consensus and cryptographic security.',
    tech: [
      'Java',
      'SHA-256',
      'H2 Database',
      'HikariCP',
      'Concurrency',
      'Maven',
    ],
    featured: true,
  },
  {
    title: 'Starbucks Analyser',
    subtitle: 'Pandas Data Pipeline & LLM Analytics',
    link: 'https://github.com/javierchuaby/Nutrition-Analyser.git',
    image: '/images/projects/starbucks2.jpg',
    startDate: '2025-10-01',
    endDate: '2025-11-01',
    desc: 'Specialised data analysis application designed to provide health-conscious consumers and nutritionists with deep insights into menu composition.',
    tech: ['Python', 'Pandas', 'NumPy', 'Groq LLM', 'Streamlit'],
  },
];

const skillsData = [
  { title: 'Python', competency: 5, category: ['AI/ML', 'Languages'] },
  {
    title: 'TypeScript',
    competency: 5,
    category: ['Languages', 'Web & Mobile'],
  },
  { title: 'Java', competency: 4, category: ['Languages'] },
  { title: 'C++', competency: 4, category: ['Languages'] },
  { title: 'Next.js', competency: 5, category: ['Web & Mobile'] },
  { title: 'React', competency: 5, category: ['Web & Mobile'] },
  { title: 'Node.js', competency: 5, category: ['Web & Mobile'] },
  { title: 'React Native', competency: 4, category: ['Web & Mobile'] },
  { title: 'AWS', competency: 5, category: ['Cloud & DevSecOps'] },
  { title: 'Azure DevOps', competency: 5, category: ['Cloud & DevSecOps'] },
  { title: 'Docker', competency: 5, category: ['Cloud & DevSecOps'] },
  { title: 'Terraform', competency: 4, category: ['Cloud & DevSecOps'] },
  { title: 'SonarQube', competency: 4, category: ['Cloud & DevSecOps'] },
  { title: 'Trivy', competency: 4, category: ['Cloud & DevSecOps'] },
  { title: 'Kubernetes (K8s)', competency: 3, category: ['Cloud & DevSecOps'] },
  { title: 'Argo CD', competency: 3, category: ['Cloud & DevSecOps'] },
  {
    title: 'Kafka',
    competency: 3,
    category: ['Cloud & DevSecOps', 'Data & Databases'],
  },
  { title: 'Entra ID (OIDC)', competency: 3, category: ['Cloud & DevSecOps'] },
  { title: 'GCP', competency: 3, category: ['Cloud & DevSecOps'] },
  { title: 'PostgreSQL', competency: 5, category: ['Data & Databases'] },
  { title: 'MongoDB', competency: 5, category: ['Data & Databases'] },
  { title: 'ClickHouse', competency: 4, category: ['Data & Databases'] },
  { title: 'InfluxDB3', competency: 4, category: ['Data & Databases'] },
  { title: 'Prisma', competency: 4, category: ['Data & Databases'] },
  { title: 'Supabase', competency: 4, category: ['Data & Databases'] },
  { title: 'PyTorch', competency: 5, category: ['AI/ML'] },
  { title: 'LangGraph', competency: 5, category: ['AI/ML'] },
  { title: 'LangChain', competency: 5, category: ['AI/ML'] },
  { title: 'scikit-learn', competency: 5, category: ['AI/ML'] },
  { title: 'CatBoost', competency: 4, category: ['AI/ML'] },
  { title: 'MLflow', competency: 4, category: ['AI/ML'] },
  { title: 'SevOne', competency: 4, category: ['Network Tools'] },
  { title: 'Netmiko', competency: 4, category: ['Network Tools'] },
  { title: 'NetBrain', competency: 4, category: ['Network Tools'] },
];

const contactData = {
  email: 'javierchua.dev@gmail.com',
  responseTime: 'Usually within 24 hours',
  guidelines: [
    'Email is the direct way to contact me about my portfolio, engineering background, or projects.',
    'For project questions, include the repository link and enough detail to explain what you are trying to do.',
    'For professional inquiries, include a short introduction, the scope, and any relevant dates.',
  ],
  social: [
    {
      label: 'LinkedIn',
      link: 'https://www.linkedin.com/in/javierchuaby/',
    },
    {
      label: 'GitHub',
      link: 'https://github.com/javierchuaby',
    },
    {
      label: 'Instagram',
      link: 'https://www.instagram.com/javierchuaby/',
    },
  ],
};

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function exportApi() {
  const targets = process.argv.includes('--update-public')
    ? ['public', 'out']
    : ['out'];
  for (const dir of targets) {
    const base = join(rootDir, dir);
    try {
      await mkdir(join(base, 'api'), { recursive: true });
      await writeJson(join(base, 'api', 'profile.json'), profileData);
      await writeJson(join(base, 'api', 'work.json'), workData);
      await writeJson(join(base, 'api', 'projects.json'), projectsData);
      await writeJson(join(base, 'api', 'skills.json'), skillsData);
      await writeJson(join(base, 'api', 'contact.json'), contactData);

      // Mirror openapi files
      const openapiJson = await readFile(
        join(rootDir, 'public', 'openapi.json'),
        'utf8',
      );
      const openapiYaml = await readFile(
        join(rootDir, 'public', 'openapi.yaml'),
        'utf8',
      );
      await writeFile(join(base, 'openapi.json'), openapiJson, 'utf8');
      await writeFile(join(base, 'openapi.yaml'), openapiYaml, 'utf8');
      await writeFile(join(base, 'api', 'openapi.json'), openapiJson, 'utf8');
      await writeFile(join(base, 'api', 'openapi.yaml'), openapiYaml, 'utf8');
    } catch (err) {
      if (dir === 'public') throw err;
      // 'out' might not exist before build, ignore
    }
  }
  console.log('Exported API JSON and OpenAPI files successfully.');
}

await exportApi();
