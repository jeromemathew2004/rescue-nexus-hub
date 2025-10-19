import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, Package, Heart } from "lucide-react";

export const AdminStats = () => {
  const [stats, setStats] = useState({
    volunteers: 0,
    requests: 0,
    resources: 0,
    fundraisers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [volunteers, requests, resources, fundraisers] = await Promise.all([
      supabase.from("volunteers").select("*", { count: "exact", head: true }),
      supabase.from("victim_requests").select("*", { count: "exact", head: true }),
      supabase.from("resources").select("*", { count: "exact", head: true }),
      supabase.from("fundraisers").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      volunteers: volunteers.count || 0,
      requests: requests.count || 0,
      resources: resources.count || 0,
      fundraisers: fundraisers.count || 0,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.volunteers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Help Requests</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.requests}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resources</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.resources}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fundraisers</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.fundraisers}</div>
        </CardContent>
      </Card>
    </div>
  );
};
