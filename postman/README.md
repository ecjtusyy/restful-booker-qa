# API Tests — Postman and Newman

This directory contains the Restful-Booker Postman collection, its public-demo environment, and a locked Newman runner.

## Run

```bash
npm ci
npm test
```

`npm test` prints the CLI result and writes `reports/api-report.html`. Use `npm run test:cli` when an HTML report is unnecessary.

## Flow

```text
Auth token → list/filter → create → read → unknown read
           → invalid-token patch → PUT → PATCH → delete → verify 404
```

The collection keeps this order intentionally. It generates a run ID and future dates once, saves the created `bookingId`, and deletes that booking at the end.

## Coverage

- Valid and invalid authentication.
- Booking list and filters.
- Valid create plus missing-required-field behavior.
- Exact read-back of created values.
- Unknown booking ID.
- Invalid-token partial update.
- Authenticated full and partial updates, including preserved fields.
- Delete and post-delete 404 verification.

The demo API deliberately returns some non-standard status codes: bad credentials use 200 with a `reason`, incomplete booking data returns 500, and successful delete returns 201. The assertions describe observed behavior rather than rewriting it as an ideal contract.

## Environment

| Variable | Purpose |
|---|---|
| `baseUrl` | Restful-Booker API deployment |
| `authToken` | Written by the valid-auth request |
| `bookingId` | Written by the valid-create request |
| `adminUser` / `adminPass` | Documented credentials for the public demo only |

Do not replace these with private credentials in a committed file. Supply sensitive values from an untracked environment or CI secret when targeting another deployment.
