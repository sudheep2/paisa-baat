// pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('http://localhost:3000/api/check-auth', {
          credentials: 'include'
        });
        if (response.ok) {
          router.push('/dashboard');
        } else {
          router.push('/install-github-app');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/install-github-app');
      }
    }

    checkAuth();
  }, [router]);

  return <div>Loading...</div>;
}