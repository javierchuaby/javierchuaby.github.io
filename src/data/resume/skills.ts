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
  { title: 'Python', competency: 5, category: ['Languages', 'AI/ML'] },
  { title: 'TypeScript', competency: 5, category: ['Languages', 'Web & Mobile'] },
  { title: 'Java', competency: 4, category: ['Languages'] },
  { title: 'C++', competency: 4, category: ['Languages'] },

  // Web & Mobile
  { title: 'Next.js', competency: 5, category: ['Web & Mobile'] },
  { title: 'React', competency: 5, category: ['Web & Mobile'] },
  { title: 'Node.js', competency: 5, category: ['Web & Mobile'] },
  { title: 'React Native', competency: 4, category: ['Web & Mobile'] },

  // Cloud & DevSecOps
  { title: 'AWS', competency: 5, category: ['Cloud & DevSecOps'] },
  { title: 'Azure DevOps', competency: 5, category: ['Cloud & DevSecOps'] },
  { title: 'Docker', competency: 5, category: ['Cloud & DevSecOps'] },
  { title: 'Terraform', competency: 4, category: ['Cloud & DevSecOps'] },
  { title: 'SonarQube', competency: 4, category: ['Cloud & DevSecOps'] },
  { title: 'Trivy', competency: 4, category: ['Cloud & DevSecOps'] },
  { title: 'Kubernetes (K8s)', competency: 3, category: ['Cloud & DevSecOps'] },
  { title: 'Argo CD', competency: 3, category: ['Cloud & DevSecOps'] },
  { title: 'Kafka', competency: 3, category: ['Cloud & DevSecOps', 'Data & Databases'] },
  { title: 'Entra ID (OIDC)', competency: 3, category: ['Cloud & DevSecOps'] },
  { title: 'GCP', competency: 3, category: ['Cloud & DevSecOps'] },

  // Data & Databases
  { title: 'PostgreSQL', competency: 5, category: ['Data & Databases'] },
  { title: 'MongoDB', competency: 5, category: ['Data & Databases'] },
  { title: 'ClickHouse', competency: 4, category: ['Data & Databases'] },
  { title: 'InfluxDB3', competency: 4, category: ['Data & Databases'] },
  { title: 'Prisma', competency: 4, category: ['Data & Databases'] },
  { title: 'Supabase', competency: 4, category: ['Data & Databases'] },

  // AI/ML
  { title: 'PyTorch', competency: 5, category: ['AI/ML'] },
  { title: 'LangGraph', competency: 5, category: ['AI/ML'] },
  { title: 'LangChain', competency: 5, category: ['AI/ML'] },
  { title: 'scikit-learn', competency: 5, category: ['AI/ML'] },
  { title: 'CatBoost', competency: 4, category: ['AI/ML'] },
  { title: 'MLflow', competency: 4, category: ['AI/ML'] },

  // Network Tools
  { title: 'SevOne', competency: 4, category: ['Network Tools'] },
  { title: 'Netmiko', competency: 4, category: ['Network Tools'] },
  { title: 'NetBrain', competency: 4, category: ['Network Tools'] },
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

const CATEGORY_ORDER = [
  'Languages',
  'AI/ML',
  'Cloud & DevSecOps',
  'Data & Databases',
  'Web & Mobile',
  'Network Tools',
];

/**
 * Build categories from skills with type-safe color assignment.
 * Logs a warning in development if there are more categories than colors.
 */
function buildCategories(skillsList: Skill[]): Category[] {
  const uniqueCategories = Array.from(
    new Set(skillsList.flatMap(({ category }) => category)),
  ).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.localeCompare(b);
  });

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
