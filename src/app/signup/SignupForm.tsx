'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm({ citySlug }: { citySlug: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });

    if (error) { setError(error.message); setLoading(false); return; }

    // Auto-subscribe to current city's digest
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, city: citySlug }),
      });
    } catch {}

    router.push('/account?welcome=1');
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="su-name">Name</label>
        <input id="su-name" type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
      </div>
      <div className="form-field">
        <label htmlFor="su-email">Email</label>
        <input id="su-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="form-field">
        <label htmlFor="su-pass">Password</label>
        <input id="su-pass" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={6} />
      </div>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
