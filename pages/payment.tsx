// pages/payment.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const truncateAddress = (address: string, charsToShow = 10) => {
  if (!address) return "";
  return `${address.slice(0, charsToShow)}...${address.slice(-charsToShow)}`;
};

export default function Payment() {
  const router = useRouter();
  const { fromWalletAddress, toWalletAddress, amount, bountyId } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handlePayment = async () => {
    if (
      !publicKey ||
      !sendTransaction ||
      !fromWalletAddress ||
      !toWalletAddress ||
      !amount ||
      !bountyId
    ) {
      setError("Missing required information");
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
      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed");
      }

      // After successful transaction, update the bounty status
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complete-bounty`,
        { bountyId }
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment failed. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800 text-shadow">
          {" "}
          {/* Added text-shadow */}
          Complete Bounty Payment
        </h1>

        <div className="space-y-2">
          <p className="text-gray-700 text-shadow-sm">
            {" "}
            {/* Added text-shadow-sm */}
            From: {truncateAddress(fromWalletAddress as string)}
          </p>
          <p className="text-gray-700 text-shadow-sm">
            To: {truncateAddress(toWalletAddress as string)}
          </p>
          <p className="text-gray-700 text-shadow-sm">Amount: {amount} SOL</p>
        </div>

        <WalletMultiButton className="w-full mb-4" />

        {publicKey && (
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 text-shadow"
          >
            {isLoading ? "Processing..." : "Complete Payment"}
          </button>
        )}

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
}
