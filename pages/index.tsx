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
    <div>
      <h1>Welcome to the Bounty Management System</h1>
      <p>Manage and claim bounties on GitHub with ease.</p>
      <p>You&apos;ll need to connect a Solana wallet to participate.</p>
      <button onClick={startAuthorization}>
        Start Creating or Claiming Bounties
      </button>
    </div>
  );
}