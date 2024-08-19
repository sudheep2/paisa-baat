// pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Bounty {
  id: string;
  issueTitle: string;
  amount: number;
  status: string;
}

export default function Dashboard() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchBounties() {
      try {
        const response = await fetch('/api/bounties');
        if (!response.ok) {
          throw new Error('Failed to fetch bounties');
        }
        const data = await response.json();
        setBounties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBounties();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Your Bounties:</h2>
      {bounties.length === 0 ? (
        <p>No bounties found. Create one by commenting on a GitHub issue!</p>
      ) : (
        <ul>
          {bounties.map((bounty) => (
            <li key={bounty.id}>
              {bounty.issueTitle} - {bounty.amount} rupees - {bounty.status}
            </li>
          ))}
        </ul>
      )}
      <p>To create a bounty, go to your GitHub repository and comment "/create-bounty [amount] rupees" on an issue.</p>
      <button onClick={() => router.push('/install-github-app')}>
        Install GitHub App on More Repositories
      </button>
    </div>
  );
}