# Test Strategy

## 1. System under test

The system is the public Restful-Booker hotel-booking demo: a REST API at `restful-booker.herokuapp.com` and a browser UI at `automationintesting.online`. The repository tests the deployed services as an external consumer; it does not control their code, data reset, uptime, or release schedule.

## 2. Main business risks

| Risk | Impact | Primary layer |
|---|---|---|
| A booking cannot be created or retrieved accurately | A guest cannot reserve or later confirm a room | API, plus one UI critical path |
| Unauthorized users can change or delete bookings | Booking integrity and access control are compromised | API |
| Full/partial updates corrupt fields that were not changed | Dates, price, or guest details become inconsistent | API |
| Deleted bookings remain accessible | Cancelled data appears active | API |
| The UI cannot find a room or submit valid guest details | The customer journey is blocked | UI |
| Invalid contact data is accepted without feedback | Support receives unusable requests | UI |

## 3. Why use both API and UI tests?

API tests provide fast, direct evidence about contracts, authorization, status codes, and state transitions. UI tests provide evidence that the deployed page renders and that a user can interact with the critical workflows. Either layer alone leaves a gap: API-only coverage misses browser integration, while UI-only coverage is slower and makes service failures harder to isolate.

## 4. API-layer responsibilities

The Newman suite verifies authentication behavior; create/read/update/partial-update/delete; exact changed and preserved values; required-field handling; invalid-token rejection; unknown resources; and cleanup confirmation. It generates future dates once per run and stores the created booking ID so later requests form one readable Arrange → Act → Assert chain.

## 5. UI-layer responsibilities

The Playwright suite verifies page access, availability search, semantic room selection, calendar and form behavior, a complete booking submission, contact submission, and visible validation messages. Before the booking flow, it reads the same public room-availability report used by the UI and selects the first free two-night window; the dates are then entered through the home-page form. Page objects contain reused selectors and interactions; assertions remain in specs so test intent stays visible.

## 6. Good automation candidates

- Stable, repeatable regression checks with objective outcomes.
- API contracts and CRUD state transitions.
- Critical happy paths that would block a release.
- High-value negative cases such as authorization and required fields.
- Small input tables where the workflow is identical but expected validation differs.

## 7. Cases not worth UI automation here

- Exhaustive API payload combinations: faster and clearer at the API layer.
- Visual design opinions and exploratory usability review: they require human judgment.
- One-off recorder scripts with no maintained assertion.
- Performance, load, and browser/device matrices unsupported by this small public target.
- Scenarios requiring reliable ownership of server data or recovery controls that the public demo does not provide.

## 8. Regression execution

Locally, run `npm test` in `postman/` and then `playwright/`. During development, run the changed layer first and the full two-layer suite before a commit or pull request. CI repeats both suites independently on every push and pull request to `main`. The API flow deletes its created booking; UI runs serially with one worker to reduce pressure and shared-state collisions on the public service.

## 9. CI failure triage

1. Identify the failed layer and first failed request/test; do not diagnose from the final job status alone.
2. Open the Newman or Playwright HTML report. For UI failures, inspect the screenshot and trace in `test-results`.
3. Classify the failure: assertion/test code, browser/runtime, network/DNS, or upstream service response.
4. Reproduce the smallest failed test once against the same target. Check API status/body or the browser trace before changing code.
5. If the public service is unavailable or inconsistent, record the evidence and retry later. Do not skip tests, catch all exceptions, or weaken valid assertions to make CI green.
