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
  const bgColor =
    variant === "created" ? "bg-white dark:bg-gray-800" : "bg-green-100 dark:bg-green-900"; // Different background for claimed bounties
  const textColor =
    variant === "created" ? "text-gray-800 dark:text-white" : "text-green-800 dark:text-green-300";

  return (
    <Card className={`${bgColor} shadow-md p-6 dark:shadow-none`}>
      <CardHeader>
        <CardTitle className={textColor}>{bounty.issue_title}</CardTitle>
        <CardDescription>Repository: {bounty.repository}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="dark:text-white">Amount: ${bounty.amount}</p>
        {variant === "created" && <p className="dark:text-white">Status: {bounty.status}</p>}
        {variant === "claimed" && (
          <>
            <p className="dark:text-white">Status: {bounty.status}</p>
            <p className="dark:text-white">Claimed at: {new Date(bounty.claimed_at).toLocaleString()}</p>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between dark:bg-gray-800">
        <Button variant="link" className="dark:text-white">
          <Link href={bounty.issue_url} target="_blank">
            View Issue
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="destructive"
            onClick={() => onDelete(bounty.id)}
            className="dark:text-white"
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BountyCard;
