import React from 'react';
import splashBg from '../../assets/masjid-images/iMasjid_Splash.svg';
import loginLogo from '../../assets/masjid-images/iMasjid_Login.svg';
import { useTranslation } from '../../hooks/useTranslation';

interface PageLoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  fullScreen = true,
  message,
}) => {
  const { t } = useTranslation();
  const displayMessage = message || t('PageLoader.loading', 'Loading iMasjid Connect...');

  return (
    <div
      style={{
        position: fullScreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: fullScreen ? '100vw' : '100%',
        height: fullScreen ? '100vh' : 'auto',
        minHeight: fullScreen ? '100vh' : '360px',
        backgroundColor: '#173f53',
        backgroundImage: `url(${splashBg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: fullScreen ? 99999 : 1,
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Dark radial backdrop overlay for rich depth & contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(0, 110, 140, 0.7) 0%, rgba(23, 63, 83, 0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Brand & Loading Card */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.75rem',
          padding: '2rem',
          maxWidth: '380px',
          textAlign: 'center',
          animation: 'imasjidFadeInUp 0.4s ease-out',
        }}
      >
        {/* Pulsing Mosque Brand Logo */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Subtle glowing halo behind logo */}
          <div
            style={{
              position: 'absolute',
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 110, 140, 0.5) 0%, transparent 70%)',
              filter: 'blur(16px)',
              animation: 'imasjidPulseGlow 2.4s ease-in-out infinite',
            }}
          />

          <img
            src={loginLogo}
            alt="iMasjid Connect"
            style={{
              height: '110px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 24px rgba(0, 0, 0, 0.45))',
              position: 'relative',
            }}
          />
        </div>

        {/* Sleek Animated Gradient Progress Line */}
        <div
          style={{
            width: '190px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '50%',
              background: 'linear-gradient(90deg, transparent, #006e8c, #3ca2c3, transparent)',
              borderRadius: '999px',
              animation: 'imasjidProgressSlide 1.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Status Message */}
        <span
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {displayMessage}
        </span>
      </div>

      {/* Elegant Bottom Footer Watermark */}
      {fullScreen && (
        <div
          style={{
            position: 'absolute',
            bottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.2rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          <span style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
            {t('PageLoader.version', 'iMasjid Connect V2.1.0')}
          </span>
          <span>©{new Date().getFullYear()}. {t('PageLoader.allRightsReserved', 'Hak Cipta Dilindungi.')}</span>
        </div>
      )}

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes imasjidFadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes imasjidPulseGlow {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
          }
        }
        @keyframes imasjidProgressSlide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
};
