# Changelog

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
