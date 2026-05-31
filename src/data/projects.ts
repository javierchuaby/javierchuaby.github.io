export interface Project {
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  startDate: string;
  endDate?: string;
  desc: string;
  tech?: string[];
  featured?: boolean;
}

const data: Project[] = [
  {
    title: 'city.ai',
    subtitle: 'Hyperlocal Intelligence Agent for Singapore',
    link: 'https://github.com/javierchuaby/city.ai',
    image: '/images/projects/city-ai.jpg',
    startDate: '2026-01-01',
    endDate: '2026-03-01',
    desc: 'Agent designed for travellers and residents seeking authentic community knowledge about Singapore. It automatically extracts and indexes chucks from targeted subreddits (r/singapore, r/singaporefood), and uses a RAG pipeline for reasoning and vector-based semantic search.',
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
      'Express',
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

export default data;
