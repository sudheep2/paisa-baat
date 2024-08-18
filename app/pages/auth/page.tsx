import Head from 'next/head';

export default function Auth() {
  return (
    <div>
      <Head>
        <title>Auth</title>
      </Head>
      <h1>Auth Page</h1>
      <button>Authenticate with GitHub</button>
    </div>
  );
}