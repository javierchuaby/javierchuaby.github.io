import Link from 'next/link';

import ContactIcons from '@/components/Contact/ContactIcons';
import work from '@/data/resume/work';
import { getCurrentPosition } from '@/lib/positions';

import ThemePortrait from './ThemePortrait';

export default function Footer() {
  const currentPosition = getCurrentPosition(work);
  const currentRole = currentPosition
    ? `${currentPosition.position} at ${currentPosition.name}`
    : 'Computer Science student at NUS';

  return (
    <footer className="site-footer-new">
      <div className="footer-content">
        <div className="footer-identity">
          <Link href="/" className="footer-avatar">
            <ThemePortrait width={80} height={80} />
          </Link>
          <div className="footer-info">
            <p className="footer-name">Javier Chua</p>
            <p className="footer-role">{currentRole}</p>
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} ·{' '}
              <a
                href="https://github.com/javierchuaby/javierchuaby.github.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source
              </a>
            </p>
          </div>
        </div>

        <div className="footer-right">
          <nav className="footer-links" aria-labelledby="footer-links-heading">
            <p id="footer-links-heading" className="footer-links-label">
              Explore
            </p>
            <div className="footer-links-grid">
              <Link href="/about">About</Link>
              <Link href="/resume">Resume</Link>
              <Link href="/projects">Projects</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
          </nav>

          <div
            className="footer-social"
            aria-labelledby="footer-social-heading"
          >
            <p id="footer-social-heading" className="footer-social-label">
              Connect
            </p>
            <ContactIcons />
          </div>
        </div>
      </div>
    </footer>
  );
}
