// pages/install-github-app.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function InstallGitHubApp() {
  const router = useRouter();

  useEffect(() => {
    async function initiateGitHubAppInstall() {
      try {
        const response = await fetch('http://localhost:3000/api/github/login');
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error('No URL returned from the server');
        }
      } catch (error) {
        console.error('Error initiating GitHub App installation:', error);
      }
    }
    initiateGitHubAppInstall();
  }, []);

  return <div>Redirecting to GitHub App installation...</div>;
}