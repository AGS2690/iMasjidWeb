import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/client';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  Send,
  LogIn,
  KeyRound,
} from 'lucide-react';

import loginLogo from '../../assets/masjid-images/iMasjid_Login.svg';
import maskGroupBg from '../../assets/masjid-images/Mask_Group.svg';
import gmailIcon from '../../assets/masjid-images/gmail_icon.png';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { IslamicArchFrame } from '../../components/auth/IslamicArchFrame';
import { useTranslation } from '../../hooks/useTranslation';

type LoginMode = 'password' | 'otp';
type LoginStep = 'credentials' | 'otp_verify';

export const LoginPage: React.FC = () => {
  const [loginMode, setLoginMode] = useState<LoginMode>('password');
  const [step, setStep] = useState<LoginStep>('credentials');

  const { login } = useAuth();
  const { success, error, info } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Credentials
  const [userNameOrEmail, setUserNameOrEmail] = useState<string>(
    () => (location.state as { registeredUsername?: string } | null)?.registeredUsername || ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'Login' | 'TwoFactor'>('Login');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleCompleteTokenLogin = async (tokenData: any) => {
    const loginResult = await login(tokenData);
    if (loginResult.success) {
      if (!loginResult.hasRoles) {
        navigate('/forbidden');
      } else {
        success('Selamat datang kembali di iMasjid Connect!', 'Autentikasi Berhasil');
        navigate('/dashboard');
      }
    } else {
      error(loginResult.message || 'Gagal memuat profil pengguna.');
    }
  };

  // 1. Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = userNameOrEmail.trim();
    if (!identifier || !password) {
      error('Silakan masukkan email/username dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ userNameOrEmail: identifier, password });
      const isOk = res.success ?? res.isSuccess;

      if (isOk && res.data) {
        if (res.data.requiresTwoFactor) {
          setOtpPurpose('TwoFactor');
          setMaskedEmail(res.data.maskedEmail || identifier);
          setStep('otp_verify');
          setResendCooldown(60);
          info(
            `Two-Factor Authentication aktif. Kode OTP telah dikirimkan ke ${res.data.maskedEmail || 'email Anda'}.`,
            'Verifikasi 2FA'
          );
        } else {
          await handleCompleteTokenLogin(res.data);
        }
      } else {
        error(res.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Login Gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Direct OTP Request
  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = userNameOrEmail.trim();
    if (!identifier) {
      error('Silakan masukkan email atau username yang terdaftar.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp({
        userNameOrEmail: identifier,
        purpose: 'Login',
      });

      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        setOtpPurpose('Login');
        setMaskedEmail(res.data.maskedEmail || identifier);
        setStep('otp_verify');
        setResendCooldown(60);
        success(
          `Kode OTP telah dikirim ke ${res.data.maskedEmail || 'email Anda'}.`,
          'OTP Terkirim'
        );
      } else {
        error(res.message || 'Gagal mengirim kode verifikasi OTP.');
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Pengiriman OTP Gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.trim();
    if (!code || code.length !== 6) {
      error('Silakan masukkan 6 digit kode OTP verifikasi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp({
        userNameOrEmail: userNameOrEmail.trim(),
        otp: code,
        purpose: otpPurpose,
      });

      const isOk = res.success ?? res.isSuccess;
      if (isOk && res.data) {
        await handleCompleteTokenLogin(res.data);
      } else {
        error(res.message || 'Kode OTP tidak valid atau telah kedaluwarsa.');
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Verifikasi Gagal');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await authApi.sendOtp({
        userNameOrEmail: userNameOrEmail.trim(),
        purpose: otpPurpose,
      });

      const isOk = res.success ?? res.isSuccess;
      if (isOk) {
        setResendCooldown(60);
        success('Kode OTP verifikasi baru telah dikirimkan ke email Anda.', 'OTP Dikirim Ulang');
      } else {
        error(res.message || 'Gagal mengirim ulang kode.');
      }
    } catch (err) {
      error(extractErrorMessage(err), 'Gagal Kirim Ulang');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="imasjid-auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Top right language selector */}
      <div className="imasjid-auth-lang-pos">
        <LanguageSelector />
      </div>

      {/* Main Split Card matching screenshot */}
      <div className="imasjid-auth-card" style={{ position: 'relative', zIndex: 2 }}>
        {/* LEFT COLUMN: Sample B Ornamental Islamic Archway Motif */}
        <div className="imasjid-auth-left">
          {/* Ornamental Islamic Archway Frame with Corner Arabesques & Halo */}
          <IslamicArchFrame />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Golden 3D Dome Emblem + iMasjid CONNECT Logo */}
            <img
              src={loginLogo}
              alt="iMasjid Connect"
              className="imasjid-auth-logo"
            />

            {/* Welcome Heading */}
            <h2 className="imasjid-auth-heading">
              {t('Auth.welcomeTitle', 'Selamat Datang')}
            </h2>

            {/* Description Text */}
            <p className="imasjid-auth-desc">
              {t('Auth.welcomeSubtitle', 'Sebuah aplikasi perangkat lunak yang dirancang untuk membantu pengurus masjid dalam mengelola berbagai tugas yang berkaitan dengan pengelolaan masjid, seperti mengelola keanggotaan, sedekah, acara, dan komunikasi dengan jamaah')}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean White Form Area */}
        <div className="imasjid-auth-right">
          {step === 'credentials' ? (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '0.65rem' }}>
                <h1
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#092d36',
                    marginBottom: '0.15rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {t('Auth.loginTitle', 'Masuk ke Akun Anda')}
                </h1>
                <p style={{ fontSize: '0.785rem', color: '#64748b', margin: 0 }}>
                  {t('Auth.loginSubtitle', 'Masuk dengan Gmail Id Anda')}
                </p>
              </div>

              {/* Gmail / Google Button */}
              <button
                type="button"
                onClick={() => info('Fitur integrasi Gmail / Google OAuth akan segera aktif di rilis berikutnya.', 'SignIn with Google')}
                title={t('Auth.signInWithGoogle', 'Masuk dengan Akun Google')}
                aria-label={t('Auth.signInWithGoogle', 'Masuk dengan Akun Google')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.38rem 1.15rem',
                  borderRadius: '9px',
                  border: '1px solid rgba(0, 110, 140, 0.18)',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  margin: '0 auto 0.45rem auto',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = 'rgba(0, 110, 140, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 110, 140, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = 'rgba(0, 110, 140, 0.18)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
                }}
              >
                <img
                  src={gmailIcon}
                  alt="Gmail"
                  style={{
                    width: '18px',
                    height: '18px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                <span>{t('Auth.gmailButton', 'Gmail')}</span>
              </button>

              {/* Mode Switcher Tabs */}
              <div
                style={{
                  display: 'flex',
                  borderRadius: '9px',
                  background: 'rgba(0, 110, 140, 0.06)',
                  border: '1px solid rgba(0, 110, 140, 0.12)',
                  padding: '3px',
                  marginBottom: '0.65rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setLoginMode('password')}
                  style={{
                    flex: 1,
                    padding: '0.35rem',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    borderRadius: '7px',
                    border: 'none',
                    background: loginMode === 'password' ? '#ffffff' : 'transparent',
                    color: loginMode === 'password' ? '#006e8c' : '#64748b',
                    boxShadow: loginMode === 'password' ? '0 2px 6px rgba(0, 110, 140, 0.12)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t('Auth.tabPassword', 'Kata Sandi (Password)')}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('otp')}
                  style={{
                    flex: 1,
                    padding: '0.35rem',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    borderRadius: '7px',
                    border: 'none',
                    background: loginMode === 'otp' ? '#ffffff' : 'transparent',
                    color: loginMode === 'otp' ? '#006e8c' : '#64748b',
                    boxShadow: loginMode === 'otp' ? '0 2px 6px rgba(0, 110, 140, 0.12)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t('Auth.tabOtp', 'Kode OTP Email')}
                </button>
              </div>

              {/* TAB 1: PASSWORD LOGIN FORM */}
              {loginMode === 'password' && (
                <form onSubmit={handlePasswordSubmit}>
                  {/* Email / Username Input */}
                  <div style={{ marginBottom: '0.55rem' }}>
                    <label
                      htmlFor="userNameOrEmail"
                      style={{
                        display: 'block',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {t('Auth.usernameOrEmailLabel', 'Masukan Email atau Username yang terdaftar di iMasjid*')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="userNameOrEmail"
                        type="text"
                        value={userNameOrEmail}
                        onChange={(e) => setUserNameOrEmail(e.target.value)}
                        placeholder={t('Auth.usernameOrEmailPlaceholder', 'e.g. admin atau user@domain.com')}
                        required
                        autoComplete="username"
                        style={{
                          width: '100%',
                          padding: '0.5rem 1rem 0.5rem 2.2rem',
                          borderRadius: '9px',
                          border: '1px solid rgba(0, 110, 140, 0.22)',
                          background: '#ffffff',
                          outline: 'none',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          boxSizing: 'border-box',
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#006e8c';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 110, 140, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(0, 110, 140, 0.22)';
                          e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.02)';
                        }}
                      />
                      <Mail size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: 'block',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {t('Auth.passwordLabel', 'Kata Sandi*')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('Auth.passwordPlaceholder', 'Masukkan kata sandi Anda')}
                        required
                        autoComplete="current-password"
                        style={{
                          width: '100%',
                          padding: '0.5rem 2.4rem 0.5rem 2.2rem',
                          borderRadius: '9px',
                          border: '1px solid rgba(0, 110, 140, 0.22)',
                          background: '#ffffff',
                          outline: 'none',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          boxSizing: 'border-box',
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#006e8c';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 110, 140, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(0, 110, 140, 0.22)';
                          e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.02)';
                        }}
                      />
                      <Lock size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '8px',
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '0.62rem 1rem',
                      borderRadius: '9px',
                      background: 'linear-gradient(135deg, #007696 0%, #005a72 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 110, 140, 0.3)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #006580 0%, #004c60 100%)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 110, 140, 0.42)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #007696 0%, #005a72 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 110, 140, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {isLoading ? (
                      <RefreshCw size={16} className="spin" />
                    ) : (
                      <>
                        <LogIn size={16} />
                        <span>{t('Auth.loginButton', 'Masuk ke Akun Anda')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: DIRECT OTP EMAIL FORM (AS PER SCREENSHOT 1) */}
              {loginMode === 'otp' && (
                <form onSubmit={handleRequestOtpSubmit}>
                  {/* Email Input with note */}
                  <div style={{ marginBottom: '0.65rem' }}>
                    <label
                      htmlFor="emailOtpInput"
                      style={{
                        display: 'block',
                        fontSize: '0.785rem',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {t('Auth.emailOtpLabel', 'Masukan Email yang terdaftar di iMasjid*')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="emailOtpInput"
                        type="text"
                        value={userNameOrEmail}
                        onChange={(e) => setUserNameOrEmail(e.target.value)}
                        placeholder={t('Auth.emailOtpPlaceholder', 'contoh@domain.com atau username')}
                        required
                        autoComplete="email"
                        style={{
                          width: '100%',
                          padding: '0.5rem 1rem 0.5rem 2.2rem',
                          borderRadius: '9px',
                          border: '1px solid rgba(0, 110, 140, 0.22)',
                          background: '#ffffff',
                          outline: 'none',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          boxSizing: 'border-box',
                          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#006e8c';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0, 110, 140, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(0, 110, 140, 0.22)';
                          e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.02)';
                        }}
                      />
                      <Mail size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                    </div>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.35, margin: '0.25rem 0 0 0' }}>
                      {t('Auth.emailOtpNote', 'Kode verifikasi akan dikirimkan ke Email Anda yang terdaftar di iMasjid')}
                    </p>
                  </div>

                  {/* Primary Teal Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '0.62rem 1rem',
                      borderRadius: '9px',
                      background: 'linear-gradient(135deg, #007696 0%, #005a72 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 110, 140, 0.3)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #006580 0%, #004c60 100%)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 110, 140, 0.42)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #007696 0%, #005a72 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 110, 140, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {isLoading ? (
                      <RefreshCw size={16} className="spin" />
                    ) : (
                      <>
                        <Send size={15} />
                        <span>{t('Auth.sendOtpButton', 'Kirim kode verifikasi ke Email')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Links as per Screenshot 1 */}
              <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
                <Link
                  to="/signup"
                  style={{
                    color: '#006e8c',
                    fontWeight: 600,
                    fontSize: '0.785rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                    marginBottom: '0.35rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {t('Auth.registerOtherEmail', 'Daftar iMasjid Menggunakan Email selain Gmail')}
                </Link>

                {/* Privacy & Terms Note */}
                <p style={{ fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.35, margin: '0 0 0.3rem 0' }}>
                  {t('Auth.termsNotice', 'Dengan memberikan alamat Email saya, saya dengan ini menyetujui dan menerima')}{' '}
                  <span style={{ color: '#006e8c', fontWeight: 600, cursor: 'pointer' }}>{t('Auth.termsOfService', 'Syarat Penggunaan')}</span> {t('Auth.and', 'dan')}{' '}
                  <span style={{ color: '#006e8c', fontWeight: 600, cursor: 'pointer' }}>{t('Auth.privacyPolicy', 'Kebijakan Pribadi')}</span>
                </p>

                {/* Copyright */}
                <p style={{ fontSize: '0.68rem', color: '#94a3b8', margin: 0 }}>
                  ©{new Date().getFullYear()}. iMasjid Connect. {t('LeftMenu.allRightsReserved', 'All Rights Reserved.')}
                </p>
              </div>
            </>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleVerifyOtpSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '0.85rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(0, 110, 140, 0.1)',
                    color: '#006e8c',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.45rem',
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#092d36', marginBottom: '0.15rem' }}>
                  {t('Auth.otpVerifyTitle', 'Verifikasi Kode OTP')}
                </h2>
                <p style={{ fontSize: '0.785rem', color: '#64748b', margin: 0 }}>
                  {t('Auth.otpSentTo', 'Kode 6-digit telah dikirimkan ke:')}{' '}
                  <strong style={{ color: '#0f172a' }}>{maskedEmail}</strong>
                </p>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label
                  htmlFor="otpCodeInput"
                  style={{ display: 'block', fontSize: '0.785rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem', textAlign: 'center' }}
                >
                  {t('Auth.enterOtp', 'Masukkan 6 Digit Kode OTP')}
                </label>
                <input
                  id="otpCodeInput"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    textAlign: 'center',
                    fontSize: '1.35rem',
                    letterSpacing: '0.35rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: '2px solid #006e8c',
                    outline: 'none',
                    color: '#092d36',
                    boxSizing: 'border-box',
                    background: '#f8fafc',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.62rem 1rem',
                  borderRadius: '8px',
                  background: '#006e8c',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 3px 12px rgba(0, 110, 140, 0.25)',
                }}
              >
                {isLoading ? <RefreshCw size={16} className="spin" /> : t('Auth.verifyOtpButton', 'Verifikasi & Masuk')}
              </button>

              <div
                style={{
                  marginTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.785rem',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '0.65rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    fontSize: '0.825rem',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={14} /> {t('Auth.back', 'Kembali')}
                </button>

                {resendCooldown > 0 ? (
                  <span style={{ color: '#94a3b8' }}>
                    {t('Auth.resendCooldown', 'Kirim ulang dalam')} <strong style={{ color: '#006e8c' }}>{resendCooldown}d</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#006e8c',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      padding: 0,
                    }}
                  >
                    <RefreshCw size={13} className={isResending ? 'spin' : ''} /> {t('Auth.resendOtp', 'Kirim Ulang Kode')}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Mosque Silhouette Background (Up to 30% of screen from bottom) */}
      <div
        className="imasjid-auth-footer-bg"
        style={{
          backgroundImage: `url(${maskGroupBg})`,
        }}
      />
    </div>
  );
};
