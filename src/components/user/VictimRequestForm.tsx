import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface VictimRequestFormProps {
  userId: string;
}

export const VictimRequestForm = ({ userId }: VictimRequestFormProps) => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [urgentNeeds, setUrgentNeeds] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("victim_requests")
        .insert({
          user_id: userId,
          description,
          location,
          urgent_needs: urgentNeeds,
        });

      if (error) throw error;

      toast({
        title: "Request submitted",
        description: "Your help request has been submitted successfully",
      });

      setDescription("");
      setLocation("");
      setUrgentNeeds("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your location"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Situation Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your situation..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgentNeeds">Urgent Needs</Label>
        <Textarea
          id="urgentNeeds"
          value={urgentNeeds}
          onChange={(e) => setUrgentNeeds(e.target.value)}
          placeholder="List your immediate needs (food, water, shelter, medical, etc.)"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
};
