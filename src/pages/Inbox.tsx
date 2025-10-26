import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardFooter, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const phishingElements = [
  { id: "urgency_tactic", label: "Urgency/Pressure Tactics" },
  { id: "impersonation_brand", label: "Brand Impersonation" },
  { id: "suspicious_link", label: "Suspicious Link/URL" },
  { id: "credential_theft", label: "Credential Request" },
  { id: "suspicious_domain", label: "Suspicious Sender Domain" },
  { id: "threatening_language", label: "Threats/Consequences" },
  { id: "generic_greeting", label: "Generic Greeting" },
  { id: "poor_grammar", label: "Poor Grammar/Spelling" }
];

const Inbox = () => {
  const userId = localStorage.getItem("phishplay_user") || "demo";

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [highlightedBody, setHighlightedBody] = useState("");
  const [showElementSelection, setShowElementSelection] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [detectedCues, setDetectedCues] = useState<string[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [userAction, setUserAction] = useState<"report" | "trust" | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Calculate statistics
  const accuracyRate = completedCount > 0 ? (correctCount / completedCount) * 100 : 0;
  const progressPercentage = Math.min((totalPoints / 100) * 100, 100);
  const averageScore = completedCount > 0 ? totalPoints / completedCount : 0;

  useEffect(() => {
    loadNewScenario();
  }, []);

  const loadNewScenario = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/next_email/${userId}`);
      if (!res.ok) throw new Error("No more emails");
      const scenario = await res.json();
      console.log("Loaded scenario:", scenario);
      setCurrentScenario(scenario);
      setStartTime(Date.now());
      setShowAnalysis(false);
      setShowElementSelection(false);
      setRiskScore(null);
      setDetectedCues([]);
      setHighlightedBody("");
      setSelectedElements([]);
      setUserAction(null);
      setIsCorrect(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load scenario");
    }
  };

  const toggleElementSelection = (elementId: string) => {
    if (selectedElements.includes(elementId)) {
      setSelectedElements(selectedElements.filter(e => e !== elementId));
    } else {
      setSelectedElements([...selectedElements, elementId]);
    }
  };

  const analyzeMessage = (scenario: Scenario) => {
    const baseScore = scenario.is_phishing ? 0.65 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2;
    setRiskScore(baseScore);
    setDetectedCues(scenario.cues);

    const cuePatterns: {[key: string]: string[]} = {
      urgency_tactic: ["immediately", "within 24 hours", "urgent", "as soon as possible", "temporarily suspended", "permanent closure", "verify immediately", "action required"],
      impersonation_brand: ["microsoft", "google", "apple", "amazon", "paypal", "bank", "security team", "support team"],
      suspicious_link: ["http://", "click here", "verify your account", "login now", "http://microsoft", "http://apple", "verify now"],
      credential_theft: ["verify your identity", "confirm your password", "login credentials", "account verification", "security check"],
      threatening_language: ["account closure", "suspended", "permanent loss", "terminated", "locked out", "restricted access"],
      generic_greeting: ["dear user", "valued customer", "dear account holder", "hello", "dear valued user"],
      poor_grammar: []
    };

    let highlighted = scenario.body;
    
    scenario.cues.forEach(cue => {
      const patterns = cuePatterns[cue] || [];
      patterns.forEach(pattern => {
        const regex = new RegExp(`(${pattern})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 text-black px-1 rounded">$1</mark>');
      });
    });

    setHighlightedBody(highlighted);
  };

  const handleAction = (action: "report" | "trust") => {
    if (!currentScenario) return;
    setUserAction(action);

    if (action === "report" && currentScenario.is_phishing) {
      setShowElementSelection(true);
    } else {
      submitFinalAnswer(action);
    }
  };

  const submitFinalAnswer = (action: "report" | "trust") => {
    if (!currentScenario) return;

    analyzeMessage(currentScenario);
    setShowAnalysis(true);
    setShowElementSelection(false);

    const correctIdentification = (action === "report" && currentScenario.is_phishing) ||
                                  (action === "trust" && !currentScenario.is_phishing);

    setIsCorrect(correctIdentification);

    let elementScore = 0;
    if (action === "report" && currentScenario.is_phishing) {
      elementScore = selectedElements.filter(el => currentScenario.cues.includes(el)).length;
    }

    const basePoints = correctIdentification ? 10 : 0;
    const pointsEarned = basePoints + elementScore * 5;

    setCompletedCount(prev => prev + 1);
    setCorrectCount(prev => correctIdentification ? prev + 1 : prev);
    setTotalPoints(prev => prev + pointsEarned);

    const cuePatterns: {[key: string]: string[]} = {
      urgency_tactic: ["immediately", "within 24 hours", "urgent", "as soon as possible", "temporarily suspended", "permanent closure", "verify immediately", "action required"],
      impersonation_brand: ["microsoft", "google", "apple", "amazon", "paypal", "bank", "security team", "support team"],
      suspicious_link: ["http://", "click here", "verify your account", "login now", "http://microsoft", "http://apple", "verify now"],
      credential_theft: ["verify your identity", "confirm your password", "login credentials", "account verification", "security check"],
      threatening_language: ["account closure", "suspended", "permanent loss", "terminated", "locked out", "restricted access"],
      generic_greeting: ["dear user", "valued customer", "dear account holder", "hello", "dear valued user"],
      poor_grammar: []
    };

    let highlighted = currentScenario.body;
    
    currentScenario.cues.forEach(cue => {
      const patterns = cuePatterns[cue] || [];
      patterns.forEach(pattern => {
        const regex = new RegExp(`(${pattern})`, 'gi');
        if (selectedElements.includes(cue)) {
          highlighted = highlighted.replace(regex, '<mark class="bg-green-300 px-1 rounded">$1</mark>');
        } else {
          highlighted = highlighted.replace(regex, '<mark class="bg-red-300 px-1 rounded">$1</mark>');
        }
      });
    });
    setHighlightedBody(highlighted);

    fetch("http://127.0.0.1:8000/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        action,
        score: pointsEarned,
        message_hash: currentScenario.id,
        selected_elements: selectedElements
      })
    }).catch(err => console.error(err));

    toast.success(`You earned ${pointsEarned} points!`);
  };

  const renderEmailBody = () => {
    if (!currentScenario) return null;
    
    if (highlightedBody) {
      return (
        <div 
          className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-6 p-4 border border-gray-600 rounded-lg bg-gray-800 text-white"
          dangerouslySetInnerHTML={{ __html: highlightedBody }} 
        />
      );
    }
    
    return (
      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-6 p-4 border border-gray-600 rounded-lg bg-gray-800 text-white">
        {currentScenario.body || "No email content available"}
      </div>
    );
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto mt-8">
      {/* Main Content - Email */}
      <div className="flex-1">
        {currentScenario ? (
          <Card className="shadow-xl border border-gray-700 hover:shadow-2xl transition-shadow duration-300 bg-gray-900">
            <CardHeader className="bg-gray-800 rounded-t-md border-b border-gray-700">
              <CardTitle className="text-xl font-bold text-white">{currentScenario.subject}</CardTitle>
              <CardDescription className="text-sm text-gray-300">From: {currentScenario.sender}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 p-6">
              {renderEmailBody()}

              {!showAnalysis && !showElementSelection && (
                <div className="flex gap-4 justify-end mt-6 pt-4 border-t border-gray-700">
                  <Button variant="destructive" className="px-8 py-2 font-semibold" onClick={() => handleAction("report")}>Report</Button>
                  <Button variant="outline" className="px-8 py-2 font-semibold border-gray-600 text-white hover:bg-gray-700" onClick={() => handleAction("trust")}>Trust</Button>
                </div>
              )}

              {showElementSelection && !showAnalysis && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="font-semibold mb-3 text-gray-300">Select the phishing elements you found:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {phishingElements.map(el => (
                      <Button
                        key={el.id}
                        variant={selectedElements.includes(el.id) ? "destructive" : "outline"}
                        className="truncate px-2 py-1 text-sm border-gray-600 text-white hover:bg-gray-700"
                        onClick={() => toggleElementSelection(el.id)}
                      >
                        {el.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button className="px-6 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => submitFinalAnswer("report")}>Submit Analysis</Button>
                  </div>
                </div>
              )}

              {showAnalysis && (
                <div className="mt-6 space-y-4 pt-4 border-t border-gray-700">
                  {/* Correct/Wrong Feedback */}
                  <div className={`p-4 rounded-lg border-2 ${
                    isCorrect 
                      ? 'bg-green-900/20 border-green-500 text-green-400' 
                      : 'bg-red-900/20 border-red-500 text-red-400'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {isCorrect ? 'Correct!' : 'Incorrect!'}
                        </div>
                        <div className="text-sm">
                          {isCorrect 
                            ? `You correctly identified this as a ${currentScenario.is_phishing ? 'phishing' : 'legitimate'} email.`
                            : `This was actually a ${currentScenario.is_phishing ? 'phishing' : 'legitimate'} email.`
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Score and Cues */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="destructive">Risk Score: {riskScore?.toFixed(2)}</Badge>
                    {detectedCues.map(cue => (
                      <Badge key={cue} variant="outline" className="border-gray-600 text-gray-300">
                        {phishingElements.find(el => el.id === cue)?.label || cue}
                      </Badge>
                    ))}
                  </div>

                  {/* Element Selection Feedback */}
                  {userAction === "report" && currentScenario.is_phishing && (
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="font-semibold mb-2 text-gray-300">Your Element Analysis:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {currentScenario.cues.map(cue => (
                          <div key={cue} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              selectedElements.includes(cue) ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span className="text-gray-300">
                              {phishingElements.find(el => el.id === cue)?.label || cue}
                            </span>
                            <span className="text-xs text-gray-500">
                              {selectedElements.includes(cue) ? '(selected)' : '(missed)'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            {showAnalysis && (
              <CardFooter className="justify-end border-t border-gray-700 pt-4">
                <Button className="px-6 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white" onClick={loadNewScenario}>
                  Next Message
                </Button>
              </CardFooter>
            )}
          </Card>
        ) : (
          <div className="text-center text-gray-400 text-lg mt-20">Loading scenario...</div>
        )}
      </div>

      {/* Statistics Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Card className="shadow-lg border border-gray-700 sticky top-8 bg-gray-900">
          <CardHeader className="bg-gray-800 rounded-t-md border-b border-gray-700">
            <CardTitle className="text-lg font-bold text-white">Your Progress</CardTitle>
            <CardDescription className="text-gray-300">Track your phishing detection skills</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Points Progress</span>
                <span className="text-sm font-bold text-blue-400">{totalPoints}/100 points</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-gray-700" />
              <div className="text-xs text-gray-400 text-center">
                {progressPercentage >= 100 ? "Goal achieved! 🎉" : `${Math.round(progressPercentage)}% to goal`}
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                <div className="text-xs text-green-300 font-medium">Emails Analyzed</div>
              </div>
              
              <div className="text-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-blue-400">{correctCount}</div>
                <div className="text-xs text-blue-300 font-medium">Correct Identifications</div>
              </div>
              
              <div className="text-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">{accuracyRate.toFixed(1)}%</div>
                <div className="text-xs text-purple-300 font-medium">Accuracy Rate</div>
              </div>
              
              <div className="text-center p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-2xl font-bold text-orange-400">{averageScore.toFixed(1)}</div>
                <div className="text-xs text-orange-300 font-medium">Avg. Score</div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="text-center p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-600">
              <div className="text-sm font-semibold text-gray-300 mb-1">Current Performance</div>
              <div className="text-lg font-bold text-indigo-400">
                {accuracyRate >= 80 ? "Excellent! 🏆" : 
                 accuracyRate >= 60 ? "Good Job! 👍" : 
                 accuracyRate >= 40 ? "Keep Going! 💪" : 
                 "Practice More! 📚"}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Points:</span>
                <span className="font-semibold text-white">{totalPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Emails Remaining:</span>
                <span className="font-semibold text-white">∞</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current Level:</span>
                <span className="font-semibold text-white">
                  {totalPoints >= 80 ? "Expert" :
                   totalPoints >= 60 ? "Advanced" :
                   totalPoints >= 40 ? "Intermediate" :
                   totalPoints >= 20 ? "Beginner" : "Newbie"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inbox;