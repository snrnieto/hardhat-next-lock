'use client';

import dynamic from 'next/dynamic';

const LockInterface = dynamic(() => import('./components/LockInterface'), {
  ssr: false
});

const Navbar = dynamic(() => import('./components/Navbar'), {
  ssr: false
});

export default function Home() {
  return (
    <div className="min-h-screen">
    <Navbar />
    <LockInterface />
  </div>
  );
}
