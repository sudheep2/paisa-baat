// components/Layout.tsx
import Head from 'next/head';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>GitHub Bounty App</title>
        <meta name="description" content="Manage bounties on GitHub issues" />
        <link rel="icon" href="/paisa-baat.jpeg" />
      </Head>
      <main>{children}</main>
    </>
  );
}