import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { MapPin, Users, AlertCircle } from "lucide-react";

interface VolunteerCallBoardProps {
  userId: string;
}

export const VolunteerCallBoard = ({ userId }: VolunteerCallBoardProps) => {
  const [calls, setCalls] = useState<any[]>([]);
  const [volunteer, setVolunteer] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    // Load volunteer profile
    const { data: volunteerData } = await supabase
      .from("volunteers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    setVolunteer(volunteerData);

    // Load active calls
    const { data: callsData } = await supabase
      .from("volunteer_calls")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setCalls(callsData || []);

    // Load user's applications if volunteer
    if (volunteerData) {
      const { data: appsData } = await supabase
        .from("volunteer_call_applications")
        .select("*")
        .eq("volunteer_id", volunteerData.id);

      setApplications(appsData || []);
    }

    setLoading(false);
  };

  const handleApply = async (callId: string) => {
    if (!volunteer) {
      toast({
        title: "Not registered",
        description: "Please register as a volunteer first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("volunteer_call_applications")
        .insert({
          call_id: callId,
          volunteer_id: volunteer.id,
        });

      if (error) throw error;

      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const hasApplied = (callId: string) => {
    return applications.some((app) => app.call_id === callId);
  };

  const getApplicationStatus = (callId: string) => {
    const app = applications.find((a) => a.call_id === callId);
    return app?.status;
  };

  if (loading) {
    return <p>Loading calls...</p>;
  }

  if (!volunteer) {
    return (
      <div className="text-center p-6 bg-accent rounded-lg">
        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-accent-foreground" />
        <p className="text-lg font-medium mb-2">Register as a Volunteer</p>
        <p className="text-muted-foreground">
          You need to register as a volunteer before applying to calls
        </p>
      </div>
    );
  }

  if (calls.length === 0) {
    return <p className="text-muted-foreground">No active volunteer calls at the moment</p>;
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => (
        <Card key={call.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {call.disaster_name}
                  <PriorityBadge priority={call.priority_level} />
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {call.disaster_location}
                </CardDescription>
              </div>
              <StatusBadge status={call.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {call.description && <p className="text-sm">{call.description}</p>}
            
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span className="font-medium">{call.volunteers_needed} volunteers needed</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {call.required_skills?.map((skill: string) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>

            {hasApplied(call.id) ? (
              <div className="flex items-center gap-2">
                <StatusBadge status={getApplicationStatus(call.id)} />
                <span className="text-sm text-muted-foreground">Application submitted</span>
              </div>
            ) : (
              <Button onClick={() => handleApply(call.id)} className="w-full">
                Apply for This Call
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
