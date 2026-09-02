import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, ShieldCheck, Eye, EyeOff, Sun, Moon } from 'lucide-react';

const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      return 'light';
    }
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    return 'dark';
  });

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        if (!email.trim()) {
          throw new Error('Please enter your email or username.');
        }
        await login(email.trim(), password);
      } else {
        if (!username.trim()) {
          throw new Error('Please choose a username.');
        }
        if (!email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        await register(username.trim(), email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 bg-slate-900/60 border border-slate-800 hover:border-text-primary text-text-primary hover:text-white transition-smooth flex items-center justify-center cursor-pointer shadow-md rounded-xl"
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-glow-primary p-0.5 mb-4">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Terminal className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            PatternForge
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            DSA pattern recognition and approach preparation.
          </p>
        </div>

        {/* Auth Glass Box */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl">
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-smooth ${
                isLogin ? 'border-b-2 border-primary text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-smooth ${
                !isLogin ? 'border-b-2 border-primary text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-950/40 border border-red-500/30 p-3 text-xs text-red-300 text-center animate-pulse">
                {error}
              </div>
            )}

            {isLogin ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address or Username
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com or username"
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="choose a username"
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full glass-input rounded-lg pl-4 pr-10 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-smooth"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-sm font-semibold text-white shadow-glow-primary transition-smooth flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                isLogin ? 'Get Started' : 'Create Account'
              )}
            </button>
          </form>

          {/* Micro Information */}
          <div className="flex items-center justify-center space-x-2 mt-6 text-[11px] text-slate-500 font-sans">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure stateless JWT Authentication enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
