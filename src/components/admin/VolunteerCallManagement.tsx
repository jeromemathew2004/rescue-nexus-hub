import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const VolunteerCallManagement = () => {
  const [loading, setLoading] = useState(false);
  const [disasterName, setDisasterName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [volunteersNeeded, setVolunteersNeeded] = useState("");
  const [priority, setPriority] = useState("medium");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("volunteer_calls").insert({
        disaster_name: disasterName,
        disaster_location: location,
        description,
        volunteers_needed: parseInt(volunteersNeeded),
        priority_level: priority,
        required_skills: [],
      });

      if (error) throw error;

      toast({ title: "Volunteer call created successfully" });
      setDisasterName("");
      setLocation("");
      setDescription("");
      setVolunteersNeeded("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Disaster Name</Label>
          <Input value={disasterName} onChange={(e) => setDisasterName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Volunteers Needed</Label>
          <Input type="number" value={volunteersNeeded} onChange={(e) => setVolunteersNeeded(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={loading}>Create Call</Button>
    </form>
  );
};
