// pages/payment.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

export default function Payment() {
  const router = useRouter();
  const { fromWalletAddress, toWalletAddress, amount, bountyId } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handlePayment = async () => {
    if (!publicKey || !sendTransaction || !fromWalletAddress || !toWalletAddress || !amount || !bountyId) {
      setError('Missing required information');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fromPubkey = new PublicKey(fromWalletAddress as string);
      const toPubkey = new PublicKey(toWalletAddress as string);
      const lamports = parseInt(amount as string) * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      
      // Wait for transaction confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      // After successful transaction, update the bounty status
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complete-bounty`, { bountyId });
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Processing payment...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Complete Bounty Payment</h1>
      <p>From: {fromWalletAddress}</p>
      <p>To: {toWalletAddress}</p>
      <p>Amount: {amount} SOL</p>
      <WalletMultiButton />
      {publicKey && (
        <button onClick={handlePayment} disabled={isLoading}>
          Complete Payment
        </button>
      )}
    </div>
  );
}