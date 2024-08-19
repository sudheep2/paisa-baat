// lib/github.ts
import axios from 'axios';

export async function getAccessToken(code: string): Promise<string> {
  const response = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
  }, {
    headers: { Accept: 'application/json' }
  });

  return response.data.access_token;
}

export function getAuthenticatedOctokit(token: string) {
  // Implement this function to return an authenticated Octokit instance
  // You'll need to install and import the Octokit library
}