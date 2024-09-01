import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface BountyCardProps {
  bounty: {
    id: number;
    issue_id: number;
    amount: number;
    status: string; // Or any other relevant properties for claimed bounties
    repository: string;
    issue_title: string;
    issue_url: string;
    claimed_at: string;
  };
  onDelete?: (bountyId: number) => void; // Make onDelete optional
  variant?: "created" | "claimed"; // Add a variant prop
}

const BountyCard: React.FC<BountyCardProps> = ({
  bounty,
  onDelete,
  variant = "created",
}) => {
  const bgColor = variant === "created" ? "bg-white" : "bg-green-100"; // Different background for claimed bounties
  const textColor = variant === "created" ? "text-gray-800" : "text-green-800";

  return (
    <Card className={`${bgColor} shadow-md p-6`}>
      <CardHeader>
        <CardTitle className={textColor}>{bounty.issue_title}</CardTitle>
        <CardDescription>Repository: {bounty.repository}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Amount: ${bounty.amount}</p>
        {variant === "created" && <p>Status: {bounty.status}</p>}
        {variant === "claimed" && (
          <>
            <p>Status: {bounty.status}</p>
            <p>Claimed at: {new Date(bounty.claimed_at).toLocaleString()}</p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="link">
          <Link href={bounty.issue_url} target="_blank">
            View Issue
          </Link>
        </Button>
        {onDelete && (
          <Button variant="destructive" onClick={() => onDelete(bounty.id)}>
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BountyCard;
