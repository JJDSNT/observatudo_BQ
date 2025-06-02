'use client';

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
    <nav className="flex gap-4 mt-2">
      {links.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm hover:underline ${
            pathname === href ? 'font-semibold underline' : ''
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
