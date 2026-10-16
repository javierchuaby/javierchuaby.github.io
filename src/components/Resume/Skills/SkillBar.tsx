import type { CSSProperties } from 'react';

import type { Category, Skill } from '@/data/resume/skills';
import { MAX_PROMINENCE } from '@/lib/utils';

interface SkillBarProps {
  data: Skill;
  categories: Category[];
}

export default function SkillBar({ data, categories }: SkillBarProps) {
  const { category, prominence, title } = data;

  // Get the primary category for styling (color and pre-computed text contrast)
  const primaryCategory = categories.find((cat) => category.includes(cat.name));
  const categoryColor = primaryCategory?.color;

  // Use pre-computed text color from category data
  const textColorClass = primaryCategory
    ? primaryCategory.textColor === 'light'
      ? 'skillbar-title--light'
      : 'skillbar-title--dark'
    : '';

  const percentage = Math.min(
    100,
    Math.max((prominence / MAX_PROMINENCE) * 100, 0),
  );

  // Pass color via CSS custom property for design system consistency
  const skillbarStyle = {
    '--skillbar-color': categoryColor,
  } as CSSProperties;

  return (
    <div
      className="skillbar"
      role="progressbar"
      aria-valuenow={prominence}
      aria-valuemin={1}
      aria-valuemax={MAX_PROMINENCE}
      aria-label={`${title}: display prominence ${prominence} out of ${MAX_PROMINENCE}`}
      style={skillbarStyle}
    >
      <div className={`skillbar-title ${textColorClass}`}>
        <span>{title}</span>
      </div>
      <div className="skillbar-bar" style={{ width: `${percentage}%` }} />
      <div className="skill-bar-percent">
        {prominence} / {MAX_PROMINENCE}
      </div>
    </div>
  );
}
