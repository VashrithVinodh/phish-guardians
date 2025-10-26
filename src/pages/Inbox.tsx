import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, Mail, Clock, Target, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Scenario {
  id: string;
  theme: string;
  sender: string;
  subject: string;
  body: string;
  cues: string[];
  difficulty: string;
  is_phishing: boolean;
}

const mockScenarios: Record<string, Scenario[]> = {
  sci_fi: [
    {
      id: "sci_01",
      theme: "sci_fi",
      sender: "mission-control@orbit-sec.space",
      subject: "🚨 URGENT: Docking Clearance Required",
      body: "Commander, we need immediate authorization for docking sequence DS-14. Security protocol requires your credentials within the next 10 minutes or the mission will be aborted. Click here to verify: http://orbit-sec.verification.xyz",
      cues: ["urgency", "suspicious_link", "credential_request"],
      difficulty: "Medium",
      is_phishing: true
    },
    {
      id: "sci_02",
      theme: "sci_fi",
      sender: "crew-manifest@station-ops.space",
      subject: "Weekly Crew Rotation Schedule",
      body: "This week's rotation schedule is attached. Please review the shift assignments for Module Ares. Contact station operations if you have any conflicts.",
      cues: [],
      difficulty: "Easy",
      is_phishing: false
    }
  ],
  finance: [
    {
      id: "fin_01",
      theme: "finance",
      sender: "security@paypal-verify.com",
      subject: "Account Suspended - Immediate Action Required",
      body: "Your account has been temporarily suspended due to unusual activity. To restore access, please verify your identity immediately by clicking the link below and entering your account details.",
      cues: ["urgency", "suspicious_domain", "credential_request"],
      difficulty: "Hard",
      is_phishing: true
    }
  ],
  campus: [
    {
      id: "cam_01",
      theme: "campus",
      sender: "registrar@university.edu",
      subject: "Registration Confirmation",
      body: "Your course registration for Spring 2025 has been confirmed. You are enrolled in 15 credits. View your schedule on the student portal.",
      cues: [],
      difficulty: "Easy",
      is_phishing: false
    }
  ]
};

const phishingElements = [
  { id: "urgency", label: "Urgency/Pressure Tactics", description: "Creates false sense of urgency" },
  { id: "suspicious_link", label: "Suspicious Link/URL", description: "Unusual or mismatched domain" },
  { id: "credential_request", label: "Credential Request", description: "Asks for passwords or personal info" },
  { id: "suspicious_domain", label: "Suspicious Sender Domain", description: "Email address looks fake or altered" },
  { id: "threatening_language", label: "Threats/Consequences", description: "Threatens account closure or penalties" },
  { id: "generic_greeting", label: "Generic Greeting", description: "Uses 'Dear User' instead of your name" },
  { id: "poor_grammar", label: "Poor Grammar/Spelling", description: "Contains obvious mistakes" },
  { id: "unexpected_attachment", label: "Unexpected Attachment", description: "Suspicious file attachment" }
];

const Inbox = () => {
  const navigate = useNavigate();
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [detectedCues, setDetectedCues] = useState<string[]>([]);
  const [highlightedBody, setHighlightedBody] = useState<string>("");
  const [completedCount, setCompletedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  
  // New states for phishing element selection
  const [userAction, setUserAction] = useState<"report" | "trust" | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [showElementSelection, setShowElementSelection] = useState(false);

  const userId = localStorage.getItem("phishplay_user") || "demo";
  const theme = localStorage.getItem("phishplay_theme") || "sci_fi";
  const phase = localStorage.getItem("phishplay_phase") || "pre";

  useEffect(() => {
    if (!userId || !theme) {
      navigate("/");
      return;
    }
    loadNewScenario();
  }, []);

  const loadNewScenario = () => {
    const scenarios = mockScenarios[theme] || mockScenarios.sci_fi;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCurrentScenario(scenario);
    setStartTime(Date.now());
    setShowAnalysis(false);
    setRiskScore(null);
    setDetectedCues([]);
    setHighlightedBody("");
    setUserAction(null);
    setSelectedElements([]);
    setShowElementSelection(false);
  };

  const analyzeMessage = (scenario: Scenario) => {
    // Mock ML analysis
    const baseScore = scenario.is_phishing ? 0.65 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2;
    setRiskScore(baseScore);
    setDetectedCues(scenario.cues);

    // Highlight risky tokens
    let highlighted = scenario.body;
    const riskyTerms = ["urgent", "immediately", "click here", "verify", "suspended", "credentials", "authorization"];
    riskyTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-destructive/30 text-destructive-foreground px-1 rounded">$1</mark>');
    });
    setHighlightedBody(highlighted);
  };

  const toggleElementSelection = (elementId: string) => {
    if (selectedElements.includes(elementId)) {
      setSelectedElements(selectedElements.filter(e => e !== elementId));
    } else {
      setSelectedElements([...selectedElements, elementId]);
    }
  };

  const handleAction = (action: "report" | "trust") => {
    if (!currentScenario) return;
    
    setUserAction(action);

    // If user reports as phishing, show element selection
    if (action === "report" && currentScenario.is_phishing) {
      setShowElementSelection(true);
    } else {
      // If trusting or wrong report, proceed to analysis
      submitFinalAnswer(action);
    }
  };

  const submitFinalAnswer = (action: "report" | "trust") => {
    if (!currentScenario) return;

    const timeMs = Date.now() - startTime;
    analyzeMessage(currentScenario);
    setShowAnalysis(true);

    // Determine if correct
    const correctIdentification = (action === "report" && currentScenario.is_phishing) || 
                                  (action === "trust" && !currentScenario.is_phishing);
    
    // Calculate element selection accuracy
    let elementScore = 0;
    let elementPoints = 0;
    if (action === "report" && currentScenario.is_phishing && selectedElements.length > 0) {
      const correctElements = selectedElements.filter(el => currentScenario.cues.includes(el));
      elementScore = correctElements.length;
      elementPoints = elementScore * 5; // 5 points per correct element
    }

    const basePoints = correctIdentification ? 10 : 0;
    const totalPoints = basePoints + elementPoints;

    const newCompleted = completedCount + 1;
    const newCorrect = correctIdentification ? correctCount + 1 : correctCount;
    setCompletedCount(newCompleted);
    setCorrectCount(newCorrect);

    // Log event (mock)
    console.log({
      user_id: userId,
      scenario_id: currentScenario.id,
      phase,
      action,
      time_ms: timeMs,
      score: riskScore,
      correct: correctIdentification,
      selected_elements: selectedElements,
      element_score: elementScore,
      total_points: totalPoints
    });

    if (correctIdentification) {
      toast.success(`Correct! +${totalPoints} points`, {
        description: elementPoints > 0 
          ? `Identified ${elementScore}/${currentScenario.cues.length} phishing elements correctly`
          : `Response time: ${(timeMs / 1000).toFixed(1)}s`
      });
    } else {
      toast.error("Incorrect", {
        description: "Review the analysis to learn more"
      });
    }
  };

  const handleSubmitElements = () => {
    if (!userAction) return;
    submitFinalAnswer(userAction);
    setShowElementSelection(false);
  };

  const handleNext = () => {
    if (completedCount >= 10) {
      navigate("/dashboard");
    } else {
      loadNewScenario();
    }
  };

  if (!currentScenario) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse">Loading scenario...</div>
    </div>;
  }

  const accuracy = completedCount > 0 ? (correctCount / completedCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="w-8 h-8 text-primary" />
              Training Inbox
            </h1>
            <p className="text-muted-foreground">Identify threats before they strike</p>
          </div>
          <div className="flex gap-4">
            <Badge variant="outline" className="px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              {completedCount}/10
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              {accuracy.toFixed(0)}% Accuracy
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Message Card */}
          <div className="md:col-span-2">
            <Card className="border-primary/20 shadow-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-2">
                      From: {currentScenario.sender}
                    </div>
                    <CardTitle className="text-2xl">{currentScenario.subject}</CardTitle>
                  </div>
                  <Badge variant="secondary">{currentScenario.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className="text-lg leading-relaxed mb-6 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: showAnalysis ? highlightedBody : currentScenario.body 
                  }}
                />

                {/* Element Selection UI */}
                {showElementSelection && !showAnalysis && (
                  <div className="mb-6 p-6 bg-muted/50 rounded-lg border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <h3 className="font-bold text-lg">Identify Phishing Elements</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select all suspicious elements you found in this email. Each correct element earns 5 bonus points!
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {phishingElements.map((element) => (
                        <button
                          key={element.id}
                          onClick={() => toggleElementSelection(element.id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedElements.includes(element.id)
                              ? 'bg-primary text-primary-foreground border-primary shadow-md'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              selectedElements.includes(element.id)
                                ? 'bg-primary-foreground border-primary-foreground'
                                : 'border-muted-foreground'
                            }`}>
                              {selectedElements.includes(element.id) && (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold mb-1">{element.label}</div>
                              <div className="text-xs opacity-80">{element.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={handleSubmitElements}
                      className="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
                      disabled={selectedElements.length === 0}
                    >
                      Submit Analysis ({selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected)
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                {!showAnalysis && !showElementSelection && (
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleAction("report")}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground py-6 text-lg"
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Report as Phishing
                    </Button>
                    <Button
                      onClick={() => handleAction("trust")}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg"
                    >
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Trust Message
                    </Button>
                  </div>
                )}

                {/* Next Button */}
                {showAnalysis && (
                  <Button
                    onClick={handleNext}
                    className="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
                  >
                    {completedCount >= 10 ? "View Dashboard" : "Next Message"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            <Card className="border-primary/20 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Threat Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {showAnalysis && riskScore !== null ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Risk Score</span>
                        <span className="text-lg font-bold">
                          {(riskScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={riskScore * 100} 
                        className={`h-3 ${
                          riskScore > 0.6 ? "bg-destructive/20" : 
                          riskScore > 0.3 ? "bg-warning/20" : "bg-accent/20"
                        }`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Safe</span>
                        <span>Danger</span>
                      </div>
                    </div>

                    {detectedCues.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Actual Phishing Elements:</h4>
                        <div className="space-y-2">
                          {detectedCues.map((cue, idx) => {
                            const wasSelected = selectedElements.includes(cue);
                            return (
                              <div key={idx} className="flex items-center gap-2">
                                <Badge 
                                  variant={wasSelected ? "default" : "destructive"}
                                  className="flex-1"
                                >
                                  {cue.replace(/_/g, " ")}
                                </Badge>
                                {wasSelected ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <span className="text-xs text-muted-foreground">(Missed)</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {selectedElements.length > 0 && (
                          <div className="mt-3 text-sm">
                            <span className="font-medium">Your Score: </span>
                            <span className="text-accent font-bold">
                              {selectedElements.filter(el => detectedCues.includes(el)).length}/{detectedCues.length} correct
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">🛡️ Security Tip:</h4>
                      <p className="text-sm">
                        {riskScore > 0.6 
                          ? "High-risk indicators detected. Always verify sender identity before clicking links or providing credentials."
                          : riskScore > 0.3
                          ? "Some suspicious elements found. When in doubt, contact the sender through official channels."
                          : "This message appears legitimate. Continue to stay vigilant with all communications."
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Make your decision to see the analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Completed</span>
                    <span className="font-bold">{completedCount}/10</span>
                  </div>
                  <Progress value={(completedCount / 10) * 100} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span className="font-bold text-accent">{accuracy.toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;