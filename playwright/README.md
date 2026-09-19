# UI Tests — Playwright

The maintained UI regression suite targets [automationintesting.online](https://automationintesting.online).

## Run

```bash
npm ci
npx playwright install chromium firefox
npm test
```

Focused commands:

```bash
npm run test:chromium
npm run test:firefox
npm run test:headed
npm run test:report
```

The default base URL can be overridden with `BASE_URL`. On Windows, set `PLAYWRIGHT_CHROMIUM_CHANNEL=msedge` to use an installed Edge channel when a downloaded Chromium package is unavailable.

## Maintained suite

```text
playwright/
├── pages/
│   ├── BookingPage.js
│   ├── ContactPage.js
│   └── HomePage.js
├── tests/
│   ├── booking.spec.js
│   └── contact.spec.js
├── utils/testData.js
└── playwright.config.js
```

- Booking tests read the public availability report, enter a free date window through the home-page form, and select the `Double` room by its visible heading rather than card position.
- Contact validation uses a small data table for cases that share the same workflow.
- Tests run serially with one worker because the target is a shared public demo.
- Chromium and Firefox projects are configured. The live booking submission is skipped in Firefox because the shared service has returned a browser-level load-error page after that submission; other scenarios remain cross-browser.

## Failure evidence

Screenshots and traces are retained for failures under `test-results/`; the HTML report is written to `playwright-report/`. CI uploads both paths.
