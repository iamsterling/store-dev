# 0002 — Separate the customer storefront from merchant operations

Status: accepted.

The initial `apps/web` scaffold is an internal operations preview. It does not represent the
customer shopping experience. The customer-facing application now lives in `apps/storefront`
(`@repo/storefront`, development port 3001), while the operations app remains on port 3000.

Both apps consume the owned shadcn primitives in `@repo/ui`. Storefront theme overrides and
Tailwind scanning are app-local so its editorial styling does not change the dashboard.

The storefront has an illustrative catalog, search/category/sort URLs, static product routes,
and a browser-only bag. The bag contains identifiers and quantities, not trusted prices.
No new database schema, payment provider, shipping policy, or supplier contract is inferred.
Real checkout remains a server-authoritative backend integration with separate requirements.

Desktop/mobile Chromium E2E tests cover browse/search, product details, bag persistence and
quantity changes, corrupt local storage, empty results, and not-found routes. The bag's client
provider wraps server-rendered children; pages and product content remain Server Components.
