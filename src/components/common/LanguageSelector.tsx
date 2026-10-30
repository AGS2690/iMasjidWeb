import React, { useState, useRef, useEffect } from 'react';
import { useLocale } from '../../hooks/useLocale';
import { SupportedLocale } from '../../types';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { locales, currentLocale, setLocale } = useLocale();
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
    if (img.src.endsWith('.png')) {
      img.src = img.src.replace(/\.png$/, '.svg');
    } else {
      img.src = '/assets/flags/BI.png';
    }
  };

  const handleSelect = (locale: SupportedLocale) => {
    setLocale(locale);
    setIsOpen(false);
  };

  // Only show active supported languages
  const activeLocales = locales.filter((l) => l.isActive);

  return (
    <div
      ref={containerRef}
      className={`imasjid-lang-selector ${className}`}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      {/* Active Flag Trigger Button (Matches screenshot exactly: clean flag with rounded corners) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
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
        <img
          src={getFlagSrc(currentLocale?.flagIconUrl || 'assets/flags/BI.png')}
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
      </button>

      {/* Clean Minimal Dropdown Menu (Matches screenshot) */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: isRtl ? 'auto' : 0,
            left: isRtl ? 0 : 'auto',
            width: '185px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '6px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            boxSizing: 'border-box',
            animation: 'fadeInScale 0.12s ease-out',
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          {activeLocales.map((locale) => {
            const isSelected = currentLocale?.id === locale.id;

            return (
              <button
                key={locale.id}
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
                  backgroundColor: isSelected ? 'rgba(0, 110, 140, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: isRtl ? 'right' : 'left',
                  transition: 'background-color 0.12s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected
                    ? 'rgba(0, 110, 140, 0.12)'
                    : '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isSelected
                    ? 'rgba(0, 110, 140, 0.08)'
                    : 'transparent';
                }}
              >
                {/* Flag */}
                <img
                  src={getFlagSrc(locale.flagIconUrl)}
                  alt={locale.countryName}
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

                {/* Language Name */}
                <span
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: isSelected ? 600 : 500,
                    color: '#1e293b',
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    lineHeight: 1.2,
                  }}
                >
                  {locale.languageName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
