import ExportedImage from 'next-image-export-optimizer';

interface ThemePortraitProps {
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

/**
 * Portrait image component.
 *
 * Uses ExportedImage instead of next/image to:
 * - Optimize images for static export using next-image-export-optimizer
 */
export default function ThemePortrait({
  width,
  height,
  priority = false,
  className = '',
}: ThemePortraitProps) {
  return (
    <span className={`theme-portrait ${className}`}>
      <ExportedImage
        src="/images/me-2.png"
        alt="Javier Chua"
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
      />
    </span>
  );
}
