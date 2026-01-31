import React, { useState, useCallback, memo } from 'react';
import styles from './ComponentName.module.css';

/**
 * Props interface for ComponentName component
 */
interface ComponentNameProps {
  /** Unique identifier */
  id?: string;
  /** Display title */
  title: string;
  /** Optional description */
  description?: string;
  /** Loading state */
  loading?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Click handler callback */
  onClick?: (id: string) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * ComponentName - [Brief description of component purpose]
 *
 * Features:
 * - Feature 1
 * - Feature 2
 * - WCAG 2.1 AA accessible
 * - Responsive design
 *
 * @example
 * ```tsx
 * <ComponentName
 *   title="Example"
 *   description="Description text"
 *   onClick={(id) => console.log(id)}
 * />
 * ```
 */
const ComponentName: React.FC<ComponentNameProps> = memo(({
  id = 'default-id',
  title,
  description,
  loading = false,
  error = null,
  onClick,
  className = ''
}) => {
  // Local state
  const [isHovered, setIsHovered] = useState(false);
  const [internalState, setInternalState] = useState<string>('');

  // Memoized handlers
  const handleClick = useCallback(() => {
    if (onClick && !loading) {
      onClick(id);
    }
  }, [id, loading, onClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Keyboard navigation support
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Render loading state
  if (loading) {
    return (
      <div
        className={`${styles.container} ${styles.loading} ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className={styles.spinner} aria-label="Loading..." />
        <span className={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className={`${styles.container} ${styles.error} ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  // Main render
  return (
    <div
      className={`${styles.container} ${isHovered ? styles.hovered : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title}${description ? `: ${description}` : ''}`}
      data-testid="component-name"
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </div>

      {description && (
        <div className={styles.body}>
          <p className={styles.description}>{description}</p>
        </div>
      )}

      <div className={styles.footer}>
        {/* Additional content */}
      </div>
    </div>
  );
});

ComponentName.displayName = 'ComponentName';

export default ComponentName;
export type { ComponentNameProps };
