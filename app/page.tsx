import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <h1>Welcome to my app!</h1>
      <ul>
        <li>
          <Link href="/verify">
            <a>Verify</a>
          </Link>
        </li>
        <li>
          <Link href="/auth">
            <a>Auth</a>
          </Link>
        </li>
        <li>
          <Link href="/bounties">
            <a>Bounties</a>
          </Link>
        </li>
        <li>
          <Link href="/bounty-approval">
            <a>Bounty Approval</a>
          </Link>
        </li>
        <li>
          <Link href="/profile">
            <a>Profile</a>
          </Link>
        </li>
        <li>
          <Link href="/leaderboard">
            <a>Leaderboard</a>
          </Link>
        </li>
      </ul>
    </div>
  );
}