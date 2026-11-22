# ShopLedger

## Stack

- Node.js CommonJS application using Express and body-parser.
- Static browser UI in `public/`; JSON persistence in `data/db.json`.

## Module map

- `routes/customers.js` — customer listing and Khata settlement endpoints.
- `routes/orders.js` — order listing, retrieval, creation, and cancellation endpoints.
- `routes/products.js` — product catalog and active coupon endpoints.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — normalizes, validates, calculates, and lists coupons.
- `lib/dates.js` — Indian-format date, date-key normalization, and fiscal-year utilities.
- `lib/inventory.js` — product lookup, stock checks, stock changes, and inventory summary.
- `lib/invoice.js` — computes printable-invoice figures and renders invoice HTML.
- `lib/ledger.js` — customer lookup, Khata balances/charges, reversals, and settlements.
- `lib/orders.js` — creates, retrieves, cancels, and filters orders.
- `lib/pricing.js` — subtotal, coupon discount, GST, and checkout-total calculation.
- `lib/reports.js` — dashboard summary and invoice/ledger GST reconciliation.
- `lib/store.js` — reads, writes, and audits the JSON datastore.
- `lib/tax.js` — resolves item GST rates and splits CGST/SGST.

## Commands

- Start: `node server.js`
- Tests: `node --test`

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed.

Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
