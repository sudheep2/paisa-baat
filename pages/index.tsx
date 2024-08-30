import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

axios.defaults.withCredentials = true;

export default function Home() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    axios.get<{ authenticated: boolean }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkAuth`)
      .then(res => {
        if (res.data.authenticated) {
          setAuthenticated(true);
          router.push('/dashboard');
        }
      })
      .catch(err => console.log('Not authenticated', err));
  }, [router]);

  const startAuthorization = () => {
    router.push('/authorize');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 font-sans">
      <h1 className="m-0 text-4xl font-bold text-gray-800 text-center">Welcome to the Paisa-baat</h1>
      <p className="my-4 text-lg text-center text-gray-500">a easy-to-use Bounty Management System</p>
      <p className="my-4 text-lg text-center text-gray-500">Manage and claim bounties on GitHub with ease.</p>
      <p className="my-4 text-lg text-center text-gray-500">You&apos;ll need to connect a Solana wallet to create and claim bounties.</p>
      <button
        className="bg-blue-500 text-white py-4 px-8 rounded-lg cursor-pointer transition duration-200 ease-in-out hover:bg-blue-600"
        onClick={startAuthorization}
      >
        Start Creating or Claiming Bounties
      </button>
    </div>
  );
}
