export interface Project {
  title: string;
  subtitle?: string;
  link?: string;
  image: string;
  date: string;
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
    date: '2026-03-01',
    desc: 'Architected serverless AI orchestration on Cloudflare Pages Functions for multi-turn Gemini conversations, enforcing V8 isolate runtime parity via Cloudflare Tunnel. Engineered a high-throughput Python RAG ingestion pipeline indexing 1,700+ hyperlocal chunks into Supabase pgvector with hybrid rate-limiting to ensure 100% embedding success.',
    tech: [
      'Python',
      'React 19',
      'Cloudflare Pages',
      'Supabase (pgvector)',
      'Gemini 2.5 Flash',
      'Zod',
      'Vitest',
    ],
    featured: true,
  },
  {
    title: 'Java Blockchain',
    subtitle: 'Multithreaded Block Generation & Persistence',
    link: 'https://github.com/javierchuaby/java-blockchain',
    image: '/images/projects/catdetector.jpg',
    date: '2025-09-01',
    desc: 'Architected a concurrent Proof-of-Work mining engine utilizing custom thread pools and atomic primitives, distributing the hash exploration payload across multiple cores to accelerate block generation. Integrated an embedded H2 SQL database and HikariCP connection pooling to achieve durable state persistence and fault-tolerant restarts.',
    tech: ['Java', 'SHA-256', 'H2 Database', 'HikariCP', 'Gson', 'Maven'],
    featured: true,
  },
  {
    title: 'Splend',
    subtitle: 'Group Travel Planning & Expense iOS App',
    link: 'https://github.com/javierchuaby/splend',
    image: '/images/projects/splend.jpg',
    date: '2025-08-01',
    desc: 'Designed a greedy group debt simplification algorithm minimizing settlement transactions across unequal splits. Engineered an AI-driven receipt scanner using React Native and an Express microservice leveraging OpenAI Vision API to extract itemized expenses into structured JSON with robust fallback validation and in-memory calendar cache.',
    tech: [
      'React Native',
      'TypeScript',
      'Node.js',
      'Express',
      'Firebase',
      'OpenAI Vision API',
      'Jest',
    ],
  },
  {
    title: 'Starbucks Analyser',
    subtitle: 'Pandas Data Pipeline & Deterministic LLM Analytics',
    link: 'https://github.com/javierchuaby/starbucks-analyser',
    image: '/images/projects/starbucks2.jpg',
    date: '2024-05-01',
    desc: 'Built a fault-tolerant CSV ingestion pipeline in Pandas supporting multi-encoding fallbacks, automated schema normalization, and row deduplication. Engineered an LLM summarization pipeline with deterministic prompting, local caching, and exponential backoffs to deliver CLI and Streamlit UI data insights.',
    tech: [
      'Python',
      'Pandas',
      'Streamlit',
      'Groq API',
      'Typer',
      'Mypy',
      'Pytest',
    ],
  },
];

export default data;
