import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const donationSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(1000000, "Amount must be less than 1,000,000"),
  donorName: z.string().trim().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  fundraiserId: z.string().uuid("Please select a fundraiser"),
});

interface DonationFormProps {
  userId: string;
}

export const DonationForm = ({ userId }: DonationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [fundraisers, setFundraisers] = useState<any[]>([]);
  const [selectedFundraiser, setSelectedFundraiser] = useState("");
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFundraisers();
    loadProfile();
  }, [userId]);

  const loadFundraisers = async () => {
    const { data } = await supabase
      .from("fundraisers")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setFundraisers(data || []);
  };

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();

    if (data) {
      setDonorName(data.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validated = donationSchema.parse({
        amount: parseFloat(amount),
        donorName: isAnonymous ? "Anonymous" : donorName,
        fundraiserId: selectedFundraiser,
      });

      const { error } = await supabase
        .from("donations")
        .insert({
          fundraiser_id: validated.fundraiserId,
          donor_user_id: userId,
          donor_name: validated.donorName,
          amount: validated.amount,
          is_anonymous: isAnonymous,
        });

      if (error) throw error;

      toast({
        title: "Donation successful",
        description: "Thank you for your contribution!",
      });

      setAmount("");
      setSelectedFundraiser("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fundraisers.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        No active fundraising campaigns at the moment
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fundraiser">Select Campaign *</Label>
        <Select value={selectedFundraiser} onValueChange={setSelectedFundraiser} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a fundraiser" />
          </SelectTrigger>
          <SelectContent>
            {fundraisers.map((fundraiser) => (
              <SelectItem key={fundraiser.id} value={fundraiser.id}>
                {fundraiser.title} - ${fundraiser.raised_amount || 0} / ${fundraiser.goal_amount}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ($) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          max="1000000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="donorName">Your Name *</Label>
        <Input
          id="donorName"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Your name"
          maxLength={255}
          required={!isAnonymous}
          disabled={isAnonymous}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
        />
        <Label htmlFor="anonymous" className="cursor-pointer">
          Make this donation anonymous
        </Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Processing..." : "Donate"}
      </Button>
    </form>
  );
};