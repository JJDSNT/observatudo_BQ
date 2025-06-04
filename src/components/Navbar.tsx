'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { label: 'Dashboard', href: '/' },
  { label: 'Indicadores', href: '/indicadores' },
  { label: 'Global', href: '/world' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Login', href: '/login' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-black dark:text-white !no-underline hover:!no-underline">
        <Image
          src="/logo.png"
          alt="Logo ObservaTudo"
          width={32}
          height={32}
          className="rounded"
        />
        ObservaTudo
      </Link>

      <nav className="flex flex-wrap gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        {links.map(({ label, href }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-md dark:text-black'
                    : 'text-zinc-700 dark:text-zinc-300 hover:underline hover:text-amber-600 dark:hover:text-amber-400'
                }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
