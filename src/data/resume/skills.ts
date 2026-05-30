export interface Skill {
  title: string;
  competency: number;
  category: string[];
}

export interface Category {
  name: string;
  color: string;
  /** Pre-computed text color for contrast - 'dark' for light backgrounds, 'light' for dark */
  textColor: 'dark' | 'light';
}

const skills: Skill[] = [
  // Languages
  {
    title: 'TypeScript',
    competency: 5,
    category: ['Languages', 'Web & Mobile'],
  },
  {
    title: 'JavaScript',
    competency: 5,
    category: ['Languages', 'Web & Mobile'],
  },
  {
    title: 'Python',
    competency: 5,
    category: ['Languages', 'Security, AI & Tools', 'Data & Databases'],
  },
  { title: 'Java', competency: 4, category: ['Languages'] },
  {
    title: 'Bash/Shell',
    competency: 4,
    category: ['Languages', 'Cloud & DevOps'],
  },
  { title: 'C/C++', competency: 3, category: ['Languages'] },
  { title: 'Dart', competency: 3, category: ['Languages', 'Web & Mobile'] },

  // Web & Mobile
  { title: 'Next.js', competency: 5, category: ['Web & Mobile'] },
  { title: 'React', competency: 5, category: ['Web & Mobile'] },
  { title: 'React Native', competency: 4, category: ['Web & Mobile'] },
  { title: 'Node.js', competency: 5, category: ['Web & Mobile'] },
  { title: 'Express', competency: 4, category: ['Web & Mobile'] },
  { title: 'Flutter', competency: 3, category: ['Web & Mobile'] },
  { title: 'Expo', competency: 4, category: ['Web & Mobile'] },
  { title: 'Vite', competency: 5, category: ['Web & Mobile'] },
  { title: 'NextAuth', competency: 4, category: ['Web & Mobile'] },
  {
    title: 'Streamlit',
    competency: 4,
    category: ['Web & Mobile', 'Data & Databases'],
  },

  // Cloud & DevOps
  { title: 'AWS', competency: 4, category: ['Cloud & DevOps'] },
  { title: 'Terraform', competency: 5, category: ['Cloud & DevOps'] },
  { title: 'Docker', competency: 5, category: ['Cloud & DevOps'] },
  { title: 'Nginx', competency: 4, category: ['Cloud & DevOps'] },
  { title: 'Google Cloud Run', competency: 4, category: ['Cloud & DevOps'] },
  { title: 'Argo CD', competency: 3, category: ['Cloud & DevOps'] },
  { title: 'Azure DevOps', competency: 4, category: ['Cloud & DevOps'] },
  { title: 'CI/CD', competency: 5, category: ['Cloud & DevOps'] },
  {
    title: 'Kafka',
    competency: 4,
    category: ['Cloud & DevOps', 'Data & Databases'],
  },

  // Data & Databases
  { title: 'PostgreSQL', competency: 5, category: ['Data & Databases'] },
  { title: 'MySQL', competency: 4, category: ['Data & Databases'] },
  { title: 'MongoDB', competency: 4, category: ['Data & Databases'] },
  { title: 'SQLite', competency: 4, category: ['Data & Databases'] },
  { title: 'H2 Database', competency: 4, category: ['Data & Databases'] },
  { title: 'Prisma', competency: 4, category: ['Data & Databases'] },
  { title: 'Pandas', competency: 5, category: ['Data & Databases'] },
  { title: 'NumPy', competency: 4, category: ['Data & Databases'] },
  {
    title: 'scikit-learn',
    competency: 4,
    category: ['Data & Databases', 'Security, AI & Tools'],
  },
  { title: 'InfluxDB3', competency: 4, category: ['Data & Databases'] },

  // Security, AI & Tools
  {
    title: 'SonarQube',
    competency: 4,
    category: ['Security, AI & Tools', 'Cloud & DevOps'],
  },
  {
    title: 'Trivy',
    competency: 4,
    category: ['Security, AI & Tools', 'Cloud & DevOps'],
  },
  {
    title: 'Entra ID (OIDC)',
    competency: 4,
    category: ['Security, AI & Tools'],
  },
  { title: 'LangGraph', competency: 5, category: ['Security, AI & Tools'] },
  { title: 'LangChain', competency: 4, category: ['Security, AI & Tools'] },
  { title: 'CatBoost', competency: 4, category: ['Security, AI & Tools'] },
  { title: 'SevOne', competency: 4, category: ['Security, AI & Tools'] },
  { title: 'Vitest', competency: 5, category: ['Security, AI & Tools'] },
  { title: 'Jest', competency: 4, category: ['Security, AI & Tools'] },
  { title: 'JUnit', competency: 4, category: ['Security, AI & Tools'] },
  { title: 'Pytest', competency: 4, category: ['Security, AI & Tools'] },
].map((skill) => ({ ...skill, category: skill.category.sort() }));

/**
 * Category colors with pre-computed text contrast.
 * Uses CSS custom properties defined in tailwind.css for runtime styling,
 * with textColor pre-computed from the hex values for accessibility.
 *
 * Hex values from tailwind.css @theme block:
 * --color-skill-1: #6968b3, --color-skill-2: #37b1f5, --color-skill-3: #40494e
 * --color-skill-4: #515dd4, --color-skill-5: #e47272, --color-skill-6: #cc7b94
 */
const CATEGORY_COLORS: { color: string; textColor: 'dark' | 'light' }[] = [
  { color: 'var(--color-skill-1)', textColor: 'light' }, // #6968b3 - dark bg
  { color: 'var(--color-skill-2)', textColor: 'dark' }, // #37b1f5 - light bg
  { color: 'var(--color-skill-3)', textColor: 'light' }, // #40494e - dark bg
  { color: 'var(--color-skill-4)', textColor: 'light' }, // #515dd4 - dark bg
  { color: 'var(--color-skill-5)', textColor: 'dark' }, // #e47272 - light bg
  { color: 'var(--color-skill-6)', textColor: 'dark' }, // #cc7b94 - light bg
];

// Fallback colors for categories beyond the predefined set (with pre-computed contrast)
const FALLBACK_COLORS: { color: string; textColor: 'dark' | 'light' }[] = [
  { color: '#3896e2', textColor: 'dark' },
  { color: '#c3423f', textColor: 'light' },
  { color: '#d75858', textColor: 'light' },
  { color: '#747fff', textColor: 'light' },
  { color: '#64cb7b', textColor: 'dark' },
];

/**
 * Build categories from skills with type-safe color assignment.
 * Logs a warning in development if there are more categories than colors.
 */
function buildCategories(skillsList: Skill[]): Category[] {
  const uniqueCategories = Array.from(
    new Set(skillsList.flatMap(({ category }) => category)),
  ).sort();

  const allColors = [...CATEGORY_COLORS, ...FALLBACK_COLORS];

  if (
    process.env.NODE_ENV === 'development' &&
    uniqueCategories.length > allColors.length
  ) {
    console.warn(
      `[skills.ts] Warning: ${uniqueCategories.length} categories but only ${allColors.length} colors defined`,
    );
  }

  return uniqueCategories.map((category, index) => {
    const colorConfig = allColors[index] ?? {
      color: '#888888',
      textColor: 'light' as const,
    };
    return {
      name: category,
      color: colorConfig.color,
      textColor: colorConfig.textColor,
    };
  });
}

const categories: Category[] = buildCategories(skills);

export { categories, skills };
