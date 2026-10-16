'use client';

import * as React from 'react';
import Image from 'next/image';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Check, 
  Copy, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  RefreshCw, 
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import { 
  FaGoogle, 
  FaGithub, 
  FaApple, 
  FaMicrosoft 
} from 'react-icons/fa6';

type AuthMode = 'signin' | 'signup' | 'magiclink' | 'otp' | 'phone' | 'passkey';
type ThemePreset = 'emerald' | 'framer-blue' | 'obsidian' | 'cyber-lime' | 'violet';

export function QubeAuthInteractiveSandbox() {
  const [mode, setMode] = React.useState<AuthMode>('signin');
  const [theme, setTheme] = React.useState<ThemePreset>('emerald');
  const [isDarkCanvas, setIsDarkCanvas] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [otpDigits, setOtpDigits] = React.useState(['8', '4', '2', '', '', '']);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form states
  const [email, setEmail] = React.useState('founder@acme.inc');
  const [password, setPassword] = React.useState('••••••••••••');
  const [fullName, setFullName] = React.useState('Alex Vance');
  const [phoneNumber, setPhoneNumber] = React.useState('+1 (555) 382-9011');

  const themePresets: { id: ThemePreset; name: string; swatchClass: string }[] = [
    { id: 'emerald', name: 'Qubtic Emerald', swatchClass: 'qube-swatch-emerald' },
    { id: 'framer-blue', name: 'Framer Blue', swatchClass: 'qube-swatch-framer-blue' },
    { id: 'obsidian', name: 'Monochrome Obsidian', swatchClass: 'qube-swatch-obsidian' },
    { id: 'cyber-lime', name: 'Cyber Lime', swatchClass: 'qube-swatch-cyber-lime' },
    { id: 'violet', name: 'Electric Violet', swatchClass: 'qube-swatch-violet' },
  ];

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      if (mode === 'signin') {
        setStatusMessage('✓ Authenticated via Supabase PKCE: Session established!');
      } else if (mode === 'signup') {
        setStatusMessage('✓ Account created! Verification email dispatched via Supabase.');
      } else if (mode === 'magiclink') {
        setStatusMessage('✓ Magic link sent to inbox! Check your email to sign in.');
      } else if (mode === 'otp') {
        setStatusMessage('✓ 6-Digit OTP verified! Access token granted.');
      } else if (mode === 'phone') {
        setStatusMessage('✓ SMS OTP sent to ' + phoneNumber);
      } else if (mode === 'passkey') {
        setStatusMessage('✓ Biometric Passkey verified via Apple Touch ID / Windows Hello!');
      }
    }, 700);
  };

  const handleCopyComponentCode = () => {
    const code = `<AuthForm 
  preset="${theme}"
  supabaseUrl="https://xyzcompany.supabase.co"
  supabaseAnonKey="sb_publishable_..."
  allowPasswordless={true}
  allowPasskeys={true}
  providers={["google", "github", "apple", "microsoft"]}
  redirectTo="/dashboard"
/>`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="sandbox" className="qube-sandbox-section" data-theme={theme}>
      {/* Background accents */}
      <div className="qube-sandbox-glow-left" />
      <div className="qube-sandbox-glow-right" />

      <div className="qube-container">
        
        {/* Section Header */}
        <div className="qube-section-header">
          <span className="qube-badge">
            <Sparkles className="qube-icon-sm" />
            INTERACTIVE CANVAS STUDIO
          </span>
          <h2 className="qube-section-title">
            Test the Component <br className="qube-br-sm" />
            <span className="qube-highlight">Live in Your Browser</span>
          </h2>
          <p className="qube-section-subtitle">
            Switch authentication flows, toggle design presets, and test biometric passkeys. What you see here is the exact native React component that drops into Framer.
          </p>
        </div>

        {/* Sandbox Container */}
        <div className="qube-sandbox-grid">
          
          {/* Controls & Inspector Sidebar (Left Column) */}
          <div className="qube-sandbox-sidebar">
            
            {/* Mode Selector Card */}
            <div className="qube-sandbox-card-box">
              <div className="qube-sandbox-header-row">
                <span className="qube-sandbox-title-badge">
                  <SlidersHorizontal className="qube-icon-sm" />
                  Auth Method Switcher
                </span>
                <span className="qube-sandbox-chip">
                  Interactive
                </span>
              </div>

              <div className="qube-sandbox-methods-grid">
                {[
                  { id: 'signin', label: 'Sign In', icon: Lock },
                  { id: 'signup', label: 'Sign Up', icon: KeyRound },
                  { id: 'magiclink', label: 'Magic Link', icon: Mail },
                  { id: 'otp', label: '6-Digit OTP', icon: Sparkles },
                  { id: 'phone', label: 'SMS Phone', icon: Smartphone },
                  { id: 'passkey', label: 'Passkey / Face ID', icon: Fingerprint },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMode(item.id as AuthMode);
                        setStatusMessage(null);
                      }}
                      className={`qube-sandbox-method-btn ${isSelected ? 'active' : ''}`}
                    >
                      <Icon className="qube-icon-sm" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Design Tokens & Theme Preset Selector */}
            <div className="qube-sandbox-card-box">
              <div className="qube-sandbox-header-row">
                <span className="qube-sandbox-title-badge">
                  Designer Presets (8 Curated)
                </span>
                <button
                  type="button"
                  onClick={() => setIsDarkCanvas(!isDarkCanvas)}
                  className="qube-canvas-toggle-btn"
                >
                  {isDarkCanvas ? <Moon className="qube-icon-xs" /> : <Sun className="qube-icon-xs" />}
                  <span>{isDarkCanvas ? 'Dark Canvas' : 'Light Canvas'}</span>
                </button>
              </div>

              <div className="qube-theme-list">
                {themePresets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`qube-theme-option-btn ${theme === item.id ? 'active' : ''}`}
                  >
                    <div className="qube-theme-option-content">
                      <span className={`qube-theme-swatch ${item.swatchClass}`} />
                      <span>{item.name}</span>
                    </div>
                    {theme === item.id && (
                      <span className="qube-sandbox-chip">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Code Snippet */}
            <div className="qube-code-snippet-box">
              <div className="qube-code-header">
                <span>Framer Code Asset Snippet</span>
                <button
                  type="button"
                  onClick={handleCopyComponentCode}
                  className="qube-code-copy-btn"
                >
                  {copiedCode ? <Check className="qube-icon-xs" /> : <Copy className="qube-icon-xs" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="qube-code-pre">
{`<AuthForm 
  preset="${theme}"
  allowPasskeys={true}
  supabaseUrl="https://xyz.supabase.co"
  redirectTo="/dashboard"
/>`}
              </pre>
            </div>

          </div>

          {/* Canvas Component Preview (Right Column) */}
          <div className="qube-virtual-canvas-container">
            
            {/* Virtual Framer Canvas Frame */}
            <div 
              className="qube-virtual-canvas-window"
              data-canvas={isDarkCanvas ? 'dark' : 'light'}
            >
              
              {/* Canvas Header Pill */}
              <div className="qube-canvas-window-header">
                <div className="qube-window-dots">
                  <div className="qube-window-dot qube-dot-red" />
                  <div className="qube-window-dot qube-dot-yellow" />
                  <div className="qube-window-dot qube-dot-green" />
                  <span className="qube-window-title">
                    Framer Canvas · Qube-Auth.tsx
                  </span>
                </div>
                <div className="qube-window-status">
                  <ShieldCheck className="qube-icon-xs" />
                  <span>PKCE Active</span>
                </div>
              </div>

              {/* LIVE COMPONENT CARD */}
              <div 
                className="qube-sandbox-card"
                data-theme={theme}
              >
                
                {/* Brand Logo & Header inside Form */}
                <div className="qube-text-center">
                  <div 
                    className="qube-sandbox-logo-badge"
                    data-theme={theme}
                  >
                    <Image
                      src="/images/qube-auth/qube-auth-logo.png"
                      alt="Qube Auth"
                      width={32}
                      height={32}
                      className="qube-brand-img"
                    />
                  </div>
                  <h3 className="qube-sandbox-form-title">
                    {mode === 'signin' && 'Welcome Back'}
                    {mode === 'signup' && 'Create Your Account'}
                    {mode === 'magiclink' && 'Passwordless Sign In'}
                    {mode === 'otp' && 'Enter Verification Code'}
                    {mode === 'phone' && 'Mobile Phone Verification'}
                    {mode === 'passkey' && 'Biometric Passkey Sign In'}
                  </h3>
                  <p className="qube-sandbox-form-desc">
                    {mode === 'signin' && 'Enter your credentials to access your workspace'}
                    {mode === 'signup' && 'Sign up to unlock premium tools and resources'}
                    {mode === 'magiclink' && "We'll send an instant login link to your inbox"}
                    {mode === 'otp' && 'Enter the 6-digit code sent to your email'}
                    {mode === 'phone' && 'We will send a 6-digit SMS verification code'}
                    {mode === 'passkey' && 'One-tap secure login via Face ID, Touch ID, or Hello'}
                  </p>
                </div>

                {/* Form Fields based on Mode */}
                <form onSubmit={handleSimulateSubmit}>
                  
                  {mode === 'signup' && (
                    <div className="qube-form-field-group">
                      <label className="qube-form-field-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="qube-form-input"
                        placeholder="Alex Vance"
                      />
                    </div>
                  )}

                  {(mode === 'signin' || mode === 'signup' || mode === 'magiclink') && (
                    <div className="qube-form-field-group">
                      <label className="qube-form-field-label">
                        Work Email
                      </label>
                      <div className="qube-form-input-relative">
                        <Mail className="qube-form-input-icon" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="qube-form-input has-icon"
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {(mode === 'signin' || mode === 'signup') && (
                    <div className="qube-form-field-group">
                      <div className="qube-form-label-row">
                        <label className="qube-form-field-label">
                          Password
                        </label>
                        {mode === 'signin' && (
                          <button type="button" className="qube-form-label-link">
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="qube-form-input-relative">
                        <Lock className="qube-form-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="qube-form-input has-icon has-toggle"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="qube-form-input-toggle"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="qube-icon-xs" /> : <Eye className="qube-icon-xs" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'otp' && (
                    <div className="qube-form-field-group">
                      <label className="qube-form-field-label qube-text-center">
                        6-Digit Security Code
                      </label>
                      <div className="qube-otp-row">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const newDigits = [...otpDigits];
                              newDigits[idx] = e.target.value;
                              setOtpDigits(newDigits);
                            }}
                            className="qube-otp-input"
                          />
                        ))}
                      </div>
                      <p className="qube-text-center qube-sandbox-form-desc">
                        Didn&apos;t receive code?{' '}
                        <button type="button" className="qube-form-footer-btn">
                          Resend
                        </button>
                      </p>
                    </div>
                  )}

                  {mode === 'phone' && (
                    <div className="qube-form-field-group">
                      <label className="qube-form-field-label">
                        Phone Number
                      </label>
                      <div className="qube-form-input-relative">
                        <Smartphone className="qube-form-input-icon" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="qube-form-input has-icon"
                          placeholder="+1 (555) 000-0000"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'passkey' && (
                    <div className="qube-passkey-card">
                      <div className="qube-passkey-icon-circle">
                        <Fingerprint className="qube-icon-lg" />
                      </div>
                      <h4 className="qube-sandbox-form-title">Touch ID / Face ID Sensor Ready</h4>
                      <p className="qube-sandbox-form-desc">
                        Your device&apos;s cryptographic WebAuthn credentials will securely verify your account.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="qube-preview-submit-btn"
                  >
                    {isLoading ? (
                      <RefreshCw className="qube-icon-sm qube-spin" />
                    ) : (
                      <>
                        {mode === 'signin' && 'Sign In'}
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'magiclink' && 'Dispatch Magic Link'}
                        {mode === 'otp' && 'Verify 6-Digit Code'}
                        {mode === 'phone' && 'Send SMS Passcode'}
                        {mode === 'passkey' && 'Authenticate with Passkey'}
                        <ArrowRight className="qube-icon-xs" />
                      </>
                    )}
                  </button>

                  {/* Status Banner */}
                  {statusMessage && (
                    <div className="qube-status-banner">
                      {statusMessage}
                    </div>
                  )}

                  {/* Social Divider */}
                  {(mode === 'signin' || mode === 'signup') && (
                    <>
                      <div className="qube-social-divider-row">
                        <div className="qube-social-divider-line" />
                        <span className="qube-social-divider-text">Or continue with</span>
                      </div>

                      {/* Social OAuth Icons Grid */}
                      <div className="qube-social-grid">
                        <button type="button" className="qube-social-btn" title="Google" aria-label="Sign in with Google">
                          <FaGoogle className="qube-icon-sm" />
                        </button>
                        <button type="button" className="qube-social-btn" title="GitHub" aria-label="Sign in with GitHub">
                          <FaGithub className="qube-icon-sm" />
                        </button>
                        <button type="button" className="qube-social-btn" title="Apple" aria-label="Sign in with Apple">
                          <FaApple className="qube-icon-sm" />
                        </button>
                        <button type="button" className="qube-social-btn" title="Microsoft" aria-label="Sign in with Microsoft">
                          <FaMicrosoft className="qube-icon-sm" />
                        </button>
                      </div>
                    </>
                  )}

                </form>

                {/* Footer Switcher inside Form */}
                <div className="qube-form-footer">
                  {mode === 'signin' ? (
                    <span>
                      Don&apos;t have an account?{' '}
                      <button type="button" onClick={() => setMode('signup')} className="qube-form-footer-btn">
                        Sign up free
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{' '}
                      <button type="button" onClick={() => setMode('signin')} className="qube-form-footer-btn">
                        Sign in
                      </button>
                    </span>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
