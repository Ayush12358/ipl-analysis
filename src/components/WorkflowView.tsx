import React from 'react';
import Mermaid from 'react-mermaid-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, GitMerge, FileCheck, ShieldAlert } from 'lucide-react';

export const WorkflowView: React.FC = () => {
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
                <h2 className="text-4xl font-black italic tracking-tight uppercase">Agentic <span className="text-primary font-bold">Engine</span></h2>
                <p className="text-slate-400 max-w-3xl">
                    Observe how the IPL Strategy Lab orchestrates five specialized AI agents to ensure every
                    strategic insight is backed by multi-step data investigation and an independent quality audit.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-3 bg-white/5 border-white/5 p-8 flex items-center justify-center overflow-auto custom-scrollbar min-h-[600px]">
                    <Mermaid chart={chart} config={{ theme: 'dark' }} />
                </Card>

                <div className="space-y-4">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Brain className="w-4 h-4 text-primary" />
                                <Badge className="bg-primary">ROLE: PLANNER</Badge>
                            </div>
                            <CardTitle className="text-sm">Lead Architect</CardTitle>
                            <CardDescription className="text-[10px]">Defines the blueprint before investigation begins.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="bg-blue-500/5 border-blue-500/20">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Search className="w-4 h-4 text-blue-400" />
                                <Badge className="bg-blue-500">ROLE: INVESTIGATOR</Badge>
                            </div>
                            <CardTitle className="text-sm">Lead Analyst</CardTitle>
                            <CardDescription className="text-[10px]">Writes and executes code in multiple discovery turns.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="bg-emerald-500/5 border-emerald-500/20">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <GitMerge className="w-4 h-4 text-emerald-400" />
                                <Badge className="bg-emerald-500">ROLE: CONSOLIDATOR</Badge>
                            </div>
                            <CardTitle className="text-sm">Synthesis Agent</CardTitle>
                            <CardDescription className="text-[10px]">Wraps multi-step findings into one clean evidence package.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="bg-purple-500/5 border-purple-500/20">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <FileCheck className="w-4 h-4 text-purple-400" />
                                <Badge className="bg-purple-500">ROLE: STRATEGIST</Badge>
                            </div>
                            <CardTitle className="text-sm">Chief Strategist</CardTitle>
                            <CardDescription className="text-[10px]">Translates raw facts into world-class IPL insights.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldAlert className="w-4 h-4 text-amber-400" />
                                <Badge className="bg-amber-500">ROLE: AUDITOR</Badge>
                            </div>
                            <CardTitle className="text-sm">Analytical Auditor</CardTitle>
                            <CardDescription className="text-[10px]">Independent quality gate ensuring the query is 100% answered.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    );
};
