import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface VolunteerRegistrationFormProps {
  userId: string;
}

const commonSkills = [
  "Medical Aid",
  "First Aid",
  "Rescue Operations",
  "Logistics",
  "Transportation",
  "Communication",
  "Food Distribution",
  "Shelter Management",
  "Child Care",
  "Counseling",
];

export const VolunteerRegistrationForm = ({ userId }: VolunteerRegistrationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadExistingProfile();
  }, [userId]);

  const loadExistingProfile = async () => {
    const { data } = await supabase
      .from("volunteers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setExisting(data);
      setSkills(data.skills || []);
      setLocation(data.location || "");
      setAvailability(data.availability || "");
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existing) {
        const { error } = await supabase
          .from("volunteers")
          .update({
            skills,
            location,
            availability,
          })
          .eq("id", existing.id);

        if (error) throw error;

        toast({
          title: "Profile updated",
          description: "Your volunteer profile has been updated",
        });
      } else {
        const { error } = await supabase
          .from("volunteers")
          .insert({
            user_id: userId,
            skills,
            location,
            availability,
          });

        if (error) throw error;

        toast({
          title: "Registration successful",
          description: "You're now registered as a volunteer",
        });
      }

      loadExistingProfile();
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
        <Label>Skills *</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {commonSkills.map((skill) => (
            <Badge
              key={skill}
              variant={skills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                skills.includes(skill) ? removeSkill(skill) : addSkill(skill)
              }
            >
              {skill}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add custom skill..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill(newSkill);
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => addSkill(newSkill)}
          >
            Add
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <Badge key={skill} className="gap-1">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Your location"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability *</Label>
        <Input
          id="availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="e.g., Weekends, Full-time, On-call"
          required
        />
      </div>

      <Button type="submit" disabled={loading || skills.length === 0} className="w-full">
        {loading ? "Saving..." : existing ? "Update Profile" : "Register as Volunteer"}
      </Button>
    </form>
  );
};
