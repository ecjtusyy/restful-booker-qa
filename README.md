# Restful-Booker QA Automation

[![QA Suite](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

## Project Overview

This repository is a focused Web/API QA automation project for [Restful-Booker](https://restful-booker.herokuapp.com) and its public booking UI at [automationintesting.online](https://automationintesting.online). It demonstrates how a small regression suite can divide checks between the API and UI layers, manage test data, clean up created records, and publish actionable CI artifacts.

This is an engineering extension of [jensenmd/restful-booker-qa](https://github.com/jensenmd/restful-booker-qa), not a claim of original authorship. See [Project Improvements](#project-improvements) and [Attribution](#attribution).

## Testing Scope

- **API testing:** authentication, booking queries, create/read/update/partial-update/delete, response contracts, and state transitions.
- **Negative testing:** invalid credentials, invalid write token, missing required booking fields, unknown booking IDs, and contact-form validation.
- **UI/E2E testing:** page access, room selection, booking submission, required fields, contact submission, and client-visible validation.
- **Regression testing:** independent Newman and Playwright suites for local and CI execution.
- **Cross-browser testing:** Chromium and Firefox projects. The live booking submission is scoped to Chromium because the shared demo has returned a browser-level load error after Firefox submission; the remaining UI scenarios run in both projects.

Performance, security, accessibility, and mobile coverage are not claimed by this repository.

## Architecture / Structure

```text
restful-booker-qa/
├── .github/workflows/ci.yml       # API and UI CI jobs
├── docs/
│   ├── PROJECT_AUDIT.md           # Evidence-led upstream audit and baseline
│   └── TEST_STRATEGY.md           # Risk, layer, regression, and triage strategy
├── postman/
│   ├── restful-booker.collection.json
│   ├── restful-booker.environment.json
│   ├── package.json               # Pinned Newman/reporting runner
│   └── package-lock.json
├── playwright/
│   ├── pages/                     # Small page objects for reused interactions
│   ├── tests/                     # Maintained UI regression specs
│   ├── utils/testData.js          # Valid and parameterized invalid data
│   ├── playwright.config.js
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Test Strategy

The API suite owns service contracts, authorization, CRUD state, and most negative cases because those checks are faster and easier to diagnose without a browser. The UI suite is deliberately smaller: it verifies that a user can find a room, complete the booking form, submit a contact request, and see meaningful validation.

Keeping invalid payload combinations and detailed CRUD checks at the API layer avoids a slow, fragile UI suite. UI automation is reserved for behavior that depends on rendering, selectors, form interaction, navigation, or user-visible feedback. The full rationale and CI triage flow are in [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md).

## Key Test Scenarios

### API

- Generate an auth token; verify the API's explicit bad-credentials response.
- Query booking collections and date/name filters.
- Create a uniquely named booking with future dates, then verify returned state.
- Reject a partial update made with an invalid token.
- Perform full and partial updates; verify changed and preserved values.
- Delete the created booking and verify it no longer exists.
- Verify missing required fields and an unknown resource response.

### UI

- Read the room's public availability report, enter a free date window on the home page, and open a room by semantic type instead of list position.
- Display the booking calendar and complete the critical booking path.
- Verify booking-form required-field feedback.
- Submit a valid contact request.
- Parameterize malformed email and below-minimum-length contact cases; assert the actual user-visible errors.

## Tech Stack

- Postman Collection v2.1 and Newman 6.2.1
- `newman-reporter-htmlextra` 1.23.1
- Playwright Test 1.58.2 with JavaScript
- Node.js 20 in GitHub Actions
- GitHub Actions and Actions artifacts

## Local Setup

Prerequisites: Git, Node.js 20 or later, npm, and network access to the two public demo services.

```bash
git clone <your-fork-url>
cd restful-booker-qa

# API suite
cd postman
npm ci
npm test

# UI suite
cd ../playwright
npm ci
npx playwright install chromium firefox
npm test
```

Useful UI commands:

```bash
npm run test:chromium
npm run test:firefox
npm run test:headed
npm run test:report
```

If a Windows Playwright browser download is damaged but Microsoft Edge is installed, Chromium tests can use the system channel without changing source:

```powershell
$env:PLAYWRIGHT_CHROMIUM_CHANNEL = 'msedge'
npm run test:chromium
```

`BASE_URL` can override the UI target. The Postman environment can likewise be copied and adjusted for another Restful-Booker deployment. Never commit real credentials or tokens.

## CI

On each push and pull request to `main`, GitHub Actions runs two independent jobs:

1. `npm ci` and Newman API regression.
2. `npm ci`, Chromium/Firefox installation, and Playwright UI regression.

The jobs are intentionally separate so an API failure does not hide the UI result. Both jobs have bounded timeouts and read-only repository permissions.

## Reports

- Newman HTML: `postman/reports/api-report.html`
- Playwright HTML: `playwright/playwright-report/`
- Playwright failure evidence: `playwright/test-results/` (screenshots, traces, and related diagnostics)

CI uploads the corresponding paths even after test failure and retains them for seven days. Generated outputs and `node_modules` are ignored by Git.

## Project Improvements

| Upstream project | Increment in this fork |
|---|---|
| Core Postman auth and booking CRUD flow | Added invalid-token and unknown-resource checks; generated future test dates; strengthened state assertions |
| Basic Playwright booking and contact coverage | Added availability-driven dates, replaced position-based room selection, completed POM usage, and added focused data-driven contact validation |
| Initial page objects and shared guest data | Added a small contact page object and explicit valid/invalid datasets; removed recorder-only drafts |
| Parallel Newman/Playwright CI jobs | Added locked Newman dependencies, deterministic `npm ci`, bounded jobs, minimal browser install, and raw failure artifacts |
| Portfolio overview | Added an evidence-based audit, concise strategy document, reproducible setup, truthful constraints, and explicit attribution |

The detailed baseline and reasons for each change are recorded in [docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md).

## Known Constraints

Both targets are shared public demo services. Availability, response time, data volume, and server state are outside this repository's control. Failures must first be classified as test-code, browser/runtime, network, or service behavior; assertions should not be weakened merely to produce a green run.

The public demo credentials in the Postman environment are documented sample credentials for Restful-Booker, not a private secret.

## Attribution

Based on and forked from [Michael D. Jensen's `jensenmd/restful-booker-qa`](https://github.com/jensenmd/restful-booker-qa). The upstream README and Git history identify Michael D. Jensen as the original project author. Restful-Booker itself is maintained separately by [Mark Winteringham](https://github.com/mwinteringham/restful-booker).

The audited upstream revision did not contain a `LICENSE` file. This repository does not invent or replace an upstream license; Git history, links, and attribution are retained so the origin of the work remains clear.
