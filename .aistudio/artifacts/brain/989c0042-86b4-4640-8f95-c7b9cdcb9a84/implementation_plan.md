# Implementation Plan: E2E Deep Tests Suite & Diagnostic Dashboard

## Overview
Comprehensive End-to-End (E2E) testing suite and in-app diagnostics dashboard to thoroughly test all application functions across AI generation, prompt studio formatting, voiceover audio export, database persistence, and verify the complete removal and disabling of legacy image generation.

---

## 1. Automated CLI Test Runner Script (`scripts/run-e2e-tests.ts`)
Create a high-speed, comprehensive test runner executable via `npm run test:e2e` covering:
- **Server Health & Core APIs**:
  - Test `/api/health` response and latency.
- **AI Generation Engine**:
  - `/api/generate-hooks`: Verifies structured hooks generation, speed, formula adherence, and payload validation.
  - `/api/generate-script-and-plan`: Verifies script generation with structured scenes, visual prompts, and rapid execution.
- **Prompt Studio Scene Engine**:
  - Verifies that storyboard scenes output pure textual visual prompts.
  - Tests formatters for all 4 AI presets: **Midjourney** (with aspect ratios and parameters), **Flux**, **Stable Diffusion**, and **Runway**.
  - Verifies style tag injections and copy-all batch formatting.
- **Voiceover Audio & Speech Engine**:
  - Tests `/api/generate-speech` endpoint and fallback audio pipeline.
  - Verifies audio export pipelines: MP3/WAV download payload, SRT subtitle generator, and TXT script export.
- **Database & Offline Resilience**:
  - Tests Firestore project persistence and querying.
  - Tests graceful fallback to `safeStorage` (localStorage) when Firestore encounters offline or timeout conditions.
- **Legacy Image Generation Removal Verification**:
  - Confirms Storyboard UI makes 0 requests to image generation.
  - Verifies `/api/generate-image` deprecation / disabled status.
  - Confirms pure prompt cards render without attempting image generation.

---

## 2. In-App Diagnostic Test Dashboard (`src/components/DiagnosticTestDashboard.tsx`)
Build an accessible in-app diagnostic dashboard modal integrated directly into the Magneto workspace header:
- **One-Click "Run All E2E Tests"**:
  - Runs all test suites with live progress indicators and elapsed time tracking.
- **Categorized Test Suites**:
  1. **AI Generation Suite**: Hook Formulation, Script Creation, Prompt Generation speed benchmark.
  2. **Prompt Studio Suite**: Midjourney, Flux, Stable Diffusion, Runway prompt synthesis & style tags.
  3. **Voiceover & Audio Suite**: TTS API audio response, Web Speech fallback, SRT caption generator, MP3 audio synthesis.
  4. **Database & Storage Suite**: Firestore read/write test, offline mode resiliency, project schema validation.
  5. **Legacy Image Removal Suite**: Confirms no image generation calls, verifies pure prompt cards output.
- **Detailed Inspector**:
  - View raw request/response payloads, latency metrics, and test logs.
  - Copy diagnostic report to clipboard or download as JSON report.

---

## 3. Package Scripts & Integration
- Add `"test:e2e": "tsx scripts/run-e2e-tests.ts"` to `package.json`.
- Add "Diagnostics" button in Magneto header with a pulse/status indicator.
- Verify all tests pass cleanly via automated test runner execution.

---

## Verification Plan
1. **Automated Test Run**: Run `npm run test:e2e` via terminal and ensure all test assertions pass (100% pass rate).
2. **In-App Test Run**: Open the diagnostic dashboard in the browser, trigger "Run All Tests", and inspect live results.
3. **Legacy Image Removal Check**: Confirm zero network calls to image generation APIs and verify purely textual Prompt Studio cards.
