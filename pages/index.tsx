import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from './Home.module.css'; // Import your CSS module

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
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>Welcome to the Bounty Management System</h1>
      <p className={styles.homeDescription}>Manage and claim bounties on GitHub with ease.</p>
      <p className={styles.homeWalletInfo}>You'll need to connect a Solana wallet to participate.</p>
      <button className={styles.homeButton} onClick={startAuthorization}>
        Start Creating or Claiming Bounties
      </button>
    </div>
  );
}