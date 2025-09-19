
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function RedirectPage() {
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    if (user) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [router, user]);

  return null; // Or a loading screen
}
