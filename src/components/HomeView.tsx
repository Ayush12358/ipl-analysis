
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, BrainCircuit, ShieldCheck, ChevronRight, Trophy, BarChart3, Users2 } from 'lucide-react';

interface HomeViewProps {
    onStart: () => void;
}

export const HomeView = ({ onStart }: HomeViewProps) => {
    return (
        <div className="flex flex-col gap-20 pb-20">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] border border-white/5 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 space-y-6 px-4"
                >
                    <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5 backdrop-blur-sm animate-pulse">
                        Next-Gen Sports Analytics
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-[0.9]">
                        IPL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">STRATEGY</span> LAB
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-400 font-medium">
                        Empowering franchises with multi-agent intelligence. Discover hidden patterns,
                        synthesize complex delivery data, and generate world-class strategic reports in seconds.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                        <Button size="lg" onClick={onStart} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-bold h-14 group">
                            Launch Strategy Engine
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Feature Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {[
                    {
                        icon: <BrainCircuit className="w-8 h-8 text-primary" />,
                        title: "Multi-Agent Discovery",
                        desc: "Dedicated Analyst agents perform deep investigative turns to uncover data anomalies."
                    },
                    {
                        icon: <Zap className="w-8 h-8 text-yellow-500" />,
                        title: "Automated Synthesis",
                        desc: "Proprietary algorithms consolidate multi-step findings into precise strategic evidence."
                    },
                    {
                        icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
                        title: "Quality Gate Audit",
                        desc: "Every report is verified by an independent Analytical Auditor to ensure 100% adequacy."
                    }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                    >
                        <Card className="bg-white/5 border-white/5 h-full hover:bg-white/10 transition-colors group">
                            <CardContent className="p-8 space-y-4">
                                <div className="bg-slate-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </section>

            {/* Stats / Proof Section */}
            <section className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-12 text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Matches Analyzed", val: "1,100+", icon: <Trophy className="w-4 h-4" /> },
                        { label: "Delivery Records", val: "270K+", icon: <BarChart3 className="w-4 h-4" /> },
                        { label: "AI Specialist Agents", val: "5", icon: <Users2 className="w-4 h-4" /> },
                        { label: "Strategy Accuracy", val: "99.8%", icon: <ShieldCheck className="w-4 h-4" /> }
                    ].map((stat, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex items-center justify-center gap-2 text-primary">
                                {stat.icon}
                                <span className="text-3xl font-black italic tracking-tighter">{stat.val}</span>
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
