'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { CityConfig } from '@/lib/types';

type Mode = 'choose' | 'claim' | 'create';
type Step = 1 | 2 | 3 | 4;

function slugify(str: string) {
  return str.toLowerCase().trim()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export default function BusinessSignupClient({ city, userId }: { city: CityConfig; userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = searchParams.get('claim');

  const [mode, setMode] = useState<Mode>(claimId ? 'claim' : 'choose');
  const [step, setStep] = useState<Step>(1);
  const [claimSearch, setClaimSearch] = useState('');
  const [claimResults, setClaimResults] = useState<any[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [section, setSection] = useState('eat');
  const [bizType, setBizType] = useState('');
  const [details, setDetails] = useState({ name: '', location: '', suburb: '', website: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  async function searchBusinesses(q: string) {
    setClaimSearch(q);
    if (!q || q.length < 2) { setClaimResults([]); return; }
    const { data } = await supabase
      .from('businesses')
      .select('id, name, type, suburb, emoji, color')
      .ilike('name', `%${q}%`)
      .eq('city', city.slug)
      .is('owner_id', null)
      .limit(10);
    setClaimResults(data ?? []);
  }

  async function handleClaim() {
    if (!selectedBiz) return;
    setLoading(true);
    const { error } = await supabase
      .from('businesses')
      .update({ owner_id: userId, claimed: true })
      .eq('id', selectedBiz.id);
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/onboarding?claimed=1');
  }

  async function handleCreate() {
    setLoading(true);
    setError('');
    const slug = slugify(details.name);
    const { error } = await supabase.from('businesses').insert({
      id: `${slug}-${city.slug}`,
      name: details.name,
      section,
      type: bizType,
      location: details.location,
      suburb: details.suburb,
      website: details.website || null,
      description: details.description || null,
      city: city.slug,
      owner_id: userId,
      claimed: true,
      plan: 'free',
      slug,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/onboarding');
  }

  const progress = mode === 'choose' ? 20
    : mode === 'claim' ? (step === 1 ? 40 : step === 2 ? 80 : 100)
    : (step === 1 ? 30 : step === 2 ? 60 : step === 3 ? 80 : 100);

  return (
    <div className="bsign-page container">
      <div className="bsign-card">
        <div className="bsign-progress">
          <div className="bsign-progress__bar" style={{ width: `${progress}%` }} />
        </div>

        {mode === 'choose' && (
          <div className="bsign-screen">
            <h1 className="bsign-title">List your business on {city.fullName}</h1>
            <p className="bsign-sub">Is your business already listed, or would you like to create a new listing?</p>
            <div className="bsign-choices">
              <button className="bsign-choice" onClick={() => { setMode('claim'); setStep(1); }}>
                <span className="bsign-choice__icon">🔍</span>
                <strong>Claim existing listing</strong>
                <span>Find and claim a listing we&apos;ve already created for your business.</span>
              </button>
              <button className="bsign-choice" onClick={() => { setMode('create'); setStep(1); }}>
                <span className="bsign-choice__icon">✨</span>
                <strong>Create new listing</strong>
                <span>Add a brand-new listing for your business.</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'claim' && step === 1 && (
          <div className="bsign-screen">
            <h2 className="bsign-title">Find your business</h2>
            <div className="form-field">
              <label>Search by name</label>
              <input type="text" value={claimSearch} onChange={e => searchBusinesses(e.target.value)} placeholder="e.g. The Terrace Café" />
            </div>
            <div className="bsign-results">
              {claimResults.map(biz => (
                <button
                  key={biz.id}
                  className={`bsign-result-item ${selectedBiz?.id === biz.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBiz(biz)}
                >
                  <span>{biz.emoji ?? '🏪'}</span>
                  <div>
                    <p className="bsign-result-item__name">{biz.name}</p>
                    <p className="bsign-result-item__type">{biz.type} · {biz.suburb}</p>
                  </div>
                </button>
              ))}
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div className="bsign-actions">
              <button className="btn btn--ghost" onClick={() => setMode('choose')}>Back</button>
              <button className="btn btn--primary" onClick={handleClaim} disabled={!selectedBiz || loading}>
                {loading ? 'Claiming…' : 'Claim This Listing →'}
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="bsign-screen">
            {step === 1 && (
              <>
                <h2 className="bsign-title">What type of business?</h2>
                <div className="bsign-section-choices">
                  {[
                    { value: 'eat', label: '🍽️ Eat', sub: 'Restaurant, café, bakery, takeaway' },
                    { value: 'drink', label: '🍺 Drink', sub: 'Bar, pub, brewery, wine bar' },
                    { value: 'do', label: '🎯 Do', sub: 'Attraction, activity, sport, arts' },
                    { value: 'stay', label: '🛏️ Stay', sub: 'Hotel, apartment, B&B' },
                  ].map(s => (
                    <button
                      key={s.value}
                      className={`bsign-choice ${section === s.value ? 'selected' : ''}`}
                      onClick={() => setSection(s.value)}
                    >
                      <strong>{s.label}</strong>
                      <span>{s.sub}</span>
                    </button>
                  ))}
                </div>
                <div className="bsign-actions">
                  <button className="btn btn--ghost" onClick={() => setMode('choose')}>Back</button>
                  <button className="btn btn--primary" onClick={() => setStep(2)}>Next →</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="bsign-title">Business details</h2>
                <div className="bsign-form">
                  <div className="form-field">
                    <label>Business name *</label>
                    <input type="text" value={details.name} onChange={e => setDetails(d => ({ ...d, name: e.target.value }))} required />
                  </div>
                  <div className="form-field">
                    <label>Type (e.g. Café, Bar, Gym)</label>
                    <input type="text" value={bizType} onChange={e => setBizType(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label>Suburb</label>
                    <input type="text" value={details.suburb} onChange={e => setDetails(d => ({ ...d, suburb: e.target.value }))} />
                  </div>
                  <div className="form-field">
                    <label>Website</label>
                    <input type="url" value={details.website} onChange={e => setDetails(d => ({ ...d, website: e.target.value }))} placeholder="https://" />
                  </div>
                  <div className="form-field">
                    <label>Short description</label>
                    <textarea rows={3} value={details.description} onChange={e => setDetails(d => ({ ...d, description: e.target.value }))} />
                  </div>
                </div>
                {error && <p className="auth-error">{error}</p>}
                <div className="bsign-actions">
                  <button className="btn btn--ghost" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn--primary" onClick={handleCreate} disabled={!details.name || loading}>
                    {loading ? 'Creating…' : 'Create Listing →'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
