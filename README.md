# IPL Analysis AI 🏏

A next-generation IPL analytics platform powered by Agentic AI (Google Gemma 2) and Client-Side Python (Pyodide). This application allows users to query deep cricket insights using natural language, visualize data with dynamic charts, and generate professional PDF reports.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## ✨ Features

- **Agentic AI Core**: Dual-agent system ("Analyst" for code, "Strategist" for insights) driven by Google's Generative AI.
- **Self-Healing Intelligence**: v0.5.0 introduces a **Recursive Feedback Loop** where the AI audits its own work and auto-restarts with better strategy if the initial output is inadequate.
- **Robustness Layer**: Schema-aware code generation prevents runtime errors by establishing a "handshake" with the database before execution.
- **Client-Side Execution**: Runs Python analysis directly in the browser using Pyodide (WASM) - zero server processing for data privacy.
- **Deep Data Engine**: Pre-loaded with comprehensive IPL dataset (2008-2025) (~260k deliveries), optimized via Gzip.
- **Rich Visualizations**: Interactive Recharts for Match Momentum, Run Rates, and Player Performance.
- **Professional Reports**: One-click PDF export of AI-generated insights and charts.
- **Secure**: BYOK (Bring Your Own Key) architecture. API keys are stored locally and never touch our servers.

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **AI**: Google Generative AI SDK (Gemini 2.0 Flash / Gemma-3-27b-it)
- **Runtime**: Pyodide (Python 3.11 in WASM) + Pandas + Scikit-Learn
- **Styling**: TailwindCSS v4 + Shadcn UI + Framer Motion
- **Testing**: Bun Test

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.0+)
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ipl-analysis.git
cd ipl-analysis

# Install dependencies
bun install
```

### Development

```bash
bun run dev
```

### Testing

Run the high-coverage test suite (Data Engine + Agent Logic):

```bash
bun test
```

## 🏗️ Architecture

The app uses a **Multi-Agent Orchestrator**:
1.  **User Query** -> **Analyst Agent**: Writes Python code to query the `df_matches` and `df_deliveries` DataFrames.
2.  **Pyodide Engine**: Executes the Python code in a sandboxed WASM worker.
3.  **Observation**: Returns execution results (text + JSON chart data).
4.  **Strategist Agent**: Synthesizes the results into a strategic cricket analysis.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
