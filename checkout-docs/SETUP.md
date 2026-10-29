# Seismique sandbox checkout

Implementation status: sandbox-only code, not a launch-ready ticketing system. Existing Toast links and the immersive site are unchanged. The new page is `/checkout/`; it is intentionally absent from the production navigation.

## Architecture

The original Sites publication is static (`dist`). It cannot execute Node API routes. Vercel serves the same `dist` files plus `api/checkout.js`, a Node 24 function backed by Checkout Sessions + Stripe Payment/Express Checkout Elements. Use the checkout at **https://seismique.vercel.app/checkout/** for payment tests. The Sites `/checkout/` page can only show the clearly labelled selection/upgrade preview; it has no payment backend.

`ui_mode: elements` and `stripe.initCheckoutElementsSdk` are the current Stripe names for the custom Checkout Sessions + Elements integration. Stripe.js loads directly from `https://js.stripe.com/endive/stripe.js`; the server uses Stripe Node 23.1.0 and its pinned API version, 2026-10-28.endive. All six existing prices were read from the connected account on October 29, 2026. No products were created.

A real sandbox Checkout Session containing one of each of the six prices was accepted by Stripe with total **$196.94**, tax disabled. This verifies session creation and price compatibility, not a successful payment or webhook delivery. The initial permission-field probe was rejected by the actual Stripe endpoint; unsupported permission fields were removed. The checkout UI exposes no client quantity/discount mutation actions. All cart and promo updates go through the backend; fulfillment compares the final paid lines and total with the saved server snapshot.

## Vercel setup

Project: `seismique`, team `elitephnrepair2-cpus-projects`. GitHub `main` is already connected. Keep framework **Other**, repository root as Root Directory, publish directory `dist`, Node 24. `vercel.json` provides the checked-in configuration. No site rebuild is needed. The installed Vercel connector could not read this new project (404) or create projects (403), although it is visible in the signed-in browser. GitHub-based deployments do not require giving the agent a Vercel token.

Set these in **Vercel → seismique → Settings → Environment Variables**. Never paste credentials into chat or commit them.

| Variable | Value / purpose | Storage |
|---|---|---|
| `STRIPE_SECRET_KEY` | `rk_test_…` restricted key with sufficient read account/price/promotion, read/write Checkout Sessions, and read PaymentIntent permissions; an `sk_test_…` sandbox key also works. Must belong to `acct_1UVus1BRtAmy9egL`. | Secret |
| `STRIPE_PUBLISHABLE_KEY` | Matching `pk_test_…` from the same sandbox | Config |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from this endpoint's sandbox webhook configuration | Secret |
| `DATABASE_URL` | Dedicated sandbox PostgreSQL connection string, preferably pooled, using the provider's required TLS settings | Secret |
| `STRIPE_ACCOUNT_ID` | `acct_1UVus1BRtAmy9egL` | Config |
| `CHECKOUT_ORIGIN` | `https://seismique.vercel.app` (no trailing slash) | Config |
| `CHECKOUT_ENABLED` | Keep `false` until storage/schema/webhook are ready; then `true` **for sandbox tests only** | Config |
| `STRIPE_TAX_ENABLED` | `false`; `true` deliberately fails closed pending review | Config |
| `CHECKOUT_ALLOWED_ORIGINS` | Optional exact additional origins, comma separated. Required for a Vercel preview URL calling its own API with the production return origin configured. Avoid wildcards. | Config |
| `TICKET_STAFF_API_KEY` | Optional high-entropy bearer token for future sandbox scanner calls; no staff UI is published | Secret |

Production deployment here still means a **sandbox-only** checkout. The code rejects live keys, live prices, wrong accounts, and live webhook events. Never set live credentials. Separate preview and development values from production values according to Vercel's team policy.

### Where to find Stripe keys

Select **seismique sandbox** in Stripe and open **Developers → API keys**. Copy the publishable test key and the test restricted/secret key directly to the corresponding Vercel fields. Do not rotate or create a new credential without reviewing permissions. The connected Stripe tool can inspect account data; it does not supply a runtime application key.

### Database

Create a dedicated sandbox PostgreSQL database through your preferred provider or Vercel Storage integration. Do not reuse the phone-repair CRM database. The connection-string provider supplies `DATABASE_URL`.

Apply `db/checkout.sql` once, using the provider's SQL console, or from a trusted local environment:

```sh
CHECKOUT_DATABASE_CONFIRMED_SANDBOX=true npm run db:migrate
```

The migration reads `DATABASE_URL` from the process environment. Local environment values are not loaded automatically; Node 24 supports `node --env-file=.env.local scripts/checkout-migrate.mjs` after setting the sandbox-confirmation flag. Local credential files are ignored by Git. Do not execute the migration against production storage.

The schema saves drafts, immutable payment snapshots, orders, tickets, processed webhook IDs, a transactional email outbox, and request-rate buckets. Unique session/checkout/payment/ticket constraints plus transactions make retries idempotent. Database migration and concurrent PostgreSQL behavior must still be exercised against the actual configured database; the current automated repository tests use a transactional storage fixture.

Periodically remove expired rate buckets and abandoned unpaid drafts according to an approved retention policy. Do not delete paid records, audit history or tickets as part of that cleanup.

### Required webhook

Create a webhook/event destination in the **same Stripe sandbox**, URL:

```
https://seismique.vercel.app/api/checkout?action=webhook
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`
- `charge.dispute.created`

Save its signing secret as `STRIPE_WEBHOOK_SECRET` and redeploy. Use the SDK's pinned API version for the endpoint where offered. Signature verification uses the untouched raw request body. A frontend return never creates an order or ticket. Paid Sessions are retrieved from Stripe and checked against saved cart/date/amount snapshots before one atomic order/ticket/outbox transaction.

Full refunds and disputes void sandbox tickets. Partial refunds are flagged for manual reconciliation because no per-ticket refund policy has been supplied. Reinstatement, chargeback resolution, cancellation and rescheduling rules require approval before launch.

### Tax remains pending

Venue: **2306 S Texas 6, Houston, TX 77077, US**. Venue-performance sourcing, admission tax categories (including the mixed museum/golf bundle), price tax behavior and registrations must be confirmed before implementing Stripe Tax. No tax percentages, registrations, or product tax categories have been invented. `automatic_tax` is explicitly false; the UI says tax is not enabled in the sandbox. This code cannot switch to tax collection by toggling a flag.

## Test locally

```sh
npm ci --ignore-scripts
npm test
npm run dev:checkout
```

Preview: http://localhost:8126/checkout/. Without credentials it deliberately shows a selection/upsell preview and disables payment. Provide sandbox environment values to test Stripe; use Stripe's webhook forwarding with its matching local signing secret. Keep the same browser session through the Stripe return; a private, 256-bit bearer token stored in sessionStorage protects status and QR downloads. A separate browser/device cannot retrieve tickets merely by knowing a Session ID. Cross-device ticket recovery is a future authenticated feature.

## Sandbox acceptance matrix

Before claiming payment readiness, verify on the deployed Vercel page:

1. Museum adult/child, golf adult/child, and bundle adult/child create the expected Stripe line items.
2. Review a museum order, upgrade adults only, children only, and both. Each upgrade replaces museum quantities and adds exactly **$15 per upgraded ticket**. Total headcount remains unchanged. Decline once; return to review and reload to check the upsell stays declined for that browser checkout. Bundles-only/golf-only orders never show it.
3. Use `4242 4242 4242 4242`, any future expiry and any three-digit CVC for a successful sandbox card payment.
4. Use `4000 0000 0000 9995` for a decline. Confirm no order/tickets appear.
5. Use `4000 0025 0000 3155` for authentication; test both completion and cancellation.
6. Retry the same request, double-click Pay, replay the completed webhook, and deliver completed/async-success in different orders. Confirm one payable session revision and one set of tickets. The database uniqueness/locking tests need the actual PostgreSQL connection.
7. Verify signature failures, mismatched account/live events, tampered totals/line items and unrelated Sessions are rejected or ignored without tickets.
8. Confirm the return page waits for webhook-backed storage, then displays distinct sandbox ticket IDs and downloadable QR codes. Decode and validate each QR using the protected sandbox endpoint.
9. Configure a real eligible sandbox promotion in Stripe; test valid, invalid, expired and ineligible codes. No discounts are hardcoded.
10. Test Apple Pay and Google Pay on supported devices after registering the checkout domain in Stripe's sandbox payment-method domain settings. Availability depends on account settings, browser and wallet setup; the code does not promise either wallet appears everywhere.

## Fulfillment and email boundary

Each selected museum, golf or bundle ticket receives one unique ID and an opaque QR payload `SEISMIQUE-TEST:<ticket-id>:<random-secret>`. The payload includes no email, name or payment secret. The order's paid state gates ticket access. Status polling does not fulfill payments. A unique email-outbox row is created in the same fulfillment transaction, but **no email provider, email worker, or delivery is active**. An approved sender/provider, template, retry worker, delivery idempotency, and monitoring are required to send tickets.

The staff-only `POST /api/checkout?action=validate` accepts `{ "payload": "…", "redeem": false }` for validation or `redeem: true` for atomic one-time test redemption. Use `Authorization: Bearer <TICKET_STAFF_API_KEY>` and the configured Origin. It is a primitive for future scanner work, not an operational admissions system. Bundle component scanning, authorized staff identities, visit-day windows, re-entry and exception policies remain undefined.

## Before live launch

This repository intentionally cannot charge live payments. Still required: verified real sandbox successes/failures and wallet tests; database deployment and migration; webhook delivery/retries; email delivery; verified age/admission schedules/capacity rules; ticket recovery; refund/reschedule/re-entry and bundle-validation rules; privacy/terms review; tax registrations/categories/performance-location sourcing; staff scanning workflow; operational monitoring/backups; and a separately approved live-mode change and controlled rollout. Toast remains in use throughout.

## Files

- `dist/checkout/index.html`, `dist/assets/checkout.css`, `checkout.mjs`, `checkout-cart.mjs`, `checkout-preview.json`: isolated branded checkout.
- `api/checkout.js`, `server/checkout/*.mjs`: Vercel API, verified catalog, session creation, request authorization, webhook fulfillment, QR and staff validation.
- `db/checkout.sql`: sandbox schema.
- `package.json`, `package-lock.json`, `vercel.json`, `.env.example`, `.gitignore`: runtime/configuration.
- `scripts/checkout-dev.mjs`, `checkout-migrate.mjs`, `checkout-preview-catalog.mjs`: preview and setup helpers.
- `tests/checkout.test.mjs`: local automated behavior/security tests (simulated gateway/storage plus actual Stripe signature cryptography).

Official references: https://docs.stripe.com/payments/quickstart, https://docs.stripe.com/checkout/fulfillment, https://docs.stripe.com/webhooks, https://docs.stripe.com/elements/express-checkout-element.
