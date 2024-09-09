// components/EditBountyModal.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface EditBountyModalProps {
  bountyId: number;
  initialAmount: number;
  onUpdate: () => void; // Callback to refresh the bounty list after update
}

const EditBountyModal: React.FC<EditBountyModalProps> = ({ bountyId, initialAmount, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      amount: initialAmount
    }
  });

  const onSubmit = async (data: { amount: number }) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bounty/${bountyId}`, { amount: data.amount });
      onUpdate(); // Refresh the bounty list
      setIsOpen(false); 
    } catch (error) {
      console.error("Error updating bounty:", error);
      // Handle error, e.g., display an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button> 
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">
                Amount
              </label>
              <div className="mt-2">
                <Input 
                  id="amount" 
                  type="number" 
                  {...register("amount", { required: true, min: 0 })} 
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditBountyModal;