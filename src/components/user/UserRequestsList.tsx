import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Calendar } from "lucide-react";

interface UserRequestsListProps {
  userId: string;
}

export const UserRequestsList = ({ userId }: UserRequestsListProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [userId]);

  const loadRequests = async () => {
    const { data } = await supabase
      .from("victim_requests")
      .select("*")
      .eq("user_id", userId)
      .order("request_date", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  if (loading) {
    return <p>Loading requests...</p>;
  }

  if (requests.length === 0) {
    return <p className="text-muted-foreground">No requests submitted yet</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <StatusBadge status={request.status} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(request.request_date).toLocaleDateString()}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span className="text-sm">{request.location}</span>
              </div>
              
              <p className="text-sm">{request.description}</p>
              
              {request.urgent_needs && (
                <div className="mt-2 p-2 bg-accent rounded">
                  <p className="text-sm font-medium">Urgent needs:</p>
                  <p className="text-sm text-muted-foreground">{request.urgent_needs}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
