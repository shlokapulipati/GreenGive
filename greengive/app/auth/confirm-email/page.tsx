'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-brand/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-5xl mb-6">📬</div>

      <h1 className="font-syne text-4xl font-black text-white mb-4">Check your email</h1>
      <p className="text-gray-400 text-base max-w-sm leading-relaxed mb-2">
        We&apos;ve sent a confirmation link to
      </p>
      <p className="text-gold font-medium mb-8">{email}</p>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-10">
        Click the link in the email to confirm your account, then log in to subscribe and enter the draw.
      </p>

      <Link href="/auth/login"
        className="px-6 py-3 rounded-xl bg-white text-ink font-bold text-sm hover:bg-gray-100 transition-colors">
        Go to Login →
      </Link>

      <Link href="/" className="mt-4 text-sm text-gray-600 hover:text-gray-400 transition-colors">
        ← Back to home
      </Link>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  );
}
