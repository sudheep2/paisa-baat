import Head from 'next/head';

export default function Verify() {
  return (
    <div>
      <Head>
        <title>Verify</title>
      </Head>
      <h1>Verify Page</h1>
      <form>
        <label>
          Aadhaar Number:
          <input type="text" />
        </label>
        <label>
          PAN Number:
          <input type="text" />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}