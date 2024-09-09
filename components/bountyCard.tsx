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
import EditBountyModal from './EditBountyModal'

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
  onUpdate: () => void; // Add onUpdate callback
}

const BountyCard: React.FC<BountyCardProps> = ({
  bounty,
  onDelete,
  variant = "created",
  onUpdate
}) => {
  const bgColor =
    variant === "created" ? "bg-white dark:bg-gray-800" : "bg-green-100 dark:bg-violet-500";
  const textColor =
    variant === "created" ? "text-gray-800 dark:text-gray-200" : "text-green-800 dark:text-violet-200";

  return (
    <Card className={`${bgColor} shadow-md p-6 dark:shadow-none`}>
      <CardHeader>
        <CardTitle className={textColor}>{bounty.issue_title}</CardTitle>
        <CardDescription className={variant === "created" ? "text-gray-800 dark:text-gray-400": "text-gray-400 dark:text-black"}>
          Repository: {bounty.repository}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="dark:text-gray-400">Amount: ${bounty.amount}</p>
        {variant === "created" && (
          <p className="dark:text-gray-400">Status: {bounty.status}</p>
        )}
        {variant === "claimed" && (
          <div>
            <p className="text-gray-400 dark:text-green-400">Status: {bounty.status}</p>
            <p className="text-gray-400 dark:text-green-400">
              Claimed at: {new Date(bounty.claimed_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="link" className="dark:text-gray-400">
          <Link href={bounty.issue_url} target="_blank">
            View Issue
          </Link>
        </Button>
        {onDelete && (
          <Button
            variant="destructive"
            onClick={() => onDelete(bounty.id)}
            className="dark:text-white-400"
          >
            Delete
          </Button>
        )}
        {variant === "created" && (
          <EditBountyModal
            bountyId={bounty.id}
            initialAmount={bounty.amount}
            onUpdate={onUpdate} 
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default BountyCard;
