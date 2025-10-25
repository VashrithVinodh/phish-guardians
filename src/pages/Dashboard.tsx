import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown, Target, Clock, Award, ArrowLeft, Trophy } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data - in production this would come from Snowflake
  const prePhaseData = {
    clickRate: 75,
    avgResponseTime: 8.5,
    accuracy: 45
  };

  const postPhaseData = {
    clickRate: 28,
    avgResponseTime: 5.2,
    accuracy: 85
  };

  const improvement = {
    clickRate: ((prePhaseData.clickRate - postPhaseData.clickRate) / prePhaseData.clickRate * 100).toFixed(0),
    responseTime: ((prePhaseData.avgResponseTime - postPhaseData.avgResponseTime) / prePhaseData.avgResponseTime * 100).toFixed(0),
    accuracy: ((postPhaseData.accuracy - prePhaseData.accuracy) / prePhaseData.accuracy * 100).toFixed(0)
  };

  const clickRateData = [
    { phase: "Before", rate: prePhaseData.clickRate },
    { phase: "After", rate: postPhaseData.clickRate }
  ];

  const responseTimeData = [
    { phase: "Before", time: prePhaseData.avgResponseTime },
    { phase: "After", time: postPhaseData.avgResponseTime }
  ];

  const themePerformance = [
    { theme: "Sci-Fi", accuracy: 88, total: 45 },
    { theme: "Finance", accuracy: 82, total: 38 },
    { theme: "Campus", accuracy: 91, total: 52 }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-primary animate-glow" />
              Training Impact Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Measurable improvement in phishing defense capabilities
            </p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-primary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary/20 shadow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent" />
            <CardHeader className="relative">
              <CardDescription>Phishing Click Rate</CardDescription>
              <CardTitle className="text-4xl flex items-baseline gap-2">
                <TrendingDown className="w-8 h-8 text-destructive" />
                {postPhaseData.clickRate}%
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center gap-2">
                <Badge className="bg-accent text-accent-foreground">
                  ↓ {improvement.clickRate}% reduction
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                From {prePhaseData.clickRate}% before training
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <CardHeader className="relative">
              <CardDescription>Avg Response Time</CardDescription>
              <CardTitle className="text-4xl flex items-baseline gap-2">
                <Clock className="w-8 h-8 text-primary" />
                {postPhaseData.avgResponseTime}s
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center gap-2">
                <Badge className="bg-accent text-accent-foreground">
                  ↓ {improvement.responseTime}% faster
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                From {prePhaseData.avgResponseTime}s before training
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
            <CardHeader className="relative">
              <CardDescription>Detection Accuracy</CardDescription>
              <CardTitle className="text-4xl flex items-baseline gap-2">
                <Target className="w-8 h-8 text-accent" />
                {postPhaseData.accuracy}%
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center gap-2">
                <Badge className="bg-accent text-accent-foreground">
                  ↑ {improvement.accuracy}% increase
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                From {prePhaseData.accuracy}% before training
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-primary/20 shadow-card">
            <CardHeader>
              <CardTitle>Click Rate: Before vs After</CardTitle>
              <CardDescription>Lower is better</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clickRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="phase" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                    {clickRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--destructive))" : "hsl(var(--accent))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-card">
            <CardHeader>
              <CardTitle>Response Time: Before vs After</CardTitle>
              <CardDescription>Average time to report threats (seconds)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="phase" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="time" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Theme Performance */}
        <Card className="border-primary/20 shadow-card">
          <CardHeader>
            <CardTitle>Performance by Theme</CardTitle>
            <CardDescription>Detection accuracy across different scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {themePerformance.map((theme, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{theme.theme}</span>
                    <span className="text-sm text-muted-foreground">
                      {theme.accuracy}% ({theme.total} scenarios)
                    </span>
                  </div>
                  <Progress value={theme.accuracy} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievement Badge */}
        <div className="mt-8 text-center">
          <Card className="border-primary shadow-glow inline-block">
            <CardContent className="pt-6">
              <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Phishing Defense Expert</h3>
              <p className="text-muted-foreground mb-4">
                You've completed the training with {postPhaseData.accuracy}% accuracy
              </p>
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2 text-lg">
                Certified Defender
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
