import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCityConfig } from '@/lib/get-city';
import { createClient } from '@/lib/supabase/server';
import { JsonLd, articleSchema, breadcrumbSchema } from '@/lib/structured-data';
import type { Article } from '@/lib/types';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await getCityConfig();
  const supabase = createClient();
  const { data: article } = await supabase.from('articles').select('title, excerpt, hero_img').eq('id', params.id).single();
  if (!article) return { title: 'Guide not found' };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { images: article.hero_img ? [{ url: article.hero_img }] : [] },
    alternates: { canonical: `https://${city.domain}/guides/${params.id}` },
  };
}

export default async function GuidePage({ params }: Props) {
  const city = await getCityConfig();
  const supabase = createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .eq('approved', true)
    .single();

  if (!article) notFound();
  const a = article as Article;

  return (
    <>
      <JsonLd data={articleSchema(a, city)} />
      <JsonLd data={breadcrumbSchema([
        { name: city.fullName, url: `https://${city.domain}` },
        { name: 'Guides', url: `https://${city.domain}/guides` },
        { name: a.title, url: `https://${city.domain}/guides/${a.id}` },
      ])} />

      {a.hero_img && (
        <div className="listing-hero">
          <Image src={a.hero_img} alt={a.title} fill priority sizes="100vw" className="listing-hero__img" />
        </div>
      )}

      <div className="article-body container">
        <div className="article-main">
          {a.type && <span className="article-type">{a.type}</span>}
          <h1 className="article-title">{a.title}</h1>
          {a.excerpt && <p className="article-excerpt">{a.excerpt}</p>}
          <div className="article-meta">
            {a.author && <span>By {a.author}</span>}
            {a.published_at && <span> · {a.published_at}</span>}
          </div>
          {a.content && (
            <div className="article-content" dangerouslySetInnerHTML={{ __html: a.content }} />
          )}
        </div>
      </div>
    </>
  );
}
