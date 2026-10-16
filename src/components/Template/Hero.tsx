import Link from 'next/link';
import work from '@/data/resume/work';
import { getCurrentPosition } from '@/lib/positions';

import ThemePortrait from './ThemePortrait';

export default function Hero() {
  const currentPosition = getCurrentPosition(work);
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-avatar">
          <ThemePortrait width={160} height={160} priority />
        </div>

        <h1 className="hero-title">
          <span className="hero-name">Javier Chua</span>
        </h1>

        <p className="hero-tagline">
          Computer Science student at the National University of Singapore (NUS)
          {currentPosition
            ? ` and ${currentPosition.position} at ${currentPosition.name}.`
            : '.'}
        </p>

        <div className="hero-chips">
          <span className="hero-chip">NUS Computer Science</span>
          <span className="hero-chip">Backend</span>
          <span className="hero-chip">Infrastructure</span>
          <span className="hero-chip">Network</span>
        </div>

        <div className="hero-cta">
          <Link href="/about" className="button button-primary">
            About Me
          </Link>
          <Link href="/resume" className="button button-secondary">
            View Resume
          </Link>
        </div>
      </div>

      <div className="hero-bg" aria-hidden="true">
        <div className="hero-gradient" />
      </div>
    </section>
  );
}
