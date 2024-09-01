import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ModeToggle } from '@/components/ModeToggle';

axios.defaults.withCredentials = true;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const res = await axios.get<{ authenticated: boolean }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkAuth`, { withCredentials: true });
        if (res.data.authenticated) {
          router.push('/dashboard');
        }
      } catch (err) {
        console.log('Not authenticated', err);
      }
    };
    fetchAuth();
  }, [router]);

  const startAuthorization = () => {
    router.push('/authorize');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <div className="fixed top-4 right-4">
        <ModeToggle/>
      </div>
      <h1 className="m-0 text-4xl font-bold text-gray-800 dark:text-white text-center">Welcome to the Paisa-baat</h1>
      <p className="my-4 text-lg text-center text-gray-500 dark:text-gray-300">a easy-to-use Bounty Management System</p>
      <p className="my-4 text-lg text-center text-gray-500 dark:text-gray-300">Manage and claim bounties on GitHub with ease.</p>
      <p className="my-4 text-lg text-center text-gray-500 dark:text-gray-300">You&apos;ll need to connect a Solana wallet to create and claim bounties.</p>
      <button
        className="bg-blue-500 dark:bg-blue-800 text-white dark:text-white py-4 px-8 rounded-lg cursor-pointer transition duration-200 ease-in-out hover:bg-blue-600 dark:hover:bg-blue-700"
        onClick={startAuthorization}
      >
        Start Creating or Claiming Bounties
      </button>
    </div>
  );
}
