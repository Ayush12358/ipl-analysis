import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
    chart: string;
}

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
});

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.contentLoaded();
            // Ensure it re-renders if chart changes
            const renderChart = async () => {
                const { svg } = await mermaid.render(`mermaid-svg-${Math.random().toString(36).substr(2, 9)}`, chart);
                if (ref.current) {
                    ref.current.innerHTML = svg;
                }
            };
            renderChart();
        }
    }, [chart]);

    return <div key={chart} ref={ref} className="mermaid flex justify-center items-center w-full" />;
};

export default Mermaid;
