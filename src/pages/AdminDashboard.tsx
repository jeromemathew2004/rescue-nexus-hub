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
  Users, 
  AlertCircle, 
  Package, 
  Heart,
  FileText,
  LayoutDashboard
} from "lucide-react";
import { AdminStats } from "@/components/admin/AdminStats";
import { VolunteerCallManagement } from "@/components/admin/VolunteerCallManagement";
import { VictimRequestsManagement } from "@/components/admin/VictimRequestsManagement";
import { ResourceManagement } from "@/components/admin/ResourceManagement";
import { FundraiserManagement } from "@/components/admin/FundraiserManagement";
import { VolunteerManagement } from "@/components/admin/VolunteerManagement";
import { ReportsView } from "@/components/admin/ReportsView";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    
    // Check admin role from user_roles table
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
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
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Disaster Relief Management</p>
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="calls">
              <FileText className="h-4 w-4 mr-2" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="requests">
              <AlertCircle className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="volunteers">
              <Users className="h-4 w-4 mr-2" />
              Volunteers
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Package className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="fundraisers">
              <Heart className="h-4 w-4 mr-2" />
              Fundraisers
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminStats />
          </TabsContent>

          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Call Management</CardTitle>
                <CardDescription>
                  Create and manage volunteer calls for disasters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VolunteerCallManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Victim Requests</CardTitle>
                <CardDescription>
                  Review and manage help requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VictimRequestsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteers">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Management</CardTitle>
                <CardDescription>
                  View and manage registered volunteers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VolunteerManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resource Management</CardTitle>
                <CardDescription>
                  Manage inventory and allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fundraisers">
            <Card>
              <CardHeader>
                <CardTitle>Fundraiser Management</CardTitle>
                <CardDescription>
                  Create and manage fundraising campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FundraiserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Field Reports</CardTitle>
                <CardDescription>
                  View reports submitted by volunteers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReportsView />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
