// pages/api/github/callback.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken } from '../../../lib/github';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || Array.isArray(code)) {
    return res.status(400).json({ error: 'Invalid code provided' });
  }

  try {
    const accessToken = await getAccessToken(code);
    
    // In a real application, you would store this token securely, associated with the user
    // For now, we'll just set it as a cookie
    res.setHeader('Set-Cookie', `github_token=${accessToken}; HttpOnly; Path=/; Max-Age=3600`);

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    res.status(500).json({ error: 'Failed to authenticate with GitHub' });
  }
}