import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  const city = await getCityConfig();
  return (
    <div className="auth-page container">
      <div className="auth-card">
        <h1 className="auth-card__title">Join {city.fullName}</h1>
        <p className="auth-card__sub">Get weekly updates on events and things to do in {city.name}.</p>
        <SignupForm citySlug={city.slug} />
        <p className="auth-card__switch">
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </div>
    </div>
  );
}
