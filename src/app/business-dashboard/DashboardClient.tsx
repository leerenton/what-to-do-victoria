'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CityConfig, Business, Event, Promo, Inquiry, Promotion } from '@/lib/types';

interface Props {
  city: CityConfig;
  businesses: Business[];
  selectedBiz: Business;
  events: Event[];
  promos: Promo[];
  inquiries: Inquiry[];
  promotions: Promotion[];
}

type Tab = 'overview' | 'events' | 'promos' | 'inquiries' | 'promotions' | 'settings';

export default function DashboardClient({ city, businesses, selectedBiz, events, promos, inquiries, promotions }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const unreadCount = inquiries.filter(i => i.unread).length;

  return (
    <div className="dash-page">
      {/* Dash header */}
      <div className="dash-header">
        <div className="container dash-header__inner">
          <div className="dash-header__biz">
            <span className="dash-header__emoji">{selectedBiz.emoji ?? '🏪'}</span>
            <div>
              <p className="dash-header__name">{selectedBiz.name}</p>
              <p className="dash-header__plan">
                {selectedBiz.is_gold ? '⭐ Gold Member' : 'Free listing'}
                {!selectedBiz.is_gold && (
                  <Link href="/upgrade" className="dash-header__upgrade-link"> · Upgrade →</Link>
                )}
              </p>
            </div>
          </div>
          <Link href={selectedBiz.slug ? `/${selectedBiz.slug}` : `/listing?id=${selectedBiz.id}`} className="btn btn--ghost btn--sm" target="_blank">
            View Listing ↗
          </Link>
        </div>
      </div>

      <div className="container dash-body">
        {/* Tabs */}
        <div className="dash-tabs">
          {([
            { id: 'overview', label: 'Overview' },
            { id: 'events', label: `Events (${events.length})` },
            { id: 'promos', label: `Offers (${promos.length})` },
            { id: 'inquiries', label: `Enquiries${unreadCount > 0 ? ` (${unreadCount} new)` : ''}` },
            { id: 'promotions', label: 'Promotions' },
            { id: 'settings', label: 'Settings' },
          ] as { id: Tab; label: string }[]).map(t => (
            <button key={t.id} className={`dash-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="dash-section">
            <div className="dash-overview-grid">
              <div className="dash-stat">
                <span className="dash-stat__val">{events.length}</span>
                <span className="dash-stat__label">Events</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat__val">{inquiries.length}</span>
                <span className="dash-stat__label">Enquiries</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat__val">{promos.length}</span>
                <span className="dash-stat__label">Offers</span>
              </div>
              <div className="dash-stat">
                <span className="dash-stat__val">{selectedBiz.credit_balance ?? 0}</span>
                <span className="dash-stat__label">Credits</span>
              </div>
            </div>
            {!selectedBiz.is_gold && (
              <div className="dash-upgrade-cta">
                <h3>Upgrade to Gold</h3>
                <p>Get homepage placement, a live enquiry form, promoted events and a spot in the weekly email.</p>
                <Link href="/upgrade" className="btn btn--gold">Upgrade Now →</Link>
              </div>
            )}
          </div>
        )}

        {/* Events */}
        {tab === 'events' && (
          <div className="dash-section">
            <div className="dash-section__header">
              <h2>Your Events</h2>
              <Link href="/promote" className="btn btn--primary btn--sm">+ Add Event</Link>
            </div>
            {events.length === 0 ? (
              <p className="dash-empty">No events yet. Add your first event to get more visibility.</p>
            ) : (
              <div className="dash-list">
                {events.map(event => (
                  <div key={event.id} className="dash-list-item">
                    <div>
                      <p className="dash-list-item__title">{event.title}</p>
                      <p className="dash-list-item__meta">{event.date} {event.time ? `· ${event.time}` : ''} · {event.location}</p>
                    </div>
                    <div className="dash-list-item__badges">
                      {event.is_promoted && <span className="badge badge--promoted">Promoted</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Promos */}
        {tab === 'promos' && (
          <div className="dash-section">
            <div className="dash-section__header">
              <h2>Offers &amp; Promotions</h2>
            </div>
            {promos.length === 0 ? (
              <p className="dash-empty">No offers yet. Add a special deal to attract customers.</p>
            ) : (
              <div className="dash-list">
                {promos.map(promo => (
                  <div key={promo.id} className="dash-list-item">
                    <span>{promo.emoji ?? '🎁'}</span>
                    <div>
                      <p className="dash-list-item__title">{promo.title}</p>
                      {promo.expires && <p className="dash-list-item__meta">Expires {promo.expires}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inquiries */}
        {tab === 'inquiries' && (
          <div className="dash-section">
            <h2>Customer Enquiries</h2>
            {!selectedBiz.is_gold ? (
              <div className="dash-upgrade-cta">
                <p>Upgrade to Gold to receive direct customer enquiries on your listing.</p>
                <Link href="/upgrade" className="btn btn--gold">Upgrade to Gold</Link>
              </div>
            ) : inquiries.length === 0 ? (
              <p className="dash-empty">No enquiries yet.</p>
            ) : (
              <div className="dash-list">
                {inquiries.map(inq => (
                  <div key={inq.id} className={`dash-list-item ${inq.unread ? 'dash-list-item--unread' : ''}`}>
                    <div>
                      <p className="dash-list-item__title">{inq.name} {inq.unread && <span className="badge badge--new">New</span>}</p>
                      <p className="dash-list-item__meta">{inq.email} · {new Date(inq.created_at).toLocaleDateString()}</p>
                      <p className="dash-list-item__message">{inq.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Promotions */}
        {tab === 'promotions' && (
          <div className="dash-section">
            <div className="dash-section__header">
              <h2>Paid Promotions</h2>
              <Link href="/promote" className="btn btn--primary btn--sm">Buy Promotion</Link>
            </div>
            {promotions.length === 0 ? (
              <p className="dash-empty">No promotions yet. Boost your visibility with a paid promotion.</p>
            ) : (
              <div className="dash-list">
                {promotions.map(promo => (
                  <div key={promo.id} className="dash-list-item">
                    <div>
                      <p className="dash-list-item__title">{promo.package} · {promo.item_type}</p>
                      <p className="dash-list-item__meta">{promo.starts_at?.split('T')[0]} → {promo.ends_at?.split('T')[0]}</p>
                    </div>
                    <span className={`badge badge--${promo.status}`}>{promo.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="dash-section">
            <h2>Listing Settings</h2>
            <div className="dash-settings-grid">
              <div className="form-field">
                <label>Business name</label>
                <input type="text" defaultValue={selectedBiz.name} disabled />
              </div>
              <div className="form-field">
                <label>Website</label>
                <input type="url" defaultValue={selectedBiz.website ?? ''} disabled />
              </div>
            </div>
            <p className="dash-settings-note">To update your listing details, <a href="/contact">contact us</a>.</p>
            {selectedBiz.is_gold && (
              <div className="dash-stripe-portal">
                <p>Manage your Gold subscription billing:</p>
                <a href="/api/stripe-portal" className="btn btn--ghost">Manage Billing →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
