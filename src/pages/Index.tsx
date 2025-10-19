import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, Heart, AlertCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-full">
              <Shield className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">Disaster Relief Management System</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connecting volunteers, resources, and communities during emergencies
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-card rounded-lg border">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Request Help</h3>
            <p className="text-muted-foreground">Submit help requests during emergencies</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <Users className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="text-xl font-semibold mb-2">Volunteer</h3>
            <p className="text-muted-foreground">Register and respond to disaster calls</p>
          </div>
          <div className="text-center p-6 bg-card rounded-lg border">
            <Heart className="h-12 w-12 mx-auto mb-4 text-success" />
            <h3 className="text-xl font-semibold mb-2">Donate</h3>
            <p className="text-muted-foreground">Support relief campaigns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
