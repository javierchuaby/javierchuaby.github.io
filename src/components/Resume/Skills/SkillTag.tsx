import type { CSSProperties } from 'react';

import type { Category, Skill } from '@/data/resume/skills';
import { MAX_PROMINENCE } from '@/lib/utils';

interface SkillTagProps {
  data: Skill;
  categories: Category[];
}

export default function SkillTag({ data, categories }: SkillTagProps) {
  const { category, prominence, title } = data;

  // Get the primary category color
  const categoryColor = categories.find((cat) =>
    category.includes(cat.name),
  )?.color;

  // Size based on prominence (5 = large, 4 = medium, 3 = small)
  const sizeClass =
    prominence >= 5
      ? 'skill-tag--lg'
      : prominence >= 4
        ? 'skill-tag--md'
        : 'skill-tag--sm';

  return (
    <span
      className={`skill-tag ${sizeClass}`}
      style={
        {
          '--tag-color': categoryColor,
        } as CSSProperties
      }
      title={`${title}: display prominence ${prominence} out of ${MAX_PROMINENCE}`}
      aria-label={`${title}: display prominence ${prominence} out of ${MAX_PROMINENCE}`}
    >
      <span className="skill-tag-name">{title}</span>
    </span>
  );
}
