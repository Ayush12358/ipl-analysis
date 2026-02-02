
import Mermaid from './Mermaid';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, GitMerge, FileCheck, ShieldAlert } from 'lucide-react';

export const WorkflowView = () => {
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
                <p className="text-slate-400 max-w-3xl font-medium leading-relaxed">
                    Observe how the IPL Strategy Lab orchestrates five specialized AI agents to ensure every
                    strategic insight is backed by multi-step data investigation and an independent quality audit.
                </p>
            </div>

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
        </div>
    );
};
