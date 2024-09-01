import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import DropdownForm from "./DropdownForm";
import BountyCard from "./ui/bountyCard";

interface Bounty {
  id: number;
  issue_id: number;
  amount: number;
  status: string;
  repository: string;
  issue_title: string;
  issue_url: string;
  claimed_by: number;
  claimed_at: string;
}

interface BountyToApprove extends Bounty {
  claimants: {
    claimant_id: number;
    claimant_name: string;
    claimant_email: string;
    claimed_at: string;
  }[];
}

interface ApprovalResponse {
  fromWalletAddress: string;
  toWalletAddress: string;
  amount: number;
  bountyId: number;
}

export default function DashboardComponent() {
  const [createdBounties, setCreatedBounties] = useState<Bounty[]>([]);
  const [bountiesToApprove, setBountiesToApprove] = useState<BountyToApprove[]>(
    []
  );
  const [selectedClaimants, setSelectedClaimants] = useState<{
    [key: number]: number;
  }>({});

  const [claimedBounties, setClaimedBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [createdRes, toApproveRes, claimedRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/created_bounties`
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/bounties-to-approve`
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/claimed-bounties`
        ),
      ]);

      setCreatedBounties(createdRes.data);
      setBountiesToApprove(toApproveRes.data);
      setClaimedBounties(claimedRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteBounty = async (bountyId: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bounty/${bountyId}`
      );
      // After successful deletion, refresh the created bounties list
      setCreatedBounties((prevBounties) =>
        prevBounties.filter((bounty) => bounty.id !== bountyId)
      );
    } catch (error) {
      console.error("Error deleting bounty:", error);
      // Handle the error, maybe show an error message to the user
      setError("Failed to delete bounty. Please try again later.");
    }
  };

  const handleApproveBounty = async (bountyId: number) => {
    const claimantId = selectedClaimants[bountyId];
    if (!claimantId) {
      setError("Please select a claimant before approving the bounty.");
      return;
    }

    try {
      const response = await axios.post<ApprovalResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/approve-bounty-verify`,
        { bountyId, claimantId }
      );

      router.push({
        pathname: "/payment",
        query: { ...response.data },
      });
    } catch (error) {
      console.error("Error approving bounty:", error);
      setError("Failed to approve bounty. Please try again later.");
    }
  };

  const handleClaimantSelect = (bountyId: number, claimantId: number) => {
    setSelectedClaimants((prev) => ({ ...prev, [bountyId]: claimantId }));
  };

  if (isLoading) {
    return (
      <div className="text-center text-lg mt-8 dark:text-white">
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-lg mt-8 text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8 dark:bg-gray-900">
      <h1 className="text-4xl mb-8 text-gray-800 dark:text-white">
        Dashboard
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl mb-4 text-gray-700 dark:text-gray-200">
          Created Bounties
        </h2>
        {createdBounties.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {" "}
            {/* Use grid for layout */}
            {createdBounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                bounty={{
                  ...bounty,
                  claimed_at: bounty.claimed_at || "",
                }}
                onDelete={handleDeleteBounty}
                variant="created"
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-100 rounded-lg dark:bg-gray-800">
            <p className="dark:text-gray-400">
              You haven&apos;t created any bounties yet.
            </p>
            <Image
              src="/path-to-create-bounty-image.png"
              alt="How to create a bounty"
              width={300}
              height={200}
            />
          </div>
        )}
      </section>

      {bountiesToApprove.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl mb-4 text-gray-700 dark:text-gray-200">
            Bounties to Approve
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {bountiesToApprove.map((bounty) => (
              <div
                key={bounty.id}
                className={
                  bounty.status === "payment pending"
                    ? "bg-slate-950 rounded-lg p-6 shadow-md dark:bg-gray-800"
                    : "bg-gray-100 rounded-lg p-6 shadow-md dark:bg-gray-800"
                }
              >
                <h3
                  className={
                    bounty.status === "payment pending"
                      ? "text-lg mb-2 text-white dark:text-gray-200"
                      : "text-lg mb-2 text-gray-800 dark:text-gray-400"
                  }
                >
                  {bounty.issue_title}
                </h3>
                <p
                  className={
                    bounty.status === "payment pending"
                      ? "text-sm mb-2 text-white dark:text-gray-200"
                      : "text-sm mb-2 text-gray-800 dark:text-gray-400"
                  }
                >
                  Amount: ${bounty.amount}
                </p>
                <p
                  className={
                    bounty.status === "payment pending"
                      ? "text-sm mb-2 text-white dark:text-gray-200"
                      : "text-sm mb-2 text-gray-800 dark:text-gray-400"
                  }
                >
                  Claimants:
                </p>
                <DropdownForm
                  bountyId={bounty.id}
                  claimants={bounty.claimants}
                  onClaimantSelect={handleClaimantSelect}
                  onApprove={handleApproveBounty}
                  bountyStatus={bounty.status} // Pass the bounty status
                  claimedById={bounty.claimed_by} // Pass the claimed_by user ID
                />
                <a
                  href={bounty.issue_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-500 hover:underline dark:text-blue-400"
                >
                  View Issue
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-12">
        <h2 className="text-2xl mb-4 text-gray-700 dark:text-gray-200">
          Claimed Bounties
        </h2>
        {claimedBounties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {claimedBounties.map((bounty) => (
              <BountyCard
                key={bounty.id}
                bounty={bounty}
                variant="claimed"
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-100 rounded-lg dark:bg-gray-800">
            <p className="dark:text-gray-400">
              You haven&apos;t claimed any bounties yet.
            </p>
            <Image
              src="/path-to-claim-bounty-image.png"
              alt="How to claim a bounty"
              width={300}
              height={200}
            />
          </div>
        )}
      </section>
    </div>
  );
}
