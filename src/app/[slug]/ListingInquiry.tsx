'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  businessId: string;
  businessName: string;
  businessSlug: string | null;
  website: string | null;
  isClaimed: boolean;
  isGold: boolean;
  isOwner: boolean;
}

export default function ListingInquiry({ businessId, businessName, businessSlug, website, isClaimed, isGold, isOwner }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          business_name: businessName,
          business_slug: businessSlug,
          sender_name: name,
          sender_email: email,
          message,
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  // Unclaimed: blurred ghost form + claim overlay
  if (!isClaimed) {
    return (
      <div className="listing-inq-card listing-inq-card--locked">
        <h3 className="listing-inq-title">
          <span className="material-symbols-rounded">mail</span> Send an enquiry
        </h3>
        <p className="listing-inq-sub">Ask {businessName} a question — they&apos;ll get back to you directly.</p>
        <div className="listing-inq-form" style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
          <div className="listing-inq-row">
            <input type="text" className="ob-input" placeholder="Your name" readOnly />
            <input type="email" className="ob-input" placeholder="Your email" readOnly />
          </div>
          <textarea className="ob-input" rows={3} placeholder="Your message…" style={{ resize: 'vertical' }} readOnly />
          <button className="btn btn--teal" type="button">Send enquiry</button>
        </div>
        <div className="inq-claim-overlay">
          <span className="inq-claim-icon">🏪</span>
          <p className="inq-claim-title">Is this your business?</p>
          <p className="inq-claim-sub">Claim your listing to start receiving customer enquiries and unlock Gold features.</p>
          <Link href={`/business-signup?claim=${encodeURIComponent(businessSlug ?? businessId)}`} className="btn btn--teal inq-claim-btn">
            Claim &amp; activate →
          </Link>
        </div>
      </div>
    );
  }

  // Owner + free: Gold upsell
  if (isOwner && !isGold) {
    return (
      <div className="listing-inq-card listing-inq-card--gold-gate">
        <div className="inq-gold-gate">
          <span className="inq-gold-icon">⭐</span>
          <p className="inq-gold-title">Unlock your enquiry form</p>
          <p className="inq-gold-sub">
            Your listing has no way for customers to contact you directly. Gold members get a live enquiry form,
            homepage rotation, promoted events and more.
          </p>
          <div className="inq-gold-features">
            <span><span className="material-symbols-rounded">mail</span> Enquiry form live on your listing</span>
            <span><span className="material-symbols-rounded">home</span> Rotated on the homepage</span>
            <span><span className="material-symbols-rounded">campaign</span> 3 promoted events per year</span>
            <span><span className="material-symbols-rounded">email</span> Featured in weekly email</span>
          </div>
          <Link href={`/upgrade?biz=${encodeURIComponent(businessSlug ?? businessId)}`} className="btn btn--gold">
            Upgrade to Gold — $249/yr →
          </Link>
          <p className="inq-gold-note">
            or <Link href={`/upgrade?biz=${encodeURIComponent(businessSlug ?? businessId)}&plan=monthly`} style={{ color: 'var(--teal)' }}>$25/month</Link>
          </p>
        </div>
      </div>
    );
  }

  // Gold listing: live enquiry form (visitors + owner both see it)
  if (isGold) {
    if (status === 'sent') {
      return (
        <div className="listing-inq-card">
          <p style={{ color: 'var(--teal)', fontWeight: 700 }}>✓ Enquiry sent! {businessName} will be in touch.</p>
        </div>
      );
    }
    return (
      <div className="listing-inq-card">
        {isOwner && (
          <div style={{ marginBottom: '.75rem', padding: '.5rem .75rem', background: '#f0fdf4', borderRadius: '.5rem', fontSize: '.8rem', color: '#166534', border: '1px solid #bbf7d0' }}>
            ⭐ <strong>Your enquiry form is live.</strong> This is how customers will see it.{' '}
            <Link href="/business-dashboard" style={{ color: '#166534' }}>View enquiries →</Link>
          </div>
        )}
        <h3 className="listing-inq-title">
          <span className="material-symbols-rounded">mail</span> Send an enquiry
        </h3>
        <p className="listing-inq-sub">Ask {businessName} a question — they&apos;ll get back to you directly.</p>
        <form className="listing-inq-form" onSubmit={handleSubmit}>
          <div className="listing-inq-row">
            <input type="text" className="ob-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            <input type="email" className="ob-input" placeholder="Your email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <textarea className="ob-input" rows={3} placeholder="Your message…" style={{ resize: 'vertical' }} required value={message} onChange={e => setMessage(e.target.value)} />
          {status === 'error' && <p style={{ color: 'red', fontSize: '.85rem' }}>Something went wrong. Please try again.</p>}
          <button type="submit" className="btn btn--teal" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send enquiry'}
          </button>
        </form>
      </div>
    );
  }

  // Visitor + free + website: website link only
  if (website) {
    return (
      <div className="listing-inq-card listing-inq-card--website">
        <span className="material-symbols-rounded" style={{ fontSize: '1.8rem', color: 'var(--teal)' }}>language</span>
        <p className="listing-inq-sub" style={{ margin: '.4rem 0 1rem' }}>
          Visit the {businessName} website for bookings and enquiries.
        </p>
        <a
          href={website.startsWith('http') ? website : `https://${website}`}
          target="_blank" rel="noopener noreferrer"
          className="btn btn--outline"
        >
          Visit website →
        </a>
      </div>
    );
  }

  return null;
}
