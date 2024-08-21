import Head from 'next/head';

export default function Bounties() {
  return (
    <div>
      <Head>
        <title>Bounties</title>
      </Head>
      <h1>Bounties Page</h1>
      <ul>
        <li>
          <h2>Bounty 1</h2>
          <p>Description 1</p>
        </li>
        <li>
          <h2>Bounty 2</h2>
          <p>Description 2</p>
        </li>
        <li>
          <h2>Bounty 3</h2>
          <p>Description 3</p>
        </li>
      </ul>
    </div>
  );
}