import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  LogOut, 
  AlertCircle, 
  Heart, 
  Users, 
  FileText 
} from "lucide-react";
import { VictimRequestForm } from "@/components/user/VictimRequestForm";
import { VolunteerRegistrationForm } from "@/components/user/VolunteerRegistrationForm";
import { VolunteerCallBoard } from "@/components/user/VolunteerCallBoard";
import { DonationForm } from "@/components/user/DonationForm";
import { UserRequestsList } from "@/components/user/UserRequestsList";
import { UserDonationsList } from "@/components/user/UserDonationsList";
import { UserVolunteerStatus } from "@/components/user/UserVolunteerStatus";

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    
    // Check if user has admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleData) {
      navigate("/admin");
      return;
    }
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Signed out successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Disaster Relief System</h1>
              <p className="text-sm text-muted-foreground">Welcome, {profile?.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">
              <AlertCircle className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="volunteer">
              <Users className="h-4 w-4 mr-2" />
              Volunteer
            </TabsTrigger>
            <TabsTrigger value="calls">
              <FileText className="h-4 w-4 mr-2" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="donate">
              <Heart className="h-4 w-4 mr-2" />
              Donate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit Help Request</CardTitle>
                <CardDescription>
                  Request assistance during emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VictimRequestForm userId={user?.id} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Requests</CardTitle>
                <CardDescription>Track your submitted help requests</CardDescription>
              </CardHeader>
              <CardContent>
                <UserRequestsList userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Registration</CardTitle>
                <CardDescription>
                  Register as a volunteer and help others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VolunteerRegistrationForm userId={user?.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Volunteer Status</CardTitle>
                <CardDescription>View your volunteer profile and applications</CardDescription>
              </CardHeader>
              <CardContent>
                <UserVolunteerStatus userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Active Volunteer Calls</CardTitle>
                <CardDescription>
                  Apply for disaster relief volunteer opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VolunteerCallBoard userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
                <CardDescription>
                  Support active relief campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DonationForm userId={user?.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Donations</CardTitle>
                <CardDescription>View your contribution history</CardDescription>
              </CardHeader>
              <CardContent>
                <UserDonationsList userId={user?.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
