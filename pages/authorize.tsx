import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Suspense } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey } from '@solana/web3.js';

axios.defaults.withCredentials = true;

async function verifyAuth() {
  const res = await axios.get<{ authenticated: boolean }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkAuth`);
  return res.data.authenticated;
}

async function verifyAadhaarpan() {
  const res = await axios.get<{ valueSet: boolean }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/checkAadhaarPan`);
  return res.data.valueSet;
}

export default function Authorize() {
  const [isLoading, setIsLoading] = useState(true);
  const [githubAuthorized, setGithubAuthorized] = useState<boolean>(false);
  const [aadhaarPanVerified, setAadhaarPanVerified] = useState<boolean>(false);
  const [installationComplete, setInstallationComplete] = useState<boolean>(false);
  const [userChoice, setUserChoice] = useState<'create' | 'claim' | null>(null);
  const { publicKey, connected } = useWallet();

  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [authResult, aadhaarPanResult] = await Promise.all([
          verifyAuth(),
          verifyAadhaarpan()
        ]);
        setGithubAuthorized(authResult);
        setAadhaarPanVerified(aadhaarPanResult);
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Check if GitHub authorization is complete
    if (router.query.code && router.query.setup_action) {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github/callback${window.location.search}`)
        .then(() => setInstallationComplete(true))
        .catch(err => console.error(err));
    } else if (router.query.code) {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github/callback${window.location.search}`)
        .then(() => setGithubAuthorized(true))
        .catch(err => console.error(err));
    }
  }, [router.query, isLoading]);

  const handleGithubAuthorization = () => {
    axios.get<{ authUrl: string }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github`)
      .then(res => {
        window.location.href = res.data.authUrl;
      })
      .catch(err => console.error(err));
  };

  const handleVerifyAadhaarPan = (aadhaarPan: string) => {
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/verify`, { aadhaarPan })
      .then(() => {
        setAadhaarPanVerified(true);
      })
      .catch(err => console.error(err));
  };

  const handleRepoInstallation = () => {
    axios.get<{ url: string }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github/login`)
      .then(res => {
        window.location.href = res.data.url;
      })
      .catch(err => console.error(err));
  };

  const handleSolanaConnection = async () => {
    if (!publicKey) {
      console.error("Wallet not connected");
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/set_solana-address`, { 
        solanaAddress: publicKey.toString() 
      });

      if (response.status===200) {
        setInstallationComplete(true);
        router.push('/dashboard');
      } else {
        console.error("Failed to set Solana address");
      }
    } catch (err) {
      console.error("Error setting Solana address:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <h1>Authorize Your Account</h1>
      <div>
        <div>
          <h2>1. Authorize with GitHub</h2>
          <button onClick={handleGithubAuthorization} disabled={githubAuthorized}>
            {githubAuthorized ? 'Authorized' : 'Authorize with GitHub'}
          </button>
        </div>
        {githubAuthorized && (
          <div> 
            <h2>2. Verify Aadhaar/PAN</h2>
            <input
              type="text"
              placeholder="Enter Aadhaar/PAN"
              onBlur={(e) => handleVerifyAadhaarPan(e.target.value)}
              disabled={aadhaarPanVerified}
            />
          </div>
        )}
        {aadhaarPanVerified && !userChoice && (
          <div>
            <h2>3. Choose Your Action</h2>
            <button onClick={() => setUserChoice('create')}>Create a Bounty</button>
            <button onClick={() => setUserChoice('claim')}>Claim a Bounty</button>
          </div>
        )}
        {aadhaarPanVerified && userChoice === 'create' && !installationComplete && (
          <div>
            <h2>4. Install GitHub App</h2>
            <button onClick={handleRepoInstallation}>
              Install GitHub App
            </button>
          </div>
        )}
        {((aadhaarPanVerified && userChoice === 'claim') || installationComplete) && (
          <div>
            <h2>{userChoice === 'create' ? '5' : '4'}. Connect Solana Wallet</h2>
            <WalletMultiButton />
            {connected && (
              <div>
                <p>Connected wallet: {publicKey?.toString()}</p>
                <button onClick={handleSolanaConnection}>
                  Confirm Solana Wallet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Suspense>
  );
}