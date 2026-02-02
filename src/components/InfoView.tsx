
import Mermaid from './Mermaid';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Search, GitMerge, FileCheck, ShieldAlert, Github, Info, Box, ScrollText, Database, Code2 } from 'lucide-react';

export const InfoView = () => {
    const chart = `
  graph TD
    User([User Query]) --> Planning[Lead Architect]
    Planning -- "Mission Brief" --> Discovery{Discovery Phase}
    
    subgraph "Phase 0: Planning"
    Planning -- "Elaboration + Steps" --> Brief[Brief Created]
    end

    subgraph "Phase 1: Discovery (Up to 3 Turns)"
    Discovery -- "Python Exec" --> Analyst[Analyst Agent]
    Analyst -- "Observation" --> Discovery
    end

    Discovery -- "Discovery Complete" --> Synthesis[Synthesis Agent]
    
    subgraph "Phase 2: Consolidation"
    Synthesis -- "Final Structured Code" --> Consolidator[Data Consolidator]
    Consolidator -- "Refined Evidence" --> Strategist[Chief Strategist]
    end

    subgraph "Phase 3: Insights"
    Strategist -- "Strategic Report" --> Auditor[Analytical Auditor]
    end

    subgraph "Phase 4: Quality Gate"
    Auditor -- "Adequacy Judgment" --> UI([Dashboard Update + Quality Badge])
    end

    style Planning fill:#ec4899,stroke:#fff,color:#fff
    style Analyst fill:#3b82f6,stroke:#fff,color:#fff
    style Synthesis fill:#10b981,stroke:#fff,color:#fff
    style Strategist fill:#8b5cf6,stroke:#fff,color:#fff
    style Auditor fill:#f59e0b,stroke:#fff,color:#fff
  `;

    return (
        <div className="flex flex-col gap-8 pb-20">
            <div className="space-y-4">
                <h2 className="text-4xl font-black italic tracking-tight uppercase">Project <span className="text-primary font-bold">Intelligence</span></h2>
                <p className="text-slate-400 max-w-3xl font-medium leading-relaxed">
                    Explore the technical blueprint, dataset specifications, and the modular agentic architecture that powers the IPL Strategy Lab.
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="bg-slate-950/50 border border-white/10 p-1.5 rounded-2xl h-14">
                    <TabsTrigger
                        value="overview"
                        className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all font-bold"
                    >
                        <Info className="w-4 h-4 mr-2" /> Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="engine"
                        className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all font-bold"
                    >
                        <Brain className="w-4 h-4 mr-2" /> AI Engine
                    </TabsTrigger>
                    <TabsTrigger
                        value="technical"
                        className="rounded-xl px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all font-bold"
                    >
                        <Box className="w-4 h-4 mr-2" /> Technical
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-white/5 border-white/5 p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <Database className="w-6 h-6 text-primary" />
                                <CardTitle>Dataset Index</CardTitle>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    The lab operates on a master synthesis of IPL ball-by-ball data, providing a career-scale timeline of 1,100+ matches.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                                        <div className="text-2xl font-black text-white italic">2008-25</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Season Coverage</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center">
                                        <div className="text-2xl font-black text-white italic">270K+</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">Deliveries</div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 italic">Source: Cricsheet / Kaggle Open Data Repository</p>
                            </div>
                        </Card>

                        <Card className="bg-white/5 border-white/5 p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <ScrollText className="w-6 h-6 text-primary" />
                                <CardTitle>License & Repository</CardTitle>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-slate-500">License</h4>
                                    <p className="text-sm">Licensed under the <strong>Apache License 2.0</strong>.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase text-slate-500">Repository</h4>
                                    <a
                                        href="https://github.com/Ayush12358/ipl-analysis"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary hover:underline group"
                                    >
                                        <Github className="w-4 h-4" />
                                        Ayush12358/ipl-analysis
                                    </a>
                                </div>
                                <div className="pt-4 border-t border-white/5 space-y-2">
                                    <p className="text-xs text-slate-400 italic">Lead Developer: <strong>Ayush Maurya</strong></p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        Built with the assistance of <span className="text-primary/80 font-bold">Google's Antigravity</span> AI Agent.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="bg-white/5 border-white/5 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Code2 className="w-6 h-6 text-primary" />
                            <CardTitle>Core Features</CardTitle>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                "Autonomous Multi-Agent Discovery Loop",
                                "Pyodide-powered Client-side Python Execution",
                                "Strategic IPL Intel Synthesis",
                                "Mission Brief Planning System",
                                "Independent Analytical Auditor (QA)",
                                "Interactive GZIP Compressed Database",
                                "Mermaid.js Agent Flow Visualization",
                                "Framer-Motion Ultra-Fluid Animations"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="engine" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <Card className="lg:col-span-3 bg-white/[0.02] border-white/5 p-8 flex items-center justify-center overflow-auto custom-scrollbar min-h-[600px] rounded-3xl">
                            <Mermaid chart={chart} />
                        </Card>

                        <div className="space-y-4">
                            {[
                                { Icon: Brain, badge: "ROLE: PLANNER", title: "Lead Architect", desc: "Defines the blueprint before investigation begins.", color: "primary" },
                                { Icon: Search, badge: "ROLE: INVESTIGATOR", title: "Lead Analyst", desc: "Writes and executes code in multiple discovery turns.", color: "blue-500" },
                                { Icon: GitMerge, badge: "ROLE: CONSOLIDATOR", title: "Synthesis Agent", desc: "Wraps multi-step findings into one clean evidence package.", color: "emerald-500" },
                                { Icon: FileCheck, badge: "ROLE: STRATEGIST", title: "Chief Strategist", desc: "Translates raw facts into world-class IPL insights.", color: "purple-500" },
                                { Icon: ShieldAlert, badge: "ROLE: AUDITOR", title: "Analytical Auditor", desc: "Independent quality gate ensuring the query is 100% answered.", color: "amber-500" }
                            ].map((agent, i) => (
                                <Card key={i} className={`bg-${agent.color}/5 border-${agent.color}/20 rounded-2xl`}>
                                    <CardHeader className="p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <agent.Icon className={`w-4 h-4 text-${agent.color}`} />
                                            <Badge className={`bg-${agent.color} text-[8px] px-2 py-0 h-4`}>{agent.badge}</Badge>
                                        </div>
                                        <CardTitle className="text-sm font-bold">{agent.title}</CardTitle>
                                        <CardDescription className="text-[10px] leading-tight mt-1">{agent.desc}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="technical" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="bg-white/5 border-white/5 overflow-hidden rounded-3xl">
                        <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                            <CardTitle>Open Source Stack</CardTitle>
                            <CardDescription>Major packages and libraries driving the platform.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-white/5 border-b border-white/5">
                                <div className="p-8 space-y-4">
                                    <h4 className="font-bold text-primary italic uppercase tracking-widest text-xs">Core Framework</h4>
                                    <ul className="text-sm text-slate-400 space-y-2">
                                        <li>React 19 (Frontend)</li>
                                        <li>TypeScript (Typed Logic)</li>
                                        <li>Vite (Next-gen Bundling)</li>
                                        <li>Bun (Ecosystem Runtime)</li>
                                    </ul>
                                </div>
                                <div className="p-8 space-y-4">
                                    <h4 className="font-bold text-blue-400 italic uppercase tracking-widest text-xs">Visuals & UI</h4>
                                    <ul className="text-sm text-slate-400 space-y-2">
                                        <li>Tailwind CSS 4.0</li>
                                        <li>Shadcn/UI (Components)</li>
                                        <li>Framer Motion (Polish)</li>
                                        <li>Mermaid (Agent Flow)</li>
                                    </ul>
                                </div>
                                <div className="p-8 space-y-4">
                                    <h4 className="font-bold text-emerald-400 italic uppercase tracking-widest text-xs">AI & Analysis</h4>
                                    <ul className="text-sm text-slate-400 space-y-2">
                                        <li>Google Generative AI (LLM)</li>
                                        <li>Pyodide (In-browser Python)</li>
                                        <li>PapaParse (CSV Handler)</li>
                                        <li>Recharts (Data viz)</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="p-8 bg-white/[0.01]">
                                <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-widest">Full Dependency List</h4>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "@google/generative-ai", "mermaid", "papaparse", "framer-motion",
                                        "recharts", "jspdf", "lucide-react", "clsx", "tailwind-merge",
                                        "@radix-ui/react-tabs", "@radix-ui/react-dialog", "@radix-ui/react-avatar"
                                    ].map((pkg) => (
                                        <code key={pkg} className="text-[10px] bg-white/5 px-2 py-1 rounded-md border border-white/10 text-slate-400">
                                            {pkg}
                                        </code>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
