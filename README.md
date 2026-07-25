# Bug Report Generator — QA Companion CLI

A command-line tool that helps QA testers write faster, more consistent bug reports — and pulls data straight from failed automated test runs so you're not retyping the same information twice.

## Why this exists

Most QA teams lose real time to inconsistent bug reports: missing environment info, vague repro steps, no severity guidance, and duplicate tickets nobody notices until triage. This tool standardizes the format and automates the boring parts.

## Features

- **Interactive report builder** — answer a few prompts, get a formatted Markdown or Jira-ready bug report, copied straight to your clipboard.
- **Auto-generate from failed tests** — feed it a Mocha/Cypress JSON results file and it turns every failure into a draft bug report automatically.
- **Environment auto-detection** — OS, CPU, RAM pulled automatically instead of typed by hand.
- **Severity suggestion** — keyword-based heuristic flags likely severity (Critical/High/Medium/Low) so triage starts faster.
- **Duplicate detection** — checks new bug titles against a local log using string similarity, so you catch "isn't this the same bug as #47" before filing it.

## Install

```bash
git clone https://github.com/EvertonSt/bug-report-generator.git
cd bug-report-generator
npm install
```

## Usage

Interactive mode:
```bash
node src/index.js create
```

Generate reports from a failed test run:
```bash
node src/index.js from-test ./sample-test-results.json
```

## Tests

```bash
npm test
```

Covers report formatting, severity heuristics, and duplicate detection (7 tests, 0 dependencies on network or filesystem side effects beyond the local `bug-log.json`).

## Roadmap

- Direct Jira API integration (auto-file instead of copy-paste)
- Slack/Teams webhook to post new bug reports to a QA channel
- Support for Playwright test result format
- Web UI wrapper around the same core logic

## Author

Everton S. Andrade — [GitHub](https://github.com/EvertonSt) · [Portfolio](https://evertonst.github.io)
