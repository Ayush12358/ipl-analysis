# Changelog

## [v0.7.0] - 2026-02-03
### Added
- **Apache 2.0 License**: Added proper open-source licensing.
- **Mobile Responsive Layout**: Hamburger menu, slide-in sidebar, compact header for Android/iOS.
- **Model Selection**: Configure any AI model in Settings (text input).
- **Recent Chats**: Sidebar shows last 5 queries with localStorage persistence.
- **Agent Status Progress**: Real-time progress bar showing agent stages (`[2/6] Planning...`).

### Fixed
- **Empty Chart Bug**: Synthesis prompt now enforces `chartData` format for consistent visualizations.

### Changed
- **Repo Cleanup**: Removed debug files (`inspect_headers.ts`, `test-agent.ts`).
- **README**: Updated with current features, architecture diagram, and Apache license.

---

## [v0.5.0] - 2026-02-03
### Added
- **Recursive Feedback Loop**: Integrated a macro-level self-correction mechanism where the Auditor Agent can trigger a full re-investigation with an enhanced prompt if the initial report is rejected.
- **Robustness Layer**: Implemented schema awareness in the Analyst agent to probe the database structure before coding, eliminating common `KeyError` failures.
- **Self-Healing Synthesis**: Added retry logic to the data consolidation phase, allowing the system to recover from synthesis errors automatically.
- **Pre-commit Hooks**: Configured `husky` to run `bun run build` before every commit to ensure repository stability.

### Changed
- **Project Structure**: Updated `InfoView.tsx` to visualize the new "Phase 5" recursive loop in the agent flowchart.
- **Documentation**: Updated README to reflect the new self-healing capabilities.

All notable changes to this project will be documented in this file.

## [0.1.4] - 2026-02-03

### Features
- **Mission Planning Agent**: Added a new stage (Stage 0) where the AI elaborates on the query, outlines steps, and identifies key metrics before starting the investigation.
- **Mission Brief UI**: Integrated a new "Mission Brief" card in the analysis report to display the agent's plan and intended course of action.

## [0.1.3] - 2026-02-03

### Features
- **Four-Stage Reasoning Pipeline**: Implemented a sophisticated Discovery -> Synthesis -> Strategy -> Evaluation workflow.
- **Synthesis Turn**: A mandatory final data-gathering turn that consolidates discovery turns into a structured dataset.
- **Evaluation Gate**: An independent agent that audits the final report for adequacy and quality, displaying results directly in the UI.

## [0.1.2] - 2026-02-03

### Features
- **Multi-Step AI Discovery**: Evolved the Analyst Agent from "one-shot" execution to a multi-turn discovery loop. The agent can now investigate data, observe results, and refine its logic over multiple turns.
- **Reasoning Loop Logic**: Replaced immediate script exit with an observation-driven termination signal (`FINISH`).

## [0.1.1] - 2026-02-02

### Bug Fixes

- **data-integrity**: Resolved critical `KeyError: 'season'` by deriving season from date in match data.
- **schema-alignment**: Fixed `KeyError: 'runs_batter'` by standardizing Data Engine and Mock Data to use strict `snake_case` (aligned with AI Prompt).
- **mock-data**: Patched initial mock state to include missing `season` property.
- **build**: Fixed TypeScript build errors by excluding test files and adding strict interfaces.

## [0.1.0] - 2026-02-02

### Features
- **Multi-Step AI Discovery**: Evolved the Analyst Agent to perform multi-turn reasoning and data investigation using a `FINISH` termination signal.

- **data-engine**: Optimize data size with Gzip compression (100MB -> 7MB) to fix git push limits and improve load times.
- **analytics**: Implement Match Momentum Chart, Key Milestones, and Win Probability models.
- **ai-agent**: specialized Analyst & Strategist personas for deep IPL insights.

### Reliability

- **tests**: Add comprehensive unit and integration tests for Data Loader, Database, and Agent Orchestrator.
