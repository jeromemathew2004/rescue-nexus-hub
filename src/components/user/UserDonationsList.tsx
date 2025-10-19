import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign } from "lucide-react";

interface UserDonationsListProps {
  userId: string;
}

export const UserDonationsList = ({ userId }: UserDonationsListProps) => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonations();
  }, [userId]);

  const loadDonations = async () => {
    const { data } = await supabase
      .from("donations")
      .select(`
        *,
        fundraisers (
          title
        )
      `)
      .eq("donor_user_id", userId)
      .order("donation_date", { ascending: false });

    setDonations(data || []);
    setLoading(false);
  };

  if (loading) {
    return <p>Loading donations...</p>;
  }

  if (donations.length === 0) {
    return <p className="text-muted-foreground">No donations made yet</p>;
  }

  const totalDonated = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Total Donated</p>
              <p className="text-2xl font-bold">${totalDonated.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {donations.map((donation) => (
        <Card key={donation.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{donation.fundraisers?.title}</p>
                <p className="text-2xl font-bold text-success">${parseFloat(donation.amount).toFixed(2)}</p>
                {donation.is_anonymous && (
                  <p className="text-sm text-muted-foreground">Anonymous donation</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(donation.donation_date).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
