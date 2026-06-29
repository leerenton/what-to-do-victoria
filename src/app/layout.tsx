import type { Metadata } from 'next';
import './globals.css';
import { getCityConfig } from '@/lib/get-city';
import SiteShell from '@/components/SiteShell';
import Footer from '@/components/Footer';

export async function generateMetadata(): Promise<Metadata> {
  const city = await getCityConfig();
  return {
    metadataBase: new URL(`https://${city.domain}`),
    title: {
      default: `${city.fullName} — Events, Restaurants & Things To Do in ${city.name}`,
      template: `%s | ${city.fullName}`,
    },
    description: `Your local guide to ${city.name} — discover events, restaurants, cafes, bars, hotels and things to do.`,
    openGraph: {
      type: 'website',
      locale: 'en_AU',
      url: `https://${city.domain}`,
      siteName: city.fullName,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const city = await getCityConfig();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,500,0,0&display=swap" rel="stylesheet" />
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-M8CX39H7');`,
          }}
        />
      </head>
      <body className="bg-stone-50 font-sans antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M8CX39H7"
            height="0" width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <SiteShell city={city}>
          {children}
        </SiteShell>
        <Footer city={city} />
      </body>
    </html>
  );
}
