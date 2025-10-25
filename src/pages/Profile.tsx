import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Zap, Trophy, Target } from "lucide-react";

const themes = [
  { id: "sci_fi", name: "Sci-Fi Space Mission", icon: "🚀" },
  { id: "sports", name: "Sports Team", icon: "⚽" },
  { id: "campus", name: "Campus Life", icon: "🎓" },
  { id: "hr", name: "Human Resources", icon: "💼" },
  { id: "finance", name: "Finance & Banking", icon: "💰" },
  { id: "shipping", name: "Package Delivery", icon: "📦" }
];

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [difficulty, setDifficulty] = useState("Auto");

  const handleStart = () => {
    if (!userId || !selectedTheme) return;
    
    localStorage.setItem("phishplay_user", userId);
    localStorage.setItem("phishplay_theme", selectedTheme);
    localStorage.setItem("phishplay_difficulty", difficulty);
    localStorage.setItem("phishplay_phase", "pre");
    localStorage.setItem("phishplay_score", "0");
    
    navigate("/inbox");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary animate-glow" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PhishPlay
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Master cybersecurity through interactive phishing defense training
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Real-Time Analysis</h3>
              <p className="text-sm text-muted-foreground">AI-powered threat detection</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <Trophy className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold mb-1">Track Progress</h3>
              <p className="text-sm text-muted-foreground">Measure your improvement</p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-warning mb-2" />
              <h3 className="font-semibold mb-1">Adaptive Learning</h3>
              <p className="text-sm text-muted-foreground">Personalized difficulty</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 shadow-card">
          <CardHeader>
            <CardTitle>Setup Your Training Profile</CardTitle>
            <CardDescription>
              Choose your preferences to begin the phishing defense challenge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId">Your Name or ID</Label>
              <Input
                id="userId"
                placeholder="Enter your identifier"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label>Select Training Theme</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTheme === theme.id
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border hover:border-primary/50 bg-card/50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{theme.icon}</div>
                    <div className="text-sm font-medium">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty" className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto (Adaptive)</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStart}
              disabled={!userId || !selectedTheme}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold py-6 text-lg shadow-glow"
            >
              Start Training Mission
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>🔒 Secure training environment • All data encrypted • Privacy protected</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
