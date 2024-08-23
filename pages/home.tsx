import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Homepage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('http://localhost:3001/api/checkAuth', {
          credentials: 'include'
        });
        if (response.ok) {
          router.push('/dashboard');
        } else {
          router.push('/home');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/home');
      }
    }

    checkAuth();
  }, [router]);

  return <div>Loading...</div>;
}