import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/8 blur-[100px] pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-6 text-center">
          <img src="/favicon.png" alt="LifeOS Logo" className="w-12 h-12 rounded-xl object-contain mx-auto mb-3" />
          <h1 className="text-xl font-bold">Join LifeOS</h1>
          <p className="text-white/40 text-sm mt-1">Your AI Chief of Staff for student life</p>
        </div>
        <SignUp />
        <div className="mt-6 text-center">
          <Link
            href="/dashboard?guest=true"
            className="text-sm text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1.5 justify-center py-2.5 px-6 rounded-xl border border-white/6 hover:border-brand-500/20 bg-white/5 hover:bg-brand-500/5 backdrop-blur-sm shadow-sm"
          >
            Continue as Guest (Demo Mode)
          </Link>
        </div>
      </div>
    </main>
  );
}
