import React from 'react';
import './UnifiedTextBlock.css';

interface UnifiedTextBlockProps {
  text: string;
  /**
   * Optional: Apply emphasis to the first paragraph if it matches certain patterns
   * Used for question-style paragraphs like "What happened" or "Что произошло"
   */
  emphasizeFirstIfQuestion?: boolean;
  /**
   * Optional: Apply numbered list styling (First, Second, Во-первых, etc.).
   * Set to false for plain story text (e.g. ending screen) to match intro/narrative blocks.
   */
  useNumberedStyle?: boolean;
  /**
   * Optional: Custom class name to add to the container
   */
  className?: string;
}

/**
 * UnifiedTextBlock - A consistent component for rendering all JSON-driven text content
 * 
 * This component ensures consistent formatting across:
 * - Intro screens
 * - Round narratives
 * - Phase content
 * - Final screens
 * - All other JSON text blocks
 */
export const UnifiedTextBlock: React.FC<UnifiedTextBlockProps> = ({
  text,
  emphasizeFirstIfQuestion = false,
  useNumberedStyle = true,
  className = ''
}) => {
  // Split text by double newlines to create paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');

  return (
    <div className={`json-text-block ${className}`.trim()}>
      {paragraphs.map((paragraph, index) => {
        // Apply emphasis to first paragraph if it's a question pattern
        const isEmphasized = emphasizeFirstIfQuestion && index === 0 && (
          paragraph.startsWith('What happened') || 
          paragraph.startsWith('Where do') ||
          paragraph.startsWith('Что произошло') ||
          paragraph.startsWith('Где') ||
          paragraph.startsWith('Why') ||
          paragraph.startsWith('Почему')
        );

        // Check if this is a numbered item (only when useNumberedStyle is enabled)
        const isNumberedItem = useNumberedStyle && /^(First|Second|Third|Fourth|Fifth|Во-первых|Во-вторых|В-третьих|В-четвёртых|В-пятых)/.test(paragraph);

        return (
          <p 
            key={index} 
            className={`json-text-block-paragraph ${
              isEmphasized ? 'json-text-block-emphasis' : ''
            } ${
              isNumberedItem ? 'json-text-block-numbered' : ''
            }`.trim()}
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
};



