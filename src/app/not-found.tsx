'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to diary page after a brief delay
    const redirectTimer = setTimeout(() => {
      router.push('/diary');
    }, 100);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return null; // No need to render anything as we're redirecting
}
