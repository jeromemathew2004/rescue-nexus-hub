import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Calendar, CheckCircle2 } from "lucide-react";

interface UserVolunteerStatusProps {
  userId: string;
}

export const UserVolunteerStatus = ({ userId }: UserVolunteerStatusProps) => {
  const [volunteer, setVolunteer] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    const { data: volunteerData } = await supabase
      .from("volunteers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    setVolunteer(volunteerData);

    if (volunteerData) {
      const { data: appsData } = await supabase
        .from("volunteer_call_applications")
        .select(`
          *,
          volunteer_calls (
            disaster_name,
            disaster_location,
            priority_level
          )
        `)
        .eq("volunteer_id", volunteerData.id)
        .order("applied_at", { ascending: false });

      setApplications(appsData || []);
    }

    setLoading(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!volunteer) {
    return <p className="text-muted-foreground">Not registered as a volunteer yet</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="font-medium">Registered Volunteer</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {volunteer.skills?.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {volunteer.location}
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Availability: </span>
              <span className="font-medium">{volunteer.availability}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-medium mb-3">Your Applications ({applications.length})</h3>
        {applications.length === 0 ? (
          <p className="text-muted-foreground text-sm">No applications submitted yet</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{app.volunteer_calls?.disaster_name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {app.volunteer_calls?.disaster_location}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </div>

                  {app.notes && (
                    <div className="mt-2 p-2 bg-accent rounded text-sm">
                      <p className="font-medium mb-1">Note from admin:</p>
                      <p>{app.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
