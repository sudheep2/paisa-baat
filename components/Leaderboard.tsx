import Head from 'next/head';

export default function Leaderboard() {
  return (
    <div>
      <Head>
        <title>Leaderboard</title>
      </Head>
      <h1>Leaderboard Page</h1>
      <ul>
        <li>
          <h2>John Doe</h2>
          <p>100 points</p>
        </li>
        <li>
          <h2>Jane Doe</h2>
          <p>90 points</p>
        </li>
        <li>
          <h2>Bob Smith</h2>
          <p>80 points</p>
        </li>
      </ul>
    </div>
  );
}