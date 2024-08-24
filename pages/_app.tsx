// pages/_app.tsx
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import SolanaProvider from '../components/SolanaProvider';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SolanaProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SolanaProvider>
  );
}

export default MyApp;