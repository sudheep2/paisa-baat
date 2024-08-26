import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Suspense } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";

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
      (userChoice === "claim" || authData.isAppInstalled) &&
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

  const renderStep = () => {
    if (!authState.authenticated) {
      return (
        <AuthStep
          title="Authorize with GitHub"
          description="Connect your GitHub account to get started."
          action={
            <button
              onClick={handleGithubAuthorization}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Authorize with GitHub
            </button>
          }
        />
      );
    }

    if (!authState.aadhaarPanVerified) {
      return (
        <AuthStep
          title="Verify Aadhaar/PAN"
          description="Enter your Aadhaar or PAN number for verification."
          action={
            <input
              type="text"
              placeholder={authState.aadhaarPan || "Enter Aadhaar/PAN"}
              onBlur={(e) => handleVerifyAadhaarPan(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          }
        />
      );
    }

    if (!userChoice) {
      return (
        <AuthStep
          title="Choose Your Action"
          description="Select whether you want to create or claim a bounty."
          action={
            <div className="space-y-4">
              <button
                onClick={() => setUserChoice("create")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Create a Bounty
              </button>
              <button
                onClick={() => setUserChoice("claim")}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Claim a Bounty
              </button>
            </div>
          }
        />
      );
    }

    if (userChoice === "create" && !authState.isAppInstalled) {
      return (
        <AuthStep
          title="Install GitHub App"
          description="Install our GitHub app to manage your bounties."
          action={
            <button
              onClick={handleRepoInstallation}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Install GitHub App
            </button>
          }
        />
      );
    }

    return (
      <AuthStep
        title="Connect Solana Wallet"
        description="Link your Solana wallet to receive or send payments."
        action={
          <div className="space-y-4">
            <WalletMultiButton className="!bg-orange-500 hover:!bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-300" />
            {connected && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Connected wallet: {publicKey?.toString()}
                </p>
                <button
                  onClick={handleSolanaConnection}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Confirm Solana Wallet
                </button>
              </div>
            )}
          </div>
        }
      />
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Authorize Your Account</h1>
        <AnimatePresence mode="wait">
          <motion.div
            key={+!!authState.authenticated + +!!authState.aadhaarPanVerified + (userChoice || "")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </Suspense>
  );
}

function AuthStep({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  );
}