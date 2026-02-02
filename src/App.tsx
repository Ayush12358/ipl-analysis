import { useState, useEffect } from 'react';
import { Zap, Settings, Trophy, BrainCircuit, Terminal, Sparkles, Loader2, MessageSquare, ListTree, FileText, ChevronDown, ChevronUp, Download, ClipboardCheck, Home as HomeIcon, Info, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { iplDatabase } from './data/database';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { initPyodide } from './lib/pyodideExecutor';
import { runAgentDeepAnalysis, AgentTurn } from './lib/agentOrchestrator';
import { switchToRealData } from './data/database';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// New View Components
import { HomeView } from './components/HomeView';
import { InfoView } from './components/InfoView';



export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentTurns, setAgentTurns] = useState<AgentTurn[]>([]);
  const [agentResult, setAgentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("GEMINI_API_KEY") || "");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    initPyodide().catch(console.error);
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("GEMINI_API_KEY", key);
    setIsSettingsOpen(false);
  };

  const handleToggleData = async () => {
    if (isRealData) {
      window.location.reload();
      return;
    }

    setIsLoadingData(true);
    const success = await switchToRealData();
    if (success) {
      setIsRealData(true);
    } else {
      setError("Failed to fetch real data. High-traffic or network issue.");
    }
    setIsLoadingData(false);
  };

  const exportToPDF = () => {
    if (!agentResult) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("IPL Strategy Report", 20, 20);
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Query: ${query}`, 20, 35);
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Executive Summary", 20, 50);
    doc.setFontSize(12);
    const splitSummary = doc.splitTextToSize(agentResult.executiveSummary, 170);
    doc.text(splitSummary, 20, 60);
    doc.setFontSize(16);
    doc.text("Detailed Analysis", 20, 100);
    doc.setFontSize(10);
    const splitAnalysis = doc.splitTextToSize(agentResult.detailedAnalysis, 170);
    doc.text(splitAnalysis, 20, 110);
    doc.save("IPL_Agent_Analysis.pdf");
  };

  const handleRunAgent = async () => {
    if (!query) return;
    setIsAnalyzing(true);
    setError(null);
    setAgentTurns([]);
    setAgentResult(null);

    try {
      const result = await runAgentDeepAnalysis(query, iplDatabase, (updatedTurns) => {
        setAgentTurns(updatedTurns);
      }, apiKey);
      setAgentResult(result);
    } catch (err: any) {
      setError(err.message || "The agent encountered an error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sansSelection">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 flex flex-col p-6 gap-8 z-20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Antigravity<span className="text-primary italic">IPL</span></h1>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: 'home', icon: HomeIcon, label: 'Home' },
            { id: 'ailab', icon: BrainCircuit, label: 'AI Strategy Lab' },
            { id: 'info', icon: Info, label: 'Project Info' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                ? 'bg-primary/10 text-primary border border-primary/20 glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">

          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Ayush" />
              <AvatarFallback>AY</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-white">Ayush</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-1.5 py-0 h-4 border-primary/30 text-[9px] bg-primary/10 text-primary uppercase font-bold tracking-tighter">Master Analyst</Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent)]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-slate-500 border-white/5 bg-white/5 px-4 h-9 font-mono text-[10px] tracking-widest uppercase">
              Phase: Investigation
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleData}
              disabled={isLoadingData}
              className={`rounded-full px-4 border-primary/20 h-9 ${isRealData ? 'bg-primary/20 text-primary font-bold' : 'text-slate-400'}`}
            >
              {isLoadingData ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
              {isRealData ? "DATA: REAL-TIME" : "DATA: STATIC"}
            </Button>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 h-9 flex items-center px-4 font-bold tracking-tight">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              Gemma-3-27B-IT
            </Badge>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#020617] border-white/10 text-white shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black italic uppercase italic">Lab <span className="text-primary">Settings</span></DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Google Gemini API Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                      className="bg-white/5 border-white/10 text-white focus:border-primary h-12 rounded-xl"
                    />
                    <p className="text-[10px] text-slate-500">Your key is stored locally in your browser and is never sent to our servers.</p>
                  </div>
                  <Button onClick={() => saveApiKey(apiKey)} className="h-12 rounded-xl font-bold uppercase tracking-widest">Update Configuration</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-8 pb-12">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <HomeView onStart={() => setActiveTab('ailab')} />
              </motion.div>
            )}

            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <InfoView />
              </motion.div>
            )}

            {activeTab === 'ailab' && (
              <motion.div
                key="ailab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6 max-w-6xl mx-auto"
              >
                {/* Agent Chat Input */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                  <Card className="relative bg-[#020617] border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <CardContent className="p-2 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center ml-2 border border-primary/20">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRunAgent()}
                        placeholder="e.g. Compare Mumbai Indians and CSK performance in powerplays..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-lg placeholder:text-slate-600 font-medium py-6"
                        disabled={isAnalyzing}
                      />
                      <Button
                        size="lg"
                        onClick={handleRunAgent}
                        disabled={isAnalyzing || !query || !apiKey}
                        className="rounded-2xl h-14 px-8 mr-2 bg-primary hover:bg-primary/90 glow disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!apiKey ? "Please configure API Key in Settings" : "Launch Analysis"}
                      >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        {isAnalyzing ? "Agent Reasoning..." : (!apiKey ? "Enter API Key" : "Launch Analysis")}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Results & Report */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <AnimatePresence>
                      {agentResult && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col gap-6"
                        >
                          {/* Executive Summary */}
                          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4">
                              <Sparkles className="w-8 h-8 text-primary opacity-20" />
                            </div>
                            <CardHeader>
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-primary" />
                                <Badge className="bg-primary hover:bg-primary uppercase font-black italic tracking-tighter">Summary</Badge>
                              </div>
                              <CardTitle className="text-2xl font-black italic tracking-tight leading-tight">
                                {agentResult.executiveSummary}
                              </CardTitle>
                            </CardHeader>
                          </Card>

                          {/* Mission Brief (Investigation Plan) */}
                          {agentResult.plan && (
                            <Card className="bg-[#020617] border-white/10 overflow-hidden">
                              <CardHeader className="bg-primary/10 border-b border-white/5 py-3">
                                <div className="flex items-center gap-2">
                                  <ClipboardCheck className="w-4 h-4 text-primary" />
                                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Mission Brief</CardTitle>
                                </div>
                              </CardHeader>
                              <CardContent className="p-6">
                                <p className="text-sm text-slate-300 italic mb-6 border-l-2 border-primary/30 pl-4 leading-relaxed">
                                  "{agentResult.plan.elaboration}"
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-tighter text-slate-500">Investigation Steps</h4>
                                    <ul className="space-y-2">
                                      {agentResult.plan.steps.map((step: string, idx: number) => (
                                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                          <span className="text-primary font-mono bg-primary/10 px-1.5 rounded flex-shrink-0">{idx + 1}</span>
                                          {step}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-tighter text-slate-500">Key Data Points</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {agentResult.plan.metrics.map((metric: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="bg-emerald-500/5 text-emerald-400/80 border-emerald-500/20 font-mono text-[10px]">
                                          {metric}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Data Visualization */}
                          <Card className="bg-white/5 border-white/5 overflow-hidden">
                            <CardHeader className="border-b border-white/5">
                              <CardTitle className="text-lg font-bold tracking-tight">Analytical Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[400px] p-8">
                              <ResponsiveContainer width="100%" height="100%">
                                {agentResult.finalResult?.chartType === 'bar' ? (
                                  <BarChart data={agentResult.finalResult.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                    <RechartsTooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                  </BarChart>
                                ) : (
                                  <AreaChart data={agentResult.finalResult?.chartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                    <RechartsTooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} />
                                  </AreaChart>
                                )}
                              </ResponsiveContainer>
                            </CardContent>
                          </Card>

                          {/* Full Report Area */}
                          <Card className="bg-white/5 border-white/5 overflow-hidden">
                            <CardHeader className="bg-white/5 flex flex-row items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <CardTitle className="text-lg flex items-center gap-2 font-bold tracking-tight">
                                  <Zap className="w-4 h-4 text-yellow-500" />
                                  Strategic Analysis
                                </CardTitle>
                                {agentResult.evaluation && (
                                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${agentResult.evaluation.isAdequate ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    <Badge variant="outline" className={`${agentResult.evaluation.isAdequate ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'} px-2 py-0 h-4`}>
                                      {agentResult.evaluation.isAdequate ? 'Audit: Passed' : 'Audit: Warning'}
                                    </Badge>
                                    <span className="opacity-60 line-clamp-1 font-medium italic lowercase first-letter:uppercase">{agentResult.evaluation.feedback}</span>
                                  </div>
                                )}
                              </div>
                              <Button variant="ghost" size="sm" onClick={exportToPDF} className="text-slate-400 hover:text-white rounded-full">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                            </CardHeader>
                            <CardContent className="p-8 prose prose-invert max-w-none">
                              <div className="text-slate-300 leading-relaxed space-y-4 text-justify">
                                {agentResult.detailedAnalysis.split('\n').map((para: string, i: number) => (
                                  <p key={i}>{para}</p>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!agentResult && !isAnalyzing && (
                      <Card className="flex-1 flex flex-col items-center justify-center min-h-[500px] text-slate-600 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                        <BrainCircuit size={64} className="mb-4 opacity-10" />
                        <h3 className="text-lg font-bold text-slate-400">Ready for Strategy Session</h3>
                        <p className="text-sm text-slate-500 max-w-xs text-center mt-2">Ask about match trends, tactical patterns, or player consistency scores.</p>
                      </Card>
                    )}

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-3 mt-4">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Reasoning Log */}
                  <div className="flex flex-col gap-6">
                    <Card className="bg-[#020617] border-white/5 h-full flex flex-col shadow-xl">
                      <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                          <ListTree className="w-4 h-4 text-primary" />
                          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Reasoning Log</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setShowReasoning(!showReasoning)}
                        >
                          {showReasoning ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                      </CardHeader>
                      <CardContent className={`p-0 flex-1 transition-all ${showReasoning ? 'h-auto' : 'h-0 overflow-hidden'}`}>
                        <ScrollArea className="h-[700px] px-6 py-4">
                          <div className="flex flex-col gap-10 py-4">
                            {agentTurns.map((turn: AgentTurn, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col gap-3 relative"
                              >
                                {i !== agentTurns.length - 1 && (
                                  <div className="absolute left-[11px] top-8 bottom-[-40px] w-0.5 bg-primary/10"></div>
                                )}
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${turn.observation.includes('Error') ? 'bg-red-500/20 text-red-500 border-red-500/40' : 'bg-primary/20 text-primary border-primary/40'
                                    } border-2`}>
                                    {i + 1}
                                  </div>
                                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest leading-none">Turn {i + 1}</span>
                                </div>
                                <div className="pl-6 flex flex-col gap-4">
                                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    {turn.thought}
                                  </p>
                                  <div className="bg-black/80 rounded-2xl overflow-hidden border border-white/5">
                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Python Action</span>
                                      <Terminal size={10} className="text-slate-600" />
                                    </div>
                                    <pre className="text-emerald-400 p-4 font-mono text-[9px] overflow-x-auto custom-scrollbar italic">{turn.code}</pre>
                                  </div>
                                  <div className={`text-[9px] font-bold px-3 py-1.5 rounded-lg w-fit flex items-center gap-2 ${turn.observation.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-primary/5 text-primary/80 border border-primary/10'
                                    }`}>
                                    <span className={`w-1 h-1 rounded-full ${turn.observation.includes('Error') ? 'bg-red-500' : 'bg-primary'}`}></span>
                                    {turn.observation}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main >
    </div >
  );
}
