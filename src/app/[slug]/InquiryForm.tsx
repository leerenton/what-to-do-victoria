'use client';

import { useState } from 'react';

export default function InquiryForm({ businessId, businessName }: { businessId: string; businessName: string }) {
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
        body: JSON.stringify({ businessId, name, email, message }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p className="inquiry-success">✅ Message sent! {businessName} will be in touch.</p>;
  }

  return (
    <form className="inquiry-form" onSubmit={handleSubmit}>
      <div className="inquiry-form__row">
        <div className="form-field">
          <label htmlFor="inq-name">Name</label>
          <input id="inq-name" type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="inq-email">Email</label>
          <input id="inq-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="inq-msg">Message</label>
        <textarea id="inq-msg" rows={4} value={message} onChange={e => setMessage(e.target.value)} required />
      </div>
      {status === 'error' && <p className="inquiry-error">Something went wrong. Please try again.</p>}
      <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
