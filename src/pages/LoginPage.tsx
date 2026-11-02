import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Phone, User, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const LoginPage: React.FC = () => {
  const { unifiedLogin, customerRegister, currentUser, isAdmin } = useAuth();
  const { showToast } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register Form State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Target redirect path (if redirected from checkout or cart)
  const redirectPath = (location.state as any)?.from || null;

  // Auto redirect if already signed in
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else if (currentUser) {
      navigate(redirectPath || '/account', { replace: true });
    }
  }, [isAdmin, currentUser, navigate, redirectPath]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Please enter your email/phone and password.', 'error');
      return;
    }

    setLoading(true);
    const result = await unifiedLogin(identifier.trim(), password);
    setLoading(false);

    if (result.success) {
      if (result.role === 'OWNER_ADMIN') {
        showToast('Welcome to Owner Admin Center!', 'success');
        navigate('/admin');
      } else {
        showToast('Signed in successfully! Welcome back.', 'success');
        navigate(redirectPath || '/account');
      }
    } else {
      showToast(result.error || 'Invalid credentials. Please verify and try again.', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !regPhone.trim() || !regPassword) {
      showToast('Please fill in all required registration fields.', 'error');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    if (regPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    setLoading(true);
    const result = await customerRegister({
      name: fullName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || undefined,
      password: regPassword,
      password_confirm: regPasswordConfirm,
    });
    setLoading(false);

    if (result.success) {
      showToast('Customer account created successfully! Signing you in...', 'success');
      // Automatically log in
      const loginRes = await unifiedLogin(regPhone.trim(), regPassword);
      if (loginRes.success) {
        navigate(redirectPath || '/account');
      } else {
        setMode('login');
        setIdentifier(regPhone.trim());
      }
    } else {
      showToast(result.error || 'Registration failed. Please verify your phone or email.', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '3.5rem 1.5rem 6rem 1.5rem', minHeight: '85vh' }}>
      <div className="container-narrow" style={{ maxWidth: '460px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            <BrandLogo size="lg" showWordmark={true} wordmarkDirection="column" withContainerBorder={true} />
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '1rem', lineHeight: 1.5 }}>
            {mode === 'login'
              ? 'Sign in to access your orders, saved designs, and account settings.'
              : 'Join our bakery family to easily track orders and receive artisan rewards.'}
          </p>
        </div>

        {/* Mode Selector (Sign In vs Sign Up) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.35rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-full)',
          marginBottom: '1.75rem'
        }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'login' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              backgroundColor: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
              color: mode === 'register' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Card Container */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.25rem 2rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {mode === 'login' ? (
            /* UNIFIED LOGIN FORM (NO ROLE SELECTOR) */
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Email or Phone Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter phone or email address"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    autoComplete="username"
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
                    Password *
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast('To reset your password, please contact FRESH CAKE by PROVA support via WhatsApp.', 'info');
                    }}
                    style={{ fontSize: '0.78rem', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    autoComplete="current-password"
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '4px'
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  height: '48px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                {!loading && <ArrowRight size={17} />}
              </button>

              <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* CUSTOMER REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anika Rahman"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Phone Number (Active for Delivery) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. 01308516242"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Email Address (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Create Password * (min. 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '4px'
                    }}
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Confirm Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="Confirm your password"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  height: '48px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
                {!loading && <CheckCircle2 size={17} />}
              </button>

              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
