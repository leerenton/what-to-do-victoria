import Link from 'next/link';
import type { CityConfig } from '@/lib/types';

export default function Footer({ city }: { city: CityConfig }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__name">{city.fullName}</span>
          <p className="footer__tagline">Your local guide to {city.name}.</p>
        </div>
        <div className="footer__cols">
          <div className="footer__col">
            <p className="footer__col-title">Explore</p>
            <Link href="/eat">Eat</Link>
            <Link href="/drink">Drink</Link>
            <Link href="/do">Do</Link>
            <Link href="/stay">Stay</Link>
            <Link href="/events">Events</Link>
            <Link href="/guides">Guides</Link>
            <Link href="/parks">Parks</Link>
            <Link href="/date-night">Date Night</Link>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">Businesses</p>
            <Link href="/business-signup">List Your Business</Link>
            <Link href="/promote">Promote</Link>
            <Link href="/upgrade">Gold Membership</Link>
            <Link href="/advertise">Advertise</Link>
          </div>
          <div className="footer__col">
            <p className="footer__col-title">About</p>
            <Link href="/contact">Contact</Link>
            <Link href="/support">Support</Link>
            <Link href="/advertise">Advertise With Us</Link>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <span>© {year} {city.fullName}</span>
          <span className="footer__bottom-sep">·</span>
          <Link href="/support">Privacy</Link>
          <span className="footer__bottom-sep">·</span>
          <Link href="/support">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
