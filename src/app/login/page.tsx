import type { Metadata } from 'next';
import { getCityConfig } from '@/lib/get-city';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const city = await getCityConfig();
  return (
    <div className="auth-page container">
      <div className="auth-card">
        <h1 className="auth-card__title">Sign in to {city.fullName}</h1>
        <LoginForm />
        <p className="auth-card__switch">
          Don&apos;t have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
}
