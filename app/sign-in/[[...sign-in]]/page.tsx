import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/8 blur-[100px] pointer-events-none" />
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-8 text-center">
          <img src="/favicon.png" alt="LifeOS Logo" className="w-12 h-12 rounded-xl object-contain mx-auto mb-3" />
          <h1 className="text-xl font-bold">Welcome back to LifeOS</h1>
          <p className="text-white/40 text-sm mt-1">Your AI Chief of Staff</p>
        </div>
        <SignIn />
      </div>
    </main>
  );
}
