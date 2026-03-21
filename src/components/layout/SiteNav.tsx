'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const TOP_LEVEL_LINKS = [
  { href: '/', label: 'Home' },
];

const CHART_LINKS = [
  { href: '/primary-maths',          label: 'Primary Maths' },
  { href: '/nzqa-maths',             label: 'Secondary Maths' },
  { href: '/nzqa-literacy-numeracy', label: 'Literacy & Numeracy' },
  { href: '/nzqa-scholarship',       label: 'Scholarship' },
  { href: '/nzqa-endorsement',       label: 'Endorsement' },
  { href: '/nzqa-creative',          label: 'Creative Views' },
  { href: '/nzqa-stories',           label: 'Data Stories' },
  { href: '/nzqa-patterns',          label: 'Patterns & Trends' },
];

const BOTTOM_LINKS = [
  { href: '/data-sources', label: 'Data Sources' },
  { href: '/about',        label: 'About' },
];

function HamburgerIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
      <rect x="0" y="0"  width="18" height="2" rx="1" fill="currentColor" />
      <rect x="0" y="6"  width="18" height="2" rx="1" fill="currentColor" />
      <rect x="0" y="12" width="18" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  linkRef?: React.RefObject<HTMLAnchorElement | null>;
}

function NavLink({ href, label, isActive, onClick, linkRef }: NavLinkProps) {
  return (
    <Link
      ref={linkRef}
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'flex items-center gap-2.5 rounded-md text-sm font-mono transition-colors',
        isActive
          ? 'text-white bg-violet-500/15 border-l-2 border-violet-400 px-3 py-2 pl-[10px]'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 px-3 py-2',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.classList.add('overflow-hidden');

    // Focus first link
    firstLinkRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="site-nav-drawer"
        className={[
          'fixed top-3 left-3 z-50 p-2 rounded-lg border transition-colors',
          'bg-slate-900/90 backdrop-blur-sm text-slate-300',
          open
            ? 'border-slate-500 bg-slate-800 text-white'
            : 'border-slate-700/60 hover:border-slate-500 hover:bg-slate-800 hover:text-white',
        ].join(' ')}
      >
        {open ? <CloseIcon /> : <HamburgerIcon />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          aria-hidden="true"
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Drawer */}
      <div
        id="site-nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={[
          'fixed left-0 top-0 z-50 h-full w-72 flex flex-col',
          'bg-slate-950 border-r border-slate-800',
          'transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Drawer header */}
        <div className="relative p-5 pb-4 flex items-center">
          <Link
            href="/"
            onClick={close}
            className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent font-semibold text-lg tracking-tight"
          >
            Mazmatics
          </Link>
          <button
            onClick={close}
            aria-label="Close navigation"
            className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav content */}
        <nav aria-label="Site navigation" className="flex-1 overflow-y-auto px-3 pb-6">
          {/* Top-level links */}
          <div className="space-y-0.5 mb-1">
            {TOP_LEVEL_LINKS.map((link, i) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={pathname === link.href}
                onClick={close}
                linkRef={i === 0 ? firstLinkRef : undefined}
              />
            ))}
          </div>

          <hr className="border-slate-800 mx-0 my-2" />

          {/* Charts section */}
          <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-slate-500 px-3 pt-2 pb-1">
            Charts
          </p>
          <div className="space-y-0.5">
            {CHART_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={pathname === link.href}
                onClick={close}
              />
            ))}
          </div>

          <hr className="border-slate-800 mx-0 my-2" />

          {/* Bottom links */}
          <div className="space-y-0.5">
            {BOTTOM_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={pathname === link.href}
                onClick={close}
              />
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
