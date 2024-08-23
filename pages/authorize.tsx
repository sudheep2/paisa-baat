import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

axios.defaults.withCredentials = true;

export default function Authorize() {
  const [step, setStep] = useState<number>(1);
  const [githubAuthorized, setGithubAuthorized] = useState<boolean>(false);
  const [aadhaarPanVerified, setAadhaarPanVerified] = useState<boolean>(false);
  const [installationComplete, setInstallationComplete] = useState<boolean>(false);
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    let isAutherised=false;
    axios.get<{ authenticated: boolean }>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkAuth`)
      .then(res => {
        if (res.data.authenticated) {
            setGithubAuthorized(true);
            isAutherised= true;
        }
      })
      .catch(err => console.log('Not authenticated', err));
    // Check if GitHub authorization is complete
    if(router.query.code && router.query.setup_action && router.query.setup_action==="install") {
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github/callback${window.location.search}`)
        .then(() => setInstallationComplete(true))
        .catch(err => console.error(err));
    }
    else if (!isAutherised &&router.query.code) {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github/callback${window.location.search}`)
        .then(() => setGithubAuthorized(true))
        .catch(err => console.error(err));
    }
  }, [router.query]);

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
        setStep(3);
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

  const handleSolanaConnection = () => {
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/set_solana-address`, { solanaAddress })
      .then(() => {
        setInstallationComplete(true);
        router.push('/dashboard');
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
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
            />
          </div>
        )}
        {aadhaarPanVerified && (
          <div>
            <h2>3. Install GitHub App</h2>
            <button onClick={handleRepoInstallation}>
              Install GitHub App
            </button>
          </div>
        )}
        {installationComplete && (
          <div>
            <h2>4. Connect Solana Wallet</h2>
            <input
              type="text"
              placeholder="Enter Solana Wallet Address"
              value={solanaAddress}
              onChange={(e) => setSolanaAddress(e.target.value)}
            />
            <button onClick={handleSolanaConnection}>
              Connect Solana Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
