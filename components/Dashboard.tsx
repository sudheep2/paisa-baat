import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "./DashboardComponent.module.css";

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
  const [selectedClaimants, setSelectedClaimants] = useState<{
    [key: number]: number;
  }>({});

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
    return <div className={styles.loading}>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Dashboard</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Created Bounties</h2>
        {createdBounties.length > 0 ? (
          <div className={styles.bountyGrid}>
            {createdBounties.map((bounty) => (
              <div key={bounty.id} className={styles.bountyCard}>
                <h3 className={styles.bountyTitle}>{bounty.issue_title}</h3>
                <p>Amount: ${bounty.amount}</p>
                <p>Status: {bounty.status}</p>
                <a
                  href={bounty.issue_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  View Issue
                </a>
                <button
                  onClick={() => handleDeleteBounty(bounty.id)}
                  className={styles.deleteButton}
                >
                  Delete Bounty
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
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
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bounties to Approve</h2>
          <div className={styles.bountyGrid}>
            {bountiesToApprove.map((bounty) => (
              <div key={bounty.id} className={styles.bountyCard}>
                <h3 className={styles.bountyTitle}>{bounty.issue_title}</h3>
                <p>Amount: ${bounty.amount}</p>
                <p>Claimants:</p>
                {bounty.claimants.map((claimant) => (
                  <div key={claimant.claimant_id} className={styles.claimant}>
                    <label>
                      <input
                        type="radio"
                        name={`claimant-${bounty.id}`}
                        onChange={() =>
                          handleClaimantSelect(bounty.id, claimant.claimant_id)
                        }
                      />
                      {claimant.claimant_name} ({claimant.claimant_email})
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => handleApproveBounty(bounty.id)}
                  className={styles.approveButton}
                  disabled={!selectedClaimants[bounty.id]}
                >
                  Approve Bounty
                </button>
                <a
                  href={bounty.issue_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  View Issue
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Claimed Bounties</h2>
        {claimedBounties.length > 0 ? (
          <div className={styles.bountyGrid}>
            {claimedBounties.map((bounty) => (
              <div key={bounty.id} className={styles.bountyCard}>
                <h3 className={styles.bountyTitle}>{bounty.issue_title}</h3>
                <p>Amount: ${bounty.amount}</p>
                <p>Status: {bounty.claim_status}</p>
                <p>
                  Claimed at: {new Date(bounty.claimed_at).toLocaleString()}
                </p>
                <a
                  href={bounty.issue_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  View Issue
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
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
