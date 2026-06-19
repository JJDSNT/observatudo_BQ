'use client';

import Image from 'next/image';

export default function SplashScreen({ message }: Readonly<{ message?: string }>) {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-white dark:bg-black text-zinc-800 dark:text-zinc-200">
      <Image
        src="/logo.png"
        alt="Logo ObservaTudo"
        width={64}
        height={64}
        className="mb-4 rounded-full object-contain"
        priority
      />
      <p className="text-lg font-medium animate-pulse">
        {message || 'Carregando ObservaTudo...'}
      </p>
    </div>
  );
}
