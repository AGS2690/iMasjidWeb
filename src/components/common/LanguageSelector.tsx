import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '../../hooks/useLocale';
import { SupportedLocale } from '../../types';
import { Globe, Loader2 } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { locales, currentLocale, setLocale, isLoading, refreshLocales } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRtl = currentLocale?.direction?.toUpperCase() === 'RTL' || document.documentElement.dir === 'rtl';

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getFlagSrc = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return path;
    return `/${path}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = 'true';
    if (img.src.endsWith('.png')) {
      img.src = img.src.replace(/\.png$/, '.svg');
    } else if (img.src.endsWith('.svg')) {
      img.src = img.src.replace(/\.svg$/, '.png');
    }
  };

  const handleSelect = (locale: SupportedLocale) => {
    setLocale(locale);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen && locales.length === 0) {
      refreshLocales().catch(() => {});
    }
    setIsOpen((prev) => !prev);
  };

  // Only show active supported languages dynamically from DB
  const activeLocales = locales.filter((l) => l.isActive ?? true);

  return (
    <div
      ref={containerRef}
      className={`imasjid-lang-selector ${className}`}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      {/* Active Flag Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={currentLocale?.languageName || 'Select Language'}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          transition: 'transform 0.15s ease, opacity 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.opacity = '1';
        }}
      >
        {currentLocale?.flagIconUrl ? (
          <img
            src={getFlagSrc(currentLocale.flagIconUrl)}
            alt={currentLocale?.languageName || 'Language'}
            style={{
              width: '28px',
              height: '20px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid rgba(0, 0, 0, 0.14)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
              display: 'block',
            }}
            onError={handleImageError}
          />
        ) : (
          <div
            style={{
              width: '28px',
              height: '20px',
              borderRadius: '4px',
              border: '1px solid var(--border-color, rgba(0, 0, 0, 0.14))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-input, rgba(0, 0, 0, 0.05))',
              color: 'var(--text-secondary, #64748b)',
            }}
          >
            <Globe size={14} />
          </div>
        )}
      </button>

      {/* Clean Themed Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: isRtl ? 'auto' : 0,
            left: isRtl ? 0 : 'auto',
            minWidth: '185px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '10px',
            padding: '6px',
            border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
            boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.15))',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxSizing: 'border-box',
            animation: 'fadeInScale 0.12s ease-out',
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          {isLoading && activeLocales.length === 0 ? (
            <div
              style={{
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--text-muted, #64748b)',
                fontSize: '0.85rem',
              }}
            >
              <Loader2 size={16} className="animate-spin" />
              <span>Loading...</span>
            </div>
          ) : activeLocales.length === 0 ? (
            <div
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                color: 'var(--text-muted, #64748b)',
                fontSize: '0.85rem',
              }}
            >
              No languages available
            </div>
          ) : (
            activeLocales.map((locale) => {
              const isSelected =
                currentLocale?.id === locale.id ||
                Boolean(
                  currentLocale?.cultureCode &&
                    locale.cultureCode &&
                    currentLocale.cultureCode.toLowerCase() === locale.cultureCode.toLowerCase()
                );

              return (
                <button
                  key={locale.id || locale.cultureCode}
                  type="button"
                  onClick={() => handleSelect(locale)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 10px',
                    width: '100%',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'rgba(0, 110, 140, 0.14)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: isRtl ? 'right' : 'left',
                    transition: 'background-color 0.12s ease',
                    boxSizing: 'border-box',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? 'rgba(0, 110, 140, 0.2)'
                      : 'rgba(0, 110, 140, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? 'rgba(0, 110, 140, 0.14)'
                      : 'transparent';
                  }}
                >
                  {/* Flag */}
                  {locale.flagIconUrl ? (
                    <img
                      src={getFlagSrc(locale.flagIconUrl)}
                      alt={locale.countryName || locale.languageName}
                      style={{
                        width: '26px',
                        height: '18px',
                        objectFit: 'cover',
                        borderRadius: '3px',
                        border: '1px solid rgba(0, 0, 0, 0.14)',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                        flexShrink: 0,
                      }}
                      onError={handleImageError}
                    />
                  ) : (
                    <Globe size={18} style={{ color: 'var(--text-muted, #64748b)', flexShrink: 0 }} />
                  )}

                  {/* Language Name */}
                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: isSelected ? 600 : 500,
                      color: 'var(--text-primary, #1e293b)',
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      lineHeight: 1.2,
                      flex: 1,
                    }}
                  >
                    {locale.languageName}
                  </span>

                  {/* Selection Indicator Dot */}
                  {isSelected && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#006e8c',
                        flexShrink: 0,
                        marginLeft: isRtl ? 0 : '4px',
                        marginRight: isRtl ? '4px' : 0,
                      }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
