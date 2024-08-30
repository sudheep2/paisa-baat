// pages/change-solana-address.tsx
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import axios from 'axios';
import { useRouter } from 'next/router';

axios.defaults.withCredentials = true;

export default function updateWallet() {
  const { publicKey, connected } = useWallet();
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Fetch the current Solana address from your backend
    const fetchCurrentAddress = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/details`);

        setCurrentAddress(response.data.solana_address);
      } catch (error) {
        console.error('Error fetching current address:', error);
      }
    };

    fetchCurrentAddress();
  }, []);

  const handleChangeAddress = async () => {
    if (!publicKey) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/set_solana-address`,
        { solanaAddress: publicKey.toString() },
        { withCredentials: true }
      )

      if (response.status === 200) {
        setCurrentAddress(publicKey.toString());
        alert('Solana address updated successfully!');
        
      } else {
        throw new Error('Failed to update Solana address');
      }
    } catch (error) {
      console.error('Error updating Solana address:', error);
      alert('Failed to update Solana address. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Change Solana Address</h1>
      <div className="mb-4">
        <p>Current Solana Address: {currentAddress || 'Not set'}</p>
      </div>
      <div className="mb-4">
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>
      {connected && (
        <div>
          <p>New Solana Address: {publicKey?.toString()}</p>
          <button
            onClick={handleChangeAddress}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Update Solana Address
          </button>
        </div>
      )}
    </div>
  );
}