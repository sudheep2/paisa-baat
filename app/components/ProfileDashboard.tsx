import Head from 'next/head';

export default function Profile() {
  return (
    <div>
      <Head>
        <title>Profile</title>
      </Head>
      <h1>Profile Page</h1>
      <h2>John Doe</h2>
      <p>john.doe@example.com</p>
    </div>
  );
}