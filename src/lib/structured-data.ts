import type { Business, Event, Article, CityConfig } from './types';

export function websiteSchema(city: CityConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: city.fullName,
    url: `https://${city.domain}`,
    description: `Your local guide to ${city.name} — discover events, restaurants, cafes, bars, hotels and things to do.`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://${city.domain}/events?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function localBusinessSchema(biz: Business, city: CityConfig) {
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    café: 'CafeOrCoffeeShop',
    bar: 'BarOrPub',
    hotel: 'LodgingBusiness',
    attraction: 'TouristAttraction',
    activity: 'SportsActivityLocation',
  };

  return {
    '@context': 'https://schema.org',
    '@type': typeMap[biz.type?.toLowerCase() ?? ''] ?? 'LocalBusiness',
    name: biz.name,
    description: biz.description ?? undefined,
    image: biz.img ?? undefined,
    url: biz.website ?? undefined,
    address: biz.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: biz.address,
          addressLocality: city.name,
          addressRegion: 'VIC',
          addressCountry: 'AU',
        }
      : undefined,
    geo:
      biz.lat && biz.lng
        ? { '@type': 'GeoCoordinates', latitude: biz.lat, longitude: biz.lng }
        : undefined,
    telephone: biz.phone ?? undefined,
    openingHours: biz.hours ?? undefined,
  };
}

export function eventSchema(event: Event, city: CityConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? undefined,
    image: event.img ?? undefined,
    url: event.url ?? `https://${city.domain}/events/${event.id}`,
    startDate: event.date ?? undefined,
    location: event.location
      ? {
          '@type': 'Place',
          name: event.location,
          address: {
            '@type': 'PostalAddress',
            addressLocality: city.name,
            addressRegion: 'VIC',
            addressCountry: 'AU',
          },
        }
      : undefined,
    offers: event.price
      ? {
          '@type': 'Offer',
          price: event.price === 'Free' ? '0' : undefined,
          priceCurrency: 'AUD',
          availability: 'https://schema.org/InStock',
          description: event.price,
        }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: city.fullName,
      url: `https://${city.domain}`,
    },
  };
}

export function articleSchema(article: Article, city: CityConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.hero_img ?? undefined,
    datePublished: article.published_at ?? article.created_at,
    author: article.author
      ? { '@type': 'Person', name: article.author }
      : { '@type': 'Organization', name: city.fullName },
    publisher: {
      '@type': 'Organization',
      name: city.fullName,
      url: `https://${city.domain}`,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListSchema(
  name: string,
  url: string,
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
