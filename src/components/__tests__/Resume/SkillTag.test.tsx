import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SkillTag from '../../Resume/Skills/SkillTag';

const mockCategories = [
  { name: 'Languages', color: '#6968b3', textColor: 'light' as const },
  { name: 'ML Engineering', color: '#37b1f5', textColor: 'dark' as const },
];

describe('SkillTag', () => {
  it('renders the skill title', () => {
    const skill = { title: 'Python', prominence: 5, category: ['Languages'] };

    render(<SkillTag data={skill} categories={mockCategories} />);

    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('describes prominence as display weight rather than proficiency', () => {
    render(
      <SkillTag
        data={{ title: 'Python', prominence: 5, category: ['Languages'] }}
        categories={mockCategories}
      />,
    );
    const tag = screen.getByText('Python').closest('.skill-tag');
    expect(tag).toHaveAttribute(
      'aria-label',
      'Python: display prominence 5 out of 5',
    );
    expect(tag).toHaveAttribute(
      'title',
      'Python: display prominence 5 out of 5',
    );
  });

  it('applies large size class for prominence 5', () => {
    const skill = { title: 'Python', prominence: 5, category: ['Languages'] };

    render(<SkillTag data={skill} categories={mockCategories} />);

    const tag = document.querySelector('.skill-tag');
    expect(tag).toHaveClass('skill-tag--lg');
  });

  it('applies medium size class for prominence 4', () => {
    const skill = {
      title: 'JavaScript',
      prominence: 4,
      category: ['Languages'],
    };

    render(<SkillTag data={skill} categories={mockCategories} />);

    const tag = document.querySelector('.skill-tag');
    expect(tag).toHaveClass('skill-tag--md');
  });

  it('applies small size class for prominence 3 or below', () => {
    const skill = { title: 'Ruby', prominence: 3, category: ['Languages'] };

    render(<SkillTag data={skill} categories={mockCategories} />);

    const tag = document.querySelector('.skill-tag');
    expect(tag).toHaveClass('skill-tag--sm');
  });

  it('sets category color as CSS variable', () => {
    const skill = { title: 'Python', prominence: 5, category: ['Languages'] };

    render(<SkillTag data={skill} categories={mockCategories} />);

    const tag = document.querySelector('.skill-tag') as HTMLElement;
    expect(tag.style.getPropertyValue('--tag-color')).toBe('#6968b3');
  });

  it('uses first matching category color for multi-category skills', () => {
    const skill = {
      title: 'Python',
      prominence: 5,
      category: ['Languages', 'ML Engineering'],
    };

    render(<SkillTag data={skill} categories={mockCategories} />);

    const tag = document.querySelector('.skill-tag') as HTMLElement;
    // Should use Languages color since it's first in categories list
    expect(tag.style.getPropertyValue('--tag-color')).toBe('#6968b3');
  });
});
