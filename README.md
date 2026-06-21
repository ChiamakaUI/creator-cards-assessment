# Creator Card API

REST API for shareable creator profile cards with link aggregation and rate cards. Submission for the Resilience 17 Backend Engineer assessment.

Base URL: `https://creator-cards-assessment.up.railway.app`

## Stack

Node.js (Express), MongoDB Atlas, deployed on Railway. Built on the provided node-template scaffold.

## Local setup

```bash
npm install
cp .env.example .env  # fill in MONGODB_URI
npm run dev
```

The server reads `PORT` (defaults to 3000) and `MONGODB_URI` from environment.

## Template modifications

Two surgical changes to the provided scaffold were required to produce the response shape the assessment specifies.

`core/express/server.js`: added `responseComponents.body.code = error.errorCode` in the error response builder. Without this, the framework drops `error.errorCode` from the body and surfaces it only as an HTTP status mapping key.

`core/errors/constants.js`: extended `ERROR_STATUS_CODE_MAPPING` with `NF01: 404`, `NF02: 404`, `AC03: 403`, `AC04: 403`. `SL02`, `AC01`, `AC05` rely on the existing 400 fallback.

## Architectural notes

VSL handles field-level validation (types, lengths, enums) and returns HTTP 400 with the framework's own error format. The service layer adds the business rules VSL cannot express: URL protocol checks, slug character set, access code alphanumeric format, integer amount validation, and the conditional access_code rules.

Slug uniqueness uses a pre-check `findOne` so the response can return the assessment's `SL02` code on conflict. The repository factory's MongoDB 11000 duplicate-key catch is the race-condition backstop.

Auto-generated slugs retry on collision with a 6-character alphanumeric suffix up to 10 attempts. Sequential by design: collisions on a 36^6 space are vanishingly rare and parallelizing 10 DB lookups would be wasteful.

Soft delete is provided by the template's `paranoid: true` model option. `deleted` is `0` while live and `Date.now()` after delete; all find operations filter `deleted = 0` automatically, so deleted cards return `NF01` on subsequent retrieval.

## Architecture

```
endpoints/creator-cards/    HTTP handlers (thin, delegate to services)
services/creator-cards/     Business logic, VSL validation, access rules
  utils/                    Serializer, slug generator
repository/creator-cards/   Repository factory binding
models/creator-card.js      Mongoose schema with paranoid soft-delete
messages/creator-cards.js   Error and success message strings
```