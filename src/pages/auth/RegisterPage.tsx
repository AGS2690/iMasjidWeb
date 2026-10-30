import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import { extractErrorMessage } from '../../api/client';
import {
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import loginLogo from '../../assets/masjid-images/iMasjid_Login.svg';
import maskGroupBg from '../../assets/masjid-images/Mask_Group.svg';
import gmailIcon from '../../assets/masjid-images/gmail_icon.png';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { IslamicArchFrame } from '../../components/auth/IslamicArchFrame';
import { useTranslation } from '../../hooks/useTranslation';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { success, error, info } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordRules = [
    { label: t('Auth.min8Chars', 'Minimal 8 karakter'), met: formData.password.length >= 8 },
    { label: t('Auth.uppercase', 'Satu huruf besar (A-Z)'), met: /[A-Z]/.test(formData.password) },
    { label: t('Auth.lowercase', 'Satu huruf kecil (a-z)'), met: /[a-z]/.test(formData.password) },
    { label: t('Auth.number', 'Satu angka digit (0-9)'), met: /[0-9]/.test(formData.password) },
  ];

  const passwordsMatch =
    Boolean(formData.password) &&
    Boolean(formData.confirmPassword) &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      error('Mohon isi nama depan dan nama belakang.');
      return;
    }

    if (!formData.userName.trim()) {
      error('Mohon tentukan username akun Anda.');
      return;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(formData.userName.trim())) {
      error('Username hanya boleh berisi huruf, angka, titik, atau garis bawah.');
      return;
    }

    if (!formData.email.trim()) {
      error('Mohon masukkan alamat email yang valid.');
      return;
    }

    const unmetRules = passwordRules.filter((r) => !r.met);
    if (unmetRules.length > 0) {
      error('Kata sandi belum memenuhi kriteria keamanan.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        userName: formData.userName.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const isOk = res.success ?? res.isSuccess ?? true;
      if (isOk) {
        setIsSuccess(true);
        success(res.message || 'Akun Anda berhasil didaftarkan!', 'Pendaftaran Berhasil');
        setTimeout(() => {
          navigate('/login', {
            state: { registeredUsername: formData.userName.trim().toLowerCase() },
          });
        }, 1500);
      } else {
        error(res.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
      }
    } catch (err: any) {
      error(extractErrorMessage(err), 'Gagal Mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="imasjid-auth-page" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Top right language selector */}
      <div className="imasjid-auth-lang-pos">
        <LanguageSelector />
      </div>

      {/* Main Split Card matching Login Page design */}
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
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '0.55rem' }}>
            <h1
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#092d36',
                marginBottom: '0.15rem',
                letterSpacing: '-0.01em',
              }}
            >
              {t('Auth.signupTitle', 'Daftar Akun Baru')}
            </h1>
            <p style={{ fontSize: '0.785rem', color: '#64748b', margin: 0 }}>
              {t('Auth.signupSubtitle', 'Lengkapi formulir di bawah ini untuk mendaftar di iMasjid')}
            </p>
          </div>

          {/* Gmail / Google Button */}
          <button
            type="button"
            onClick={() => info('Fitur integrasi Gmail / Google OAuth akan segera aktif di rilis berikutnya.', 'SignUp with Google')}
            title={t('Auth.signUpWithGoogle', 'Daftar dengan Akun Google')}
            aria-label={t('Auth.signUpWithGoogle', 'Daftar dengan Akun Google')}
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

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '0.15rem 0 0.5rem 0', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0, 110, 140, 0.12)' }} />
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('Auth.orDivider', 'Atau')}
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0, 110, 140, 0.12)' }} />
          </div>

          {isSuccess ? (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 110, 140, 0.08)',
                border: '1px solid rgba(0, 110, 140, 0.25)',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0, 110, 140, 0.1)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 110, 140, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.65rem',
                  color: '#006e8c',
                }}
              >
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#092d36', marginBottom: '0.35rem' }}>
                {t('Auth.signupSuccessTitle', 'Pendaftaran Berhasil!')}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                {t('Auth.signupSuccessDesc', 'Akun Anda telah terdaftar. Anda akan diarahkan ke halaman masuk secara otomatis...')}
              </p>
              <button
                type="button"
                onClick={() => navigate('/login', { state: { registeredUsername: formData.userName.trim().toLowerCase() } })}
                style={{
                  padding: '0.55rem 1.4rem',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #007696 0%, #005a72 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(0, 110, 140, 0.25)',
                }}
              >
                {t('Auth.loginHere', 'Masuk ke Akun Anda')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Row 1: Nama Depan & Belakang */}
              <div className="imasjid-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.45rem' }}>
                <div>
                  <label
                    htmlFor="firstName"
                    style={{
                      display: 'block',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.18rem',
                    }}
                  >
                    {t('Auth.firstName', 'Nama Depan*')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="e.g. Ahmad"
                      required
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                        borderRadius: '9px',
                        border: '1px solid rgba(0, 110, 140, 0.22)',
                        background: '#ffffff',
                        outline: 'none',
                        fontSize: '0.825rem',
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
                    <User size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    style={{
                      display: 'block',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.18rem',
                    }}
                  >
                    {t('Auth.lastName', 'Nama Belakang*')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Fauzi"
                      required
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                        borderRadius: '9px',
                        border: '1px solid rgba(0, 110, 140, 0.22)',
                        background: '#ffffff',
                        outline: 'none',
                        fontSize: '0.825rem',
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
                    <User size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                  </div>
                </div>
              </div>

              {/* Row 2: Username & Phone Number */}
              <div className="imasjid-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.45rem' }}>
                <div>
                  <label
                    htmlFor="userName"
                    style={{
                      display: 'block',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.18rem',
                    }}
                  >
                    {t('Auth.username', 'Username*')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="userName"
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      placeholder="e.g. ahmad.fauzi"
                      required
                      autoComplete="username"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                        borderRadius: '9px',
                        border: '1px solid rgba(0, 110, 140, 0.22)',
                        background: '#ffffff',
                        outline: 'none',
                        fontSize: '0.825rem',
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
                    <User size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    style={{
                      display: 'block',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.18rem',
                    }}
                  >
                    {t('Auth.phoneNumber', 'No. Telepon')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="phoneNumber"
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+62 812 3456 789"
                      autoComplete="tel"
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                        borderRadius: '9px',
                        border: '1px solid rgba(0, 110, 140, 0.22)',
                        background: '#ffffff',
                        outline: 'none',
                        fontSize: '0.825rem',
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
                    <Phone size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                  </div>
                </div>
              </div>

              {/* Row 3: Email */}
              <div style={{ marginBottom: '0.45rem' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '0.785rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.18rem',
                  }}
                >
                  {t('Auth.email', 'Alamat Email*')}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. ahmad.fauzi@domain.com"
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                      borderRadius: '9px',
                      border: '1px solid rgba(0, 110, 140, 0.22)',
                      background: '#ffffff',
                      outline: 'none',
                      fontSize: '0.825rem',
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
                  <Mail size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                </div>
              </div>

              {/* Row 4: Password & Confirm Password */}
              <div className="imasjid-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem', marginBottom: '0.45rem' }}>
                <div>
                  <label
                    htmlFor="password"
                    style={{
                      display: 'block',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.18rem',
                    }}
                  >
                    {t('Auth.passwordLabel', 'Kata Sandi*')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t('Auth.passwordPlaceholder', 'Masukkan kata sandi')}
                      required
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        padding: '0.45rem 2.3rem 0.45rem 2.1rem',
                        borderRadius: '9px',
                        border: '1px solid rgba(0, 110, 140, 0.22)',
                        background: '#ffffff',
                        outline: 'none',
                        fontSize: '0.825rem',
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
                    <Lock size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '7px',
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      display: 'block',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.18rem',
                    }}
                  >
                    {t('Auth.confirmPassword', 'Ulangi Kata Sandi*')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t('Auth.confirmPassword', 'Ulangi kata sandi')}
                      required
                      autoComplete="new-password"
                      style={{
                        width: '100%',
                        padding: '0.45rem 2.3rem 0.45rem 2.1rem',
                        borderRadius: '9px',
                        border: `1px solid ${
                          formData.confirmPassword && !passwordsMatch
                            ? '#ef4444'
                            : 'rgba(0, 110, 140, 0.22)'
                        }`,
                        background: '#ffffff',
                        outline: 'none',
                        fontSize: '0.825rem',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor =
                          formData.confirmPassword && !passwordsMatch ? '#ef4444' : '#006e8c';
                        e.target.style.boxShadow =
                          formData.confirmPassword && !passwordsMatch
                            ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
                            : '0 0 0 3px rgba(0, 110, 140, 0.12)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor =
                          formData.confirmPassword && !passwordsMatch
                            ? '#ef4444'
                            : 'rgba(0, 110, 140, 0.22)';
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.02)';
                      }}
                    />
                    <Lock size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '7px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title={showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Rules Checklist */}
              {formData.password && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.2rem 0.5rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    background: 'rgba(0, 110, 140, 0.04)',
                    border: '1px solid rgba(0, 110, 140, 0.12)',
                    fontSize: '0.7rem',
                    marginBottom: '0.45rem',
                  }}
                >
                  {passwordRules.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: rule.met ? '#007696' : '#94a3b8',
                        fontWeight: rule.met ? 600 : 400,
                      }}
                    >
                      {rule.met ? <CheckCircle2 size={12} color="#007696" /> : <AlertCircle size={12} />}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}

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
                  marginTop: '0.2rem',
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
                    <UserPlus size={16} />
                    <span>{t('Auth.registerButton', 'Daftar Akun iMasjid')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Links as per Login Page */}
          <div style={{ textAlign: 'center', marginTop: '0.55rem' }}>
            <Link
              to="/login"
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
              {t('Auth.alreadyHaveAccount', 'Sudah memiliki akun? Masuk ke Akun Anda')}
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
