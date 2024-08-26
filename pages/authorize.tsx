import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

axios.defaults.withCredentials = true;

interface AuthResponse {
  authenticated: boolean;
  isAppInstalled: boolean;
  aadhaarPanVerified: boolean;
  aadhaarPan: string;
  solanaAddressSet: boolean;
}

async function verifyAuth(): Promise<AuthResponse> {
  const res = await axios.get<AuthResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/checkAuth`
  );
  return res.data;
}

export default function Authorize() {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthResponse>({
    authenticated: false,
    isAppInstalled: false,
    aadhaarPanVerified: false,
    aadhaarPan: "",
    solanaAddressSet: false,
  });
  const [userChoice, setUserChoice] = useState<"create" | "claim" | null>(null);
  const { publicKey, connected } = useWallet();

  const router = useRouter();

  const checkAndRedirect = (authData: AuthResponse) => {
    if (
      authData.solanaAddressSet &&
      authData.isAppInstalled &&
      authData.aadhaarPanVerified &&
      authData.authenticated
    ) {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authResult = await verifyAuth();
        setAuthState(authResult);
        setUserChoice(authResult.isAppInstalled ? "claim" : "create");
        checkAndRedirect(authResult);
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

    const handleCallback = async () => {
      if (router.query.code) {
        try {
          const endpoint = router.query.setup_action
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github/callback`
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github/callback`;

          await axios.get(`${endpoint}${window.location.search}`);
          const updatedAuthState = await verifyAuth();
          setAuthState(updatedAuthState);
          checkAndRedirect(updatedAuthState);
        } catch (err) {
          console.error(err);
        }
      }
    };

    handleCallback();
  }, [router.query, isLoading]);

  const handleGithubAuthorization = () => {
    axios
      .get<{ authUrl: string }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/github`
      )
      .then((res) => {
        window.location.href = res.data.authUrl;
      })
      .catch((err) => console.error(err));
  };

  const handleVerifyAadhaarPan = async (aadhaarPan: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/verify`,
        {
          aadhaarPan,
        }
      );
      const updatedAuthState = await verifyAuth();
      setAuthState(updatedAuthState);
      checkAndRedirect(updatedAuthState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepoInstallation = () => {
    axios
      .get<{ githubAuthUrl: string }>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github/login`
      )
      .then((res) => {
        window.location.href = res.data.githubAuthUrl;
      })
      .catch((err) => console.error(err));
  };

  const handleSolanaConnection = async () => {
    if (!publicKey) {
      console.error("Wallet not connected");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/set_solana-address`,
        {
          solanaAddress: publicKey.toString(),
        }
      );
      const updatedAuthState = await verifyAuth();
      setAuthState(updatedAuthState);
      checkAndRedirect(updatedAuthState);
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
          <button
            onClick={handleGithubAuthorization}
            disabled={authState.authenticated}
          >
            {authState.authenticated ? "Authorized" : "Authorize with GitHub"}
          </button>
        </div>
        {authState.authenticated && (
          <div>
            <h2>2. Verify Aadhaar/PAN</h2>
            <input
              type="text"
              placeholder={authState.aadhaarPan || "Enter Aadhaar/PAN"}
              onBlur={(e) => handleVerifyAadhaarPan(e.target.value)}
              disabled={authState.aadhaarPanVerified}
            />
          </div>
        )}
        {authState.aadhaarPanVerified && !userChoice && (
          <div>
            <h2>3. Choose Your Action</h2>
            <button
              onClick={() => setUserChoice("create")}
              style={{ margin: "10px 0" }}
            >
              Create a Bounty
            </button>
            <button
              onClick={() => setUserChoice("claim")}
              style={{ margin: "10px 0" }}
            >
              Claim a Bounty
            </button>
          </div>
        )}
        {authState.aadhaarPanVerified &&
          userChoice === "create" &&
          !authState.isAppInstalled && (
            <div>
              <h2>4. Install GitHub App</h2>
              <button onClick={handleRepoInstallation}>
                Install GitHub App
              </button>
            </div>
          )}
        {((authState.aadhaarPanVerified && userChoice === "claim") ||
          authState.isAppInstalled) && (
          <div>
            <h2>
              {userChoice === "create" ? "5" : "4"}. Connect Solana Wallet
            </h2>
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
