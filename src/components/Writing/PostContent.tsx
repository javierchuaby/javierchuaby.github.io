'use client';

import Markdown from 'markdown-to-jsx';
import ExportedImage from 'next-image-export-optimizer';

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <Markdown
      options={{
        overrides: {
          img: {
            component: ({ alt, src }: { alt?: string; src?: string }) => {
              if (!src) {
                return null;
              }

              return (
                <ExportedImage
                  src={src}
                  alt={alt || ''}
                  width={1200}
                  height={630}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'auto',
                  }}
                />
              );
            },
          },
        },
      }}
    >
      {content}
    </Markdown>
  );
}
