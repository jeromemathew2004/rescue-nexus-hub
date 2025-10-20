import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const volunteerCallSchema = z.object({
  disasterName: z.string().trim().min(1, "Disaster name is required").max(255, "Disaster name must be less than 255 characters"),
  location: z.string().trim().min(1, "Location is required").max(255, "Location must be less than 255 characters"),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters").optional(),
  volunteersNeeded: z.number().int().positive("Must need at least 1 volunteer").max(10000, "Volunteers needed must be less than 10,000"),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

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
      // Validate input
      const validated = volunteerCallSchema.parse({
        disasterName,
        location,
        description: description || undefined,
        volunteersNeeded: parseInt(volunteersNeeded),
        priority,
      });

      const { error } = await supabase.from("volunteer_calls").insert({
        disaster_name: validated.disasterName,
        disaster_location: validated.location,
        description: validated.description || null,
        volunteers_needed: validated.volunteersNeeded,
        priority_level: validated.priority,
        required_skills: [],
      });

      if (error) throw error;

      toast({ title: "Volunteer call created successfully" });
      setDisasterName("");
      setLocation("");
      setDescription("");
      setVolunteersNeeded("");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Disaster Name</Label>
          <Input 
            value={disasterName} 
            onChange={(e) => setDisasterName(e.target.value)} 
            maxLength={255}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            maxLength={255}
            required 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          maxLength={2000}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Volunteers Needed</Label>
          <Input 
            type="number" 
            value={volunteersNeeded} 
            onChange={(e) => setVolunteersNeeded(e.target.value)} 
            min="1"
            max="10000"
            required 
          />
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