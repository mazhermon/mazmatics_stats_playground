import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — Mazmatics',
  description: 'Mazmatics is a NZ project helping kids and the adults who care about them build a positive relationship with maths.',
};

function GradientHeading({ children, as: Tag = 'h2' }: { children: React.ReactNode; as?: 'h1' | 'h2' }) {
  return (
    <Tag
      className={Tag === 'h1' ? 'text-5xl md:text-6xl font-bold tracking-tight' : 'text-3xl md:text-4xl font-bold'}
      style={{
        background: 'linear-gradient(to left, #BA90FF, #47A5F1)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </Tag>
  );
}

function SectionContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`py-20 md:py-24 px-6 ${className}`}>
      <div className="max-w-4xl mx-auto">{children}</div>
    </section>
  );
}

// Inline SVG icons (no lucide-react dependency)
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-slate-950 min-h-screen">

      {/* Back nav */}
      <div className="px-6 pt-8 max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          All explorers
        </Link>
      </div>

      {/* Hero */}
      <section
        className="py-24 md:py-32 px-6 relative overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(rgba(186,144,255,0.07) 1px, transparent 1px), linear-gradient(to right, rgba(186,144,255,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <GradientHeading as="h1">About Mazmatics</GradientHeading>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl">
            Helping New Zealand kids — and the adults who care about them — say &ldquo;I like maths.&rdquo;
          </p>

          {/* Decorative diagonal stripe blocks */}
          <div className="flex items-center gap-4 pt-4" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="about-stripe-block"
                style={{ animationDelay: `${i * 0.8}s` }}
              >
                <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
                  {[-20, 0, 20, 40, 60].map((x) => (
                    <line
                      key={x}
                      x1={x}
                      y1="40"
                      x2={x + 40}
                      y2="0"
                      stroke="#BA90FF"
                      strokeWidth="2"
                      strokeOpacity="0.2"
                    />
                  ))}
                </svg>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .about-stripe-block {
            display: inline-block;
          }
          @media (prefers-reduced-motion: no-preference) {
            .about-stripe-block {
              animation: stripeDrift 8s ease-in-out infinite alternate;
            }
          }
          @keyframes stripeDrift {
            from { transform: translateX(0px); opacity: 0.7; }
            to   { transform: translateX(8px);  opacity: 1; }
          }
        `}</style>
      </section>

      {/* Stat callout row */}
      <SectionContainer className="pt-0 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Based in', value: 'Wellington, NZ' },
            { label: 'Parent of', value: 'Two kids' },
            { label: 'Background', value: 'Web developer' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800/50 rounded-xl p-6"
              style={{ borderLeft: '4px solid #BA90FF' }}
            >
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">
                {stat.label}
              </span>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* The Book section */}
      <SectionContainer>
        <div className="space-y-10">
          <GradientHeading>Where it all started</GradientHeading>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-5 text-slate-300 leading-relaxed">
              <p>
                Maz is a Wellington dad with a web developer background. He wrote the book to help his two drawing-mad kids develop a positive attitude toward maths. It started as scribbles on paper and grew into a proper book.
              </p>
              <p>
                <em>Fun Math 4 Kids, Volume 1</em> is an activity and story book for ages 6+. It combines maths exercises with drawing, code-cracking, and a fantasy adventure featuring a character called Lindy on a quest. It&rsquo;s designed for home play, not homework — no answer pages, no pressure, no performance anxiety.
              </p>
              <p>
                The core belief: maths anxiety is learned, not innate. Kids who feel capable and curious about numbers carry that confidence into secondary school and beyond.
              </p>
              <a
                href="https://mazmatics.com/get-the-book"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border text-sm font-medium transition-colors duration-200 cursor-pointer hover:bg-[#BA90FF] hover:text-slate-950 hover:border-[#BA90FF]"
                style={{ borderColor: '#BA90FF', color: '#BA90FF' }}
              >
                Get the book ↗
              </a>
            </div>

            {/* Book image placeholder */}
            <div className="flex justify-center">
              <div
                className="bg-slate-800 rounded-xl w-[280px] h-[360px] flex flex-col items-center justify-center gap-3"
                style={{
                  boxShadow: '#BA90FF 12px 12px 0px 0px, #47A5F1 -12px -12px 0px 0px',
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#BA90FF" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
                </svg>
                <span className="text-slate-500 font-mono text-xs">Fun Math 4 Kids</span>
                <span className="text-slate-600 font-mono text-xs">Volume 1</span>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* Why this data site */}
      <SectionContainer>
        <div className="space-y-6">
          <GradientHeading>From a story book to a data story</GradientHeading>
          <div className="space-y-5 text-slate-300 leading-relaxed max-w-3xl">
            <p>
              Writing the book started conversations with other parents and teachers. A recurring question kept coming up: &ldquo;How are NZ kids actually doing in maths?&rdquo; The answer was surprisingly hard to find. The data exists — NZQA publishes it, TIMSS tracks it internationally — but it&rsquo;s buried in spreadsheets and PDFs.
            </p>
            <p>
              This site pulls that public data together and makes it explorable. Which groups of students are falling behind? How does New Zealand compare internationally? What changed after the 2024 NCEA reform? These are questions that matter for real kids in real classrooms.
            </p>
            <p>
              It&rsquo;s not an official government resource. It&rsquo;s one person&rsquo;s attempt to make important public data legible. If you find it useful — or find something wrong — please get in touch.
            </p>
          </div>
        </div>
      </SectionContainer>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* The data section */}
      <SectionContainer>
        <div className="space-y-8">
          <GradientHeading>The data behind the charts</GradientHeading>
          <p className="text-slate-300 leading-relaxed">
            Everything on this site comes from public NZ government and international research datasets. Here&rsquo;s where it comes from:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: 'NZQA Secondary Statistics',
                description: 'NCEA attainment by ethnicity, region, equity group, and gender. 2015–2024.',
                url: 'https://www.nzqa.govt.nz/about-us/publications/statistics/',
                urlLabel: 'nzqa.govt.nz',
              },
              {
                name: 'TIMSS International Study',
                description: 'NZ Year 5 maths scores since 1995. International comparison across 58 countries.',
                url: 'https://timss2023.org',
                urlLabel: 'timss2023.org',
              },
              {
                name: 'NMSSA Reports',
                description: 'National monitoring of Year 4 and Year 8 students. 2013, 2018, and 2022 cycles.',
                url: 'https://nmssa.otago.ac.nz',
                urlLabel: 'nmssa.otago.ac.nz',
              },
              {
                name: 'Curriculum Insights',
                description: 'Percentage meeting curriculum benchmarks at Year 3, 6, and 8. 2023–2024.',
                url: 'https://curriculuminsights.otago.ac.nz',
                urlLabel: 'curriculuminsights.otago.ac.nz',
              },
            ].map((source) => (
              <div
                key={source.name}
                className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-2"
              >
                <p className="text-white text-sm font-semibold">{source.name}</p>
                <p className="text-slate-400 text-sm">{source.description}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono transition-colors duration-200 cursor-pointer"
                  style={{ color: '#47A5F1' }}
                >
                  {source.urlLabel} ↗
                </a>
              </div>
            ))}
          </div>

          <p className="text-sm">
            <Link
              href="/data-sources"
              className="transition-colors duration-200 hover:underline"
              style={{ color: '#47A5F1' }}
            >
              Full methodology &amp; data notes →
            </Link>
          </p>
        </div>
      </SectionContainer>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      </div>

      {/* Contact */}
      <SectionContainer>
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Get in touch</h2>
          <p className="text-slate-400 leading-relaxed">
            Built and maintained by Maz Hermon. Questions, corrections, or just want to say hi?
          </p>
          <div className="flex flex-wrap gap-6">
            <a
              href="mailto:hellomazmatics@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#BA90FF] transition-colors duration-200 cursor-pointer"
            >
              <MailIcon />
              hellomazmatics@gmail.com
            </a>
            <a
              href="https://www.instagram.com/mazmaticsfun4kids"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#BA90FF] transition-colors duration-200 cursor-pointer"
            >
              <InstagramIcon />
              @mazmaticsfun4kids
            </a>
            <a
              href="https://www.facebook.com/mazmatics"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#BA90FF] transition-colors duration-200 cursor-pointer"
            >
              <FacebookIcon />
              Mazmatics
            </a>
          </div>
        </div>
      </SectionContainer>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8" />
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-600">
          <Link href="/" className="hover:text-slate-400 transition-colors">← Home</Link>
          <Link href="/data-sources" className="hover:text-slate-400 transition-colors">Data sources</Link>
          <Link href="/nzqa-maths" className="hover:text-slate-400 transition-colors">Secondary maths</Link>
          <Link href="/primary-maths" className="hover:text-slate-400 transition-colors">Primary maths</Link>
        </div>
      </div>

    </div>
  );
}
