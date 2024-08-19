// pages/api/bounties.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthenticatedOctokit } from '../../lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { github_token } = req.cookies;

  if (!github_token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const octokit = getAuthenticatedOctokit(github_token);
    // Fetch bounties using the authenticated Octokit instance
    // This is a placeholder - you'll need to implement the actual fetching logic
    const bounties = await fetchBountiesForUser(octokit);
    res.status(200).json(bounties);
  } catch (error) {
    console.error('Error fetching bounties:', error);
    res.status(500).json({ error: 'Failed to fetch bounties' });
  }
}

async function fetchBountiesForUser(octokit: any): Promise<any[]> {
  // Implement this function to fetch bounties using the Octokit instance
  // This is where you'd interact with your database or GitHub API
  return [];
}