'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/account';

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}${next}` } });
    setLoading(false);
    if (error) setError(error.message);
    else setError('');
    alert('Check your email for a magic link!');
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="form-field">
        <label htmlFor="login-pass">Password</label>
        <input id="login-pass" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
      <button type="button" className="btn btn--ghost btn--full" onClick={handleMagicLink} disabled={loading}>
        Send magic link instead
      </button>
    </form>
  );
}
