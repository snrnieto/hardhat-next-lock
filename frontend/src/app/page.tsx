'use client';

import dynamic from 'next/dynamic';

const LockProviderClient = dynamic(
  () => import('../context/LockContext').then(mod => mod.LockProvider),
  { ssr: false }
);

export default function Home() {
  return (
    <LockProviderClient>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        {/* Your existing page content */}
      </main>
    </LockProviderClient>
  );
}
