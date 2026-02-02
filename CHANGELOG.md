# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-02-02

### Bug Fixes

- **data-integrity**: Resolved critical `KeyError: 'season'` by deriving season from date in match data.
- **schema-alignment**: Fixed `KeyError: 'runs_batter'` by standardizing Data Engine and Mock Data to use strict `snake_case` (aligned with AI Prompt).
- **mock-data**: Patched initial mock state to include missing `season` property.
- **build**: Fixed TypeScript build errors by excluding test files and adding strict interfaces.

## [0.1.0] - 2026-02-02

### Features

- **data-engine**: Optimize data size with Gzip compression (100MB -> 7MB) to fix git push limits and improve load times.
- **analytics**: Implement Match Momentum Chart, Key Milestones, and Win Probability models.
- **ai-agent**: specialized Analyst & Strategist personas for deep IPL insights.

### Reliability

- **tests**: Add comprehensive unit and integration tests for Data Loader, Database, and Agent Orchestrator.
