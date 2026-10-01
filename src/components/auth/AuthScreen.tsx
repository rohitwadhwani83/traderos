import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateCaptcha, validateCaptcha, CaptchaChallenge } from '../../utils/captcha';
import { OtpService } from '../../services/otpService';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';

type AuthTab = 'login' | 'register' | 'forgot_password';

export const AuthScreen: React.FC = () => {
  const { login, register, resetPassword, loginWithDemo } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('register');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Captcha State
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');

  // Mobile OTP Verification State
  const [isOtpStepActive, setIsOtpStepActive] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Status & Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refresh captcha
  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  };

  // Timer countdown for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle Tab Switch
  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOtpStepActive(false);
    refreshCaptcha();
  };

  // Trigger Send OTP for Registration or Password Reset
  const handleInitiateOtp = () => {
    setErrorMessage(null);

    // Validate inputs
    if (activeTab === 'register') {
      if (!name.trim()) return setErrorMessage('Full Name is required.');
      if (!email.trim() || !email.includes('@')) return setErrorMessage('Valid email address is required.');
      if (!mobileNumber.trim() || mobileNumber.replace(/[^0-9]/g, '').length < 10) {
        return setErrorMessage('Valid 10-digit mobile number is required for OTP verification.');
      }
      if (!password || password.length < 6) {
        return setErrorMessage('Password must be at least 6 characters long.');
      }
      if (password !== confirmPassword) {
        return setErrorMessage('Passwords do not match.');
      }
    } else if (activeTab === 'forgot_password') {
      if (!email.trim() && !mobileNumber.trim()) {
        return setErrorMessage('Enter your registered email or mobile number.');
      }
      if (!password || password.length < 6) {
        return setErrorMessage('New password must be at least 6 characters long.');
      }
      if (password !== confirmPassword) {
        return setErrorMessage('Passwords do not match.');
      }
    }

    // Validate CAPTCHA
    if (!validateCaptcha(captcha, captchaInput)) {
      refreshCaptcha();
      return setErrorMessage('Human verification (CAPTCHA) failed. Please try again.');
    }

    // Dispatch OTP
    const phoneToUse = mobileNumber || '9876543210';
    const otpResult = OtpService.sendOtp(phoneToUse);

    if (!otpResult.success) {
      return setErrorMessage(otpResult.message);
    }

    setIsOtpStepActive(true);
    setResendTimer(30);
    setOtpNotification(`[SMS Sent] Your verification OTP is: ${otpResult.previewCode}`);
  };

  // Handle Final Submission after OTP verification
  const handleVerifyOtpAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const phoneToUse = mobileNumber || '9876543210';
    const verification = OtpService.verifyOtp(phoneToUse, enteredOtp);

    if (!verification.isValid) {
      return setErrorMessage(verification.message);
    }

    setIsProcessing(true);

    if (activeTab === 'register') {
      const res = await register({
        name,
        email,
        mobileNumber,
        password,
      });

      setIsProcessing(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } else if (activeTab === 'forgot_password') {
      const identifier = email || mobileNumber;
      const res = await resetPassword(identifier, password);
      setIsProcessing(false);

      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => switchTab('login'), 2000);
      } else {
        setErrorMessage(res.message);
      }
    }
  };

  // Handle Direct Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      return setErrorMessage('Please enter your email or mobile number.');
    }
    if (!validateCaptcha(captcha, captchaInput)) {
      refreshCaptcha();
      return setErrorMessage('Human verification (CAPTCHA) failed. Please try again.');
    }

    setIsProcessing(true);
    const res = await login(email, password);
    setIsProcessing(false);

    if (!res.success) {
      refreshCaptcha();
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TraderOS Intelligence Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-indigo-500 inline-block shadow-lg shadow-indigo-500/50" />
          TraderOS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
          AI-Powered Trading Journal & Market Analysis for Retail Traders
        </p>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-[#0f1422] border border-slate-800/90 rounded-2xl shadow-2xl p-6 sm:p-7 relative z-10 backdrop-blur-xl">
        {/* Navigation Tabs (Register / Login / Forgot Password) */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#090d16] border border-slate-800 rounded-xl text-xs font-semibold mb-5">
          <button
            type="button"
            onClick={() => switchTab('register')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => switchTab('login')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Global Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/25 border border-rose-500/35 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/35 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Demo SMS OTP Banner */}
        {otpNotification && isOtpStepActive && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-300 flex items-start gap-2">
            <Phone className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <span className="font-semibold block">{otpNotification}</span>
              <span className="text-[11px] text-slate-400">
                (Enter this 6-digit code below to verify your phone number)
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: LOGIN FLOW */}
        {/* ========================================================================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. rohit@gmail.com or 9876543210"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => switchTab('forgot_password')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Human Verification CAPTCHA */}
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Human Verification</span>
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  title="New Challenge"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#161d2c] border border-slate-700 text-xs font-mono font-bold text-indigo-300 tracking-wider">
                  {captcha.question}
                </div>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 bg-[#161d2c] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{isProcessing ? 'Authenticating...' : 'Sign In to TraderOS'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REGISTER FLOW (WITH MANDATORY MOBILE OTP & CAPTCHA) */}
        {/* ========================================================================= */}
        {activeTab === 'register' && !isOtpStepActive && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Rohit Wadhwani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mobile Number (Mandatory OTP Verification)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm</label>
                <input
                  type="password"
                  placeholder="Repeat"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Human Verification CAPTCHA */}
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Human Verification</span>
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#161d2c] border border-slate-700 text-xs font-mono font-bold text-indigo-300">
                  {captcha.question}
                </div>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 bg-[#161d2c] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleInitiateOtp}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Verify Mobile Number via OTP →</span>
            </button>
          </div>
        )}

        {/* OTP Input Form Step (Registration or Forgot Password) */}
        {isOtpStepActive && (
          <form onSubmit={handleVerifyOtpAndProceed} className="space-y-4 animate-fadeIn">
            <div className="text-center p-3 rounded-xl bg-[#090d16] border border-slate-800">
              <p className="text-xs text-slate-300 font-semibold mb-0.5">
                Verify Mobile Number
              </p>
              <p className="text-[11px] text-slate-400">
                Enter the 6-digit verification code sent to{' '}
                <span className="text-white font-mono">{mobileNumber || email}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 text-center">
                6-Digit Verification Code (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-widest text-lg font-mono font-bold bg-[#161d2c] border border-indigo-500/50 rounded-xl py-2.5 text-white focus:outline-none focus:border-indigo-400"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setIsOtpStepActive(false)}
                className="text-slate-400 hover:text-white"
              >
                ← Change Details
              </button>

              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={handleInitiateOtp}
                className="text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isProcessing || enteredOtp.length < 6}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isProcessing ? 'Verifying...' : 'Verify OTP & Complete Registration'}</span>
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FORGOT PASSWORD FLOW */}
        {/* ========================================================================= */}
        {activeTab === 'forgot_password' && !isOtpStepActive && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-300">
              Enter your registered mobile or email to receive a password reset verification code.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Registered Email or Mobile Number
              </label>
              <input
                type="text"
                placeholder="name@domain.com or 9876543210"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm</label>
                <input
                  type="password"
                  placeholder="Repeat"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Human Verification</span>
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#161d2c] border border-slate-700 text-xs font-mono font-bold text-indigo-300">
                  {captcha.question}
                </div>
                <input
                  type="text"
                  placeholder="Answer"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="flex-1 bg-[#161d2c] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleInitiateOtp}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Send Password Reset OTP →
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DEMO BYPASS / TESTING SHORTCUT */}
        {/* ========================================================================= */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={loginWithDemo}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Account (~50 Pre-loaded Trades)</span>
          </button>
        </div>
      </div>

      {/* Footer Educational & Free Tier Assurance */}
      <div className="text-center text-[11px] text-slate-500 mt-6 max-w-md z-10 leading-relaxed">
        <p>
          TraderOS is a 100% free educational & analytical journaling platform.
          No credit card, token charges, or paid subscriptions required.
        </p>
      </div>
    </div>
  );
};
