import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const requestSchema = z.object({
  location: z.string().trim().min(1, "Location is required").max(255, "Location must be less than 255 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  urgentNeeds: z.string().trim().max(2000, "Urgent needs must be less than 2000 characters").optional(),
});

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
      // Validate input
      const validated = requestSchema.parse({
        location,
        description,
        urgentNeeds: urgentNeeds || undefined,
      });

      const { error } = await supabase
        .from("victim_requests")
        .insert({
          user_id: userId,
          location: validated.location,
          description: validated.description,
          urgent_needs: validated.urgentNeeds || null,
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
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
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
          maxLength={255}
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
          maxLength={2000}
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
          maxLength={2000}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
};