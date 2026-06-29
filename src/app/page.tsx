import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What To Do Victoria — Coming Soon",
  description:
    "A new local guide to Victoria is on its way — events, restaurants, bars, stays and things to do across Geelong, Ballarat, Bendigo and beyond.",
  robots: { index: false, follow: false },
};

export default function HoldingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-stone-50">
      {/* Structured data — tells Google/AI what this site is */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "What To Do Victoria",
            url: "https://whattodovictoria.com.au",
            description:
              "Your local guide to events, restaurants, bars and things to do across Victoria.",
            potentialAction: {
              "@type": "SearchAction",
              target:
                "https://whattodovictoria.com.au/events?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <div className="max-w-lg text-center">
        <h1 className="font-display font-black text-4xl sm:text-5xl text-stone-900 mb-4 leading-tight">
          Something exciting<br />is coming to Victoria.
        </h1>

        <p className="text-stone-500 text-lg mb-8 leading-relaxed">
          A brand-new local guide covering events, food, bars, stays and things
          to do across Geelong, Ballarat, Bendigo and beyond.
        </p>

        <div className="inline-flex items-center gap-2 bg-[#48c7d4]/10 text-[#48c7d4] font-semibold px-5 py-2.5 rounded-full text-sm">
          <span className="w-2 h-2 rounded-full bg-[#48c7d4] animate-pulse" />
          Coming soon
        </div>
      </div>

      <p className="mt-16 text-stone-400 text-sm">
        © {new Date().getFullYear()} What To Do Victoria
      </p>
    </main>
  );
}
