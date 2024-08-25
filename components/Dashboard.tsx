import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";

interface Bounty {
  id: number;
  issue_id: number;
  amount: number;
  status: string;
  repository: string;
  issue_title: string;
  issue_url: string;
}

interface BountyToApprove extends Bounty {
  claimants: {
    claimant_id: number;
    claimant_name: string;
    claimant_email: string;
    claimed_at: string;
  }[];
}

interface ClaimedBounty extends Bounty {
  claimed_at: string;
  claim_status: "Accepted" | "Rejected" | "Pending";
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
  const [claimedBounties, setClaimedBounties] = useState<ClaimedBounty[]>([]);
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

  const handleApproveBounty = async (bountyId: number, claimantId: number) => {
    try {
      const response = await axios.post<ApprovalResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/approve-bounty-verify`,
        { bountyId, claimantId }
      );

      // Redirect to the payment page with the approval response data
      router.push({
        pathname: "/payment",
        query: { ...response.data },
      });
    } catch (error) {
      console.error("Error approving bounty:", error);
      setError("Failed to approve bounty. Please try again later.");
    }
  };

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <section>
        <h2>Created Bounties</h2>
        {createdBounties.length > 0 ? (
          createdBounties.map((bounty) => (
            <div key={bounty.id}>
              <h3>{bounty.issue_title}</h3>
              <p>Amount: {bounty.amount}</p>
              <p>Status: {bounty.status}</p>
              <a
                href={bounty.issue_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Issue
              </a>
              <button onClick={() => handleDeleteBounty(bounty.id)}>
                Delete Bounty
              </button>
            </div>
          ))
        ) : (
          <div>
            <p>You haven&apos;t created any bounties yet.</p>
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
        <section>
          <h2>Bounties to Approve</h2>
          {bountiesToApprove.map((bounty) => (
            <div key={bounty.id}>
              <h3>{bounty.issue_title}</h3>
              <p>Amount: {bounty.amount}</p>
              <p>Claimants:</p>
              {bounty.claimants.map((claimant) => (
                <div key={claimant.claimant_id}>
                  <p>
                    {claimant.claimant_name} ({claimant.claimant_email})
                  </p>
                  <button
                    onClick={() =>
                      handleApproveBounty(bounty.id, claimant.claimant_id)
                    }
                  >
                    Approve for this claimant
                  </button>
                </div>
              ))}
              <a
                href={bounty.issue_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Issue
              </a>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2>Claimed Bounties</h2>
        {claimedBounties.length > 0 ? (
          claimedBounties.map((bounty) => (
            <div key={bounty.id}>
              <h3>{bounty.issue_title}</h3>
              <p>Amount: {bounty.amount}</p>
              <p>Status: {bounty.claim_status}</p>
              <p>Claimed at: {new Date(bounty.claimed_at).toLocaleString()}</p>
              <a
                href={bounty.issue_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Issue
              </a>
            </div>
          ))
        ) : (
          <div>
            <p>You haven&apos;t claimed any bounties yet.</p>
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
