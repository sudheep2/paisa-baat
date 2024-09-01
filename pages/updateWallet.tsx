// pages/change-solana-address.tsx
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '@/components/Header';

axios.defaults.withCredentials = true;

// Assuming you have a base URL for your API
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ChangeSolanaAddress() {
  const { publicKey, connected } = useWallet();
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentAddress = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/details`);
        setCurrentAddress(response.data.solana_address);
      } catch (error) {
        console.error('Error fetching current address:', error);
      }
    };

    fetchCurrentAddress();
  }, []);

  const handleChangeAddress = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/user/set_solana-address`,
        { solanaAddress: publicKey.toString() },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setCurrentAddress(publicKey.toString());
        alert('Solana address updated successfully!');
        router.push('/dashboard'); // Redirect to dashboard or profile page
      } else {
        throw new Error('Failed to update Solana address');
      }
    } catch (error) {
      console.error('Error updating Solana address:', error);
      alert('Failed to update Solana address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto flex-1 flex items-center justify-center py-8 dark:bg-gray-900">
        <div className="p-4 bg-white rounded-md shadow-sm dark:bg-gray-800 dark:text-white">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-3xl font-bold dark:text-white">
              Change Solana Address
            </h1>
            <div className="flex items-center space-x-4">
              <WalletMultiButton className="bg-white rounded-md shadow-sm dark:bg-gray-700" />
              <WalletDisconnectButton className="bg-white rounded-md shadow-sm dark:bg-gray-700" />
            </div>
          </div>
          <p className="text-lg mb-4">
            Current Solana Address:
            <span className="font-bold">{currentAddress || 'Not set'}</span>
          </p>
          {connected && (
            <div className="mb-4">
              <p className="text-lg">
                New Solana Address:
                <span className="font-bold">{publicKey?.toString()}</span>
              </p>
              <button
                onClick={handleChangeAddress}
                disabled={
                  isLoading ||
                  (!currentAddress && !publicKey) ||
                  currentAddress === publicKey?.toString()
                }
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-500"
              >
                {isLoading ? 'Updating...' : 'Update Solana Address'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
