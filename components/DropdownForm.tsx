import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Claimant {
    claimant_id: number;
    claimant_name: string;
}

interface DropdownFormProps {
    bountyId: number;
    claimants: Claimant[];
    onClaimantSelect: (bountyId: number, claimantId: number) => void;
    onApprove: (bountyId: number) => void;
}

const DropdownForm: React.FC<DropdownFormProps> = ({
    bountyId,
    claimants,
    onClaimantSelect,
    onApprove,
}) => {

    const onSubmit = (data: { claimant: string }) => {
        const claimantId = parseInt(data.claimant);
        onClaimantSelect(bountyId, claimantId);
        onApprove(bountyId);
    };

    const FormSchema = z.object({
        claimant: z.string({
            required_error: "Please select a claimant.",
        }),
    });
    
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            claimant: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <FormField
                    control={form.control}
                    name="claimant"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Select Claimant</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? claimants.find(
                                                      (claimant) => claimant.claimant_id === parseInt(field.value)
                                                  )?.claimant_name
                                                : "Select claimant"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search claimant..." />
                                        <CommandList>
                                            <CommandEmpty>No claimant found.</CommandEmpty>
                                            <CommandGroup>
                                                {claimants.map((claimant) => (
                                                    <CommandItem
                                                        value={claimant.claimant_name}
                                                        key={claimant.claimant_id}
                                                        onSelect={() => {
                                                            form.setValue("claimant", claimant.claimant_id.toString());
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                claimant.claimant_id === parseInt(field.value)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {claimant.claimant_name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Approve Bounty</Button>
            </form>
        </Form>
    );
};

export default DropdownForm;