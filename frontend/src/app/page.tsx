import LockInterface from './components/LockInterface';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <LockInterface />
    </div>
  );
}
