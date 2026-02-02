import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Zap, Settings, Search, Trophy, BrainCircuit, Terminal, Sparkles, Loader2, MessageSquare, ListTree, FileText, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const momentumData: any[] = [
  // ... existing data
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentTurns, setAgentTurns] = useState<AgentTurn[]>([]);
  const [agentResult, setAgentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(true);
  const [isRealData, setIsRealData] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    initPyodide().catch(console.error);
  }, []);

  const handleToggleData = async () => {
    if (isRealData) {
      window.location.reload(); // Simplest way to reset to mock
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
      });
      setAgentResult(result);
    } catch (err: any) {
      setError(err.message || "The agent encountered an error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sans">
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
            { id: 'dashboard', icon: LayoutDashboard, label: 'Analytics Hub' },
            { id: 'ailab', icon: BrainCircuit, label: 'AI Strategy Lab' },
            { id: 'teams', icon: Users, label: 'Team Matrix' },
            { id: 'predictions', icon: Zap, label: 'Win Oracle' },
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
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-white/5">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-bold">Model: Gemma 3-27B</p>
            <p className="text-sm font-medium mb-3 leading-snug">Autonomous ReAct Agent Active</p>
          </div>
          <div className="flex items-center gap-3 px-2">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Ayush" />
              <AvatarFallback>AY</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-semibold">Ayush</p>
              <p className="text-[10px] text-slate-500">Master Analyst</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent)]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#020617]/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Talk to the IPL Agent..."
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleToggleData}
              disabled={isLoadingData}
              className={`rounded-full px-4 border-primary/20 ${isRealData ? 'bg-primary/20 text-primary' : 'text-slate-400'}`}
            >
              {isLoadingData ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
              {isRealData ? "Using Real Data" : "Switch to Real Data"}
            </Button>
            <Badge variant="outline" className="text-primary border-primary/20">AGENT ONLINE</Badge>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-8 pb-12"
          >
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-8">
                {/* Hero Feature */}
                <div className="relative h-80 rounded-3xl overflow-hidden group">
                  <img
                    src="./src/assets/ipl_hero_bg.png"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Stadium"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/60 to-transparent"></div>
                  <div className="absolute inset-0 p-10 flex flex-col justify-center gap-4">
                    <Badge className="w-fit bg-primary hover:bg-primary px-3 py-1 animate-pulse">LIVE ANALYTICS</Badge>
                    <h2 className="text-5xl font-black tracking-tighter max-w-lg leading-none">
                      AI POWERED <br />
                      <span className="text-primary italic font-serif">STRATEGY ENGINE</span>
                    </h2>
                    <p className="text-slate-300 max-w-sm text-lg leading-relaxed">
                      Leverage deep-learning and ReAct agents to uncover hidden game patterns.
                    </p>
                    <div className="flex gap-4 mt-2">
                      <Button onClick={() => setActiveTab('ailab')} className="rounded-full px-8 bg-white text-black hover:bg-slate-200">Start Lab Session</Button>
                    </div>
                  </div>
                </div>

                {/* Main Dashboard */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <Card className="xl:col-span-2 bg-white/5 border-white/5 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-8">
                      <div>
                        <CardTitle className="text-xl font-bold">Standard Match Flow</CardTitle>
                        <CardDescription>Real-time momentum data sync</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={momentumData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="over" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                          <RechartsTooltip contentStyle={{ background: '#020617', border: 'none', borderRadius: '12px' }} />
                          <Area type="monotone" dataKey="csk" stroke="#F9CD05" fill="#F9CD05" fillOpacity={0.1} strokeWidth={3} />
                          <Area type="monotone" dataKey="mi" stroke="#004BA0" fill="#004BA0" fillOpacity={0.1} strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'ailab' && (
              <div className="flex flex-col gap-6 max-w-6xl mx-auto">
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
                        disabled={isAnalyzing || !query}
                        className="rounded-2xl h-14 px-8 mr-2 bg-primary hover:bg-primary/90 glow"
                      >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        {isAnalyzing ? "Agent Reasoning..." : "Launch Analysis"}
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
                                <Badge className="bg-primary hover:bg-primary">EXECUTIVE SUMMARY</Badge>
                              </div>
                              <CardTitle className="text-2xl font-black italic tracking-tight leading-tight">
                                {agentResult.executiveSummary}
                              </CardTitle>
                            </CardHeader>
                          </Card>

                          {/* Data Visualization */}
                          <Card className="bg-white/5 border-white/5 overflow-hidden">
                            <CardHeader className="border-b border-white/5">
                              <CardTitle className="text-lg">Analytical Insights</CardTitle>
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
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                Comprehensive Analysis Report
                              </CardTitle>
                              <Button variant="ghost" size="sm" onClick={exportToPDF} className="text-slate-400 hover:text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF
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
                      <div className="flex-1 flex flex-col items-center justify-center h-[500px] text-slate-600 border-2 border-dashed border-white/5 rounded-3xl">
                        <BrainCircuit size={64} className="mb-4 opacity-10" />
                        <p className="text-lg font-medium">Ready for deep-dive analysis</p>
                        <p className="text-sm">Ask about match trends, player metrics, or tactical patterns</p>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-3 mt-4">
                        <Zap className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Reasoning Log */}
                  <div className="flex flex-col gap-6">
                    <Card className="bg-[#020617] border-white/5 h-full flex flex-col">
                      <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                          <ListTree className="w-4 h-4 text-primary" />
                          <CardTitle className="text-sm font-bold uppercase tracking-wider">Agent Thinking</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowReasoning(!showReasoning)}
                        >
                          {showReasoning ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </Button>
                      </CardHeader>
                      <CardContent className={`p-0 flex-1 transition-all ${showReasoning ? 'h-auto' : 'h-0 overflow-hidden'}`}>
                        <ScrollArea className="h-[600px] px-6 py-4">
                          <div className="flex flex-col gap-8">
                            {agentTurns.map((turn: AgentTurn, i: number) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col gap-3 relative"
                              >
                                {i !== agentTurns.length - 1 && (
                                  <div className="absolute left-3 top-8 bottom-[-20px] w-[1px] bg-primary/20"></div>
                                )}
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${turn.observation.includes('Error') ? 'bg-red-500/20 text-red-500 border-red-500/40' : 'bg-primary/20 text-primary border-primary/40'
                                    } border`}>
                                    {i + 1}
                                  </div>
                                  <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest leading-none">Turn {i + 1}</span>
                                </div>
                                <div className="pl-6 flex flex-col gap-3">
                                  <div className="text-xs bg-white/5 rounded-xl p-3 border border-white/5 italic text-slate-300">
                                    "{turn.thought}"
                                  </div>
                                  <div className="bg-black/40 rounded-xl p-3 border border-white/5 font-mono text-[10px]">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-emerald-500 opacity-70">EXECUTE PYTHON:</span>
                                      <Terminal size={10} className="text-slate-600" />
                                    </div>
                                    <pre className="text-emerald-400 overflow-x-auto custom-scrollbar">{turn.code}</pre>
                                  </div>
                                  <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full w-fit ${turn.observation.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    }`}>
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
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main >
    </div >
  );
}
