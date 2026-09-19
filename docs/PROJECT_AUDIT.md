# Upstream Project Audit

Audit date: 2026-09-18  
Upstream: [jensenmd/restful-booker-qa](https://github.com/jensenmd/restful-booker-qa)  
Audited revision: `a951343` (`main`)

## Scope and original structure

The upstream repository is a compact QA portfolio project for the public Restful-Booker services. It separates a Postman/Newman API collection from Playwright UI tests and runs both in GitHub Actions.

```text
.github/workflows/ci.yml       # Two CI jobs: Newman and Playwright
postman/                       # Collection, environment, and runner notes
playwright/tests/              # Booking and contact-form specs
playwright/pages/              # Booking and home page objects
playwright/utils/              # Shared guest data
playwright/*.js                # Five recorder/experiment scripts outside the suite
README.md                      # Project overview and portfolio links
```

No `LICENSE` file exists at the audited revision. The repository does contain clear author information in its README. This fork must therefore retain prominent attribution and must not claim the upstream work as original. A license will not be invented or applied on the upstream author's behalf.

## Existing capabilities

- API: valid and invalid authentication; booking list/filter; create, read, full update, partial update, delete, and post-delete verification.
- UI: room calendar visibility, one complete booking, booking-form required-field handling, contact submission, and an empty-contact-form check.
- Reliability: UI tests are serial, use one worker, capture screenshots on failure, and capture traces on the first CI retry.
- Maintainability: booking interactions are partly encapsulated in a page object and shared guest data is separated.
- CI: independent API and UI jobs run on pushes and pull requests to `main`, then upload HTML reports.

## Baseline execution results

### API collection

The unchanged upstream collection was run with Newman 6.2.1 against `https://restful-booker.herokuapp.com`.

- Result: **12 requests passed; 27 assertions passed; 0 failures**.
- Duration: 7 seconds.
- The created booking was deleted and the follow-up GET returned 404.
- The public API returned its documented non-standard responses: 200 for bad credentials with a `reason` field, 500 for an incomplete booking, and 201 for delete.

### UI suite

The Playwright lock resolved to version 1.58.2.

- The Playwright CDN download failed after the Chromium main package completed: the headless-shell connection was reset and later DNS lookup failed. The partial Chromium package then failed to start on Windows because its side-by-side configuration was invalid.
- To separate environment failure from test-code failure, the unchanged tests were rerun with a temporary, uncommitted configuration using the installed Microsoft Edge Chromium channel.
- Result: **5 tests passed; 0 failures** in 51.2 seconds.
- Firefox could not be executed locally because its browser package was not downloaded. The upstream CI definition remains the appropriate cross-browser execution environment.

## Findings

| Finding | Evidence and impact | Decision |
|---|---|---|
| API CRUD flow is real and currently passes | The run created booking `3900`, updated it, deleted it, and verified 404 | Preserve the sequence and strengthen state assertions rather than rewrite it |
| Negative API coverage is narrow | Invalid login and missing fields exist; an unauthenticated write and a standalone unknown-resource check do not | Add one invalid-token write and one not-found read |
| Some API assertions are too loose | The GET-by-ID and PATCH preservation checks mostly assert that fields exist | Assert values created or set earlier in the flow |
| API data contains fixed past dates | 2024/2025 values age poorly and reduce readability | Generate a small set of future dates once per collection run |
| UI room selection depends on position | `getByRole(...).nth(2)` assumes ordering; the real card exposes a `Double` heading | Select the room card by visible room type through the existing home page object |
| Recorded calendar clicks do not change the submitted dates | Repeat-run trace showed the UI still posted the reservation URL's default dates, received 409, then crashed while rendering the error | Read the public room-availability report and set dates through the home-page availability form so the reservation URL and payload agree |
| Contact negative check is weak | It only checks that success is absent; the live site returns explicit validation messages for malformed input | Assert actual messages and parameterize a small invalid-data table |
| Page-object usage is incomplete | `HomePage` exists but is unused and contains a stale `.hotel-room-info` selector | Repair and use it; add a small contact page object only where it removes repetition |
| Recorder drafts create noise | Five root-level Playwright scripts use brittle generated selectors and are not run by Playwright Test or CI | Remove the drafts; retain only the maintained suite |
| CI installs mutable global tools | Newman and the HTML reporter are installed globally without versions; Playwright uses `npm install` instead of `npm ci` | Add a locked API runner and use deterministic installs |
| Artifact retention is incomplete | HTML reports are uploaded, but Playwright screenshots/traces live in `test-results` and are not uploaded | Upload both report and raw failure artifacts with bounded retention |
| No upstream license file exists | Confirmed in the repository tree | Preserve attribution and explicitly describe the fork; do not create a license claim |

Installing the pinned Newman/reporting toolchain reported 21 vulnerabilities in transitive development dependencies (8 moderate, 12 high, 1 critical). They are isolated to the test runner/reporting dependency tree. A forced audit upgrade is intentionally out of scope because it could replace major versions without proving compatibility.

## Planned, bounded changes

1. Add a pinned Newman runner with a lock file and enhance only the missing high-value API checks.
2. Replace positional UI selectors, drive booking dates through the real availability flow, reuse page objects, and convert meaningful contact validation cases to table-driven tests.
3. Remove recorder drafts that are not part of the maintained suite.
4. Make CI installs deterministic and retain the reports, screenshots, traces, and diagnostics needed for triage.
5. Rewrite the root documentation around test strategy, truthful scope, local reproduction, improvements, and upstream attribution.

## Intentionally unchanged

- Postman/Newman and JavaScript/Playwright remain the project stack.
- API and UI suites remain separate layers and CI jobs.
- Tests remain serial with one worker because they target shared public services.
- No Docker, custom framework, broad dependency upgrade, coverage percentage, performance claim, or synthetic defect count will be added.
