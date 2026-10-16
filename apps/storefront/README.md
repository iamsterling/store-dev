# Customer storefront

`@repo/storefront` is the customer-facing shop. `apps/web` is the separate internal operations
preview; do not build merchant dashboard screens into this app.

```sh
# From repository root
pnpm --filter @repo/storefront dev
# http://localhost:3001

pnpm --filter @repo/storefront test
pnpm exec turbo run test:e2e --filter=@repo/storefront
```

## Implemented

- Collection-led discovery via `/edits` and four themed `/edits/[slug]` pages.
- `(store)` shell and one `@overlay` parallel slot with intercepted product and bag routes.
  Browsing opens a shadcn mobile Drawer or desktop Sheet; refresh/direct links render full pages.
  Product-to-bag navigation replaces the preview, and dismissal returns to the collection.
- Safe-area-aware mobile bottom navigation, generous touch controls, sticky product purchase
  controls, and shadcn Accordion product information.

- Editorial home page, category collections, search and price sorting via shareable query URLs.
- Static product-detail routes, metadata, related products, and not-found UI.
- Accessible shadcn/Radix shopping bag: quick add, quantity changes, removal, subtotal,
  browser persistence, and keyboard dismissal/focus restoration.
- Responsive layouts, local product photography through Next Image, and an app-scoped theme.
- Unit coverage for catalog filtering and untrusted bag storage; desktop/mobile browser tests.

See `docs/decisions/0003-contextual-shopping.md` for route lifecycle and history trade-offs.
Browser tests cover Chromium desktop/mobile emulation, not physical iOS/Android devices.

## Deliberate backend boundary

`src/lib/catalog.ts` is a clearly marked sample catalog. Product photos, prices, descriptions,
and finishes are illustrative, not verified supplier listings. The bag stores product identifiers,
options, and quantities only; display prices come from the catalog rather than local storage.
This is **not** a secure pricing/checkout boundary. A real checkout must revalidate price,
inventory, authorization, and shipping on the server. Do not accept totals from the browser.

Checkout is disabled. No accounts, payment fields, newsletter submissions, live inventory,
fake reviews, artificial scarcity, shipping promises, or customer-data collection are included.
The full sample catalog is public and intentionally bundled where UI interactions require it.

Replace the fixture catalog with a server data adapter when the schema/access model is ready.
Keep the UI package free of business/database dependencies. Avoid copying the operations app's
Supabase auth scaffolding into this app before real authenticated behavior is defined.

## Browser tests

Install the pinned Chromium browser once:

```sh
pnpm --filter @repo/storefront exec playwright install chromium
pnpm test:e2e
```

Turbo builds first. Playwright starts a production server at `127.0.0.1:3101`, checks desktop
and mobile Chromium, and stops it afterward. Tests cannot silently reuse a different running
app. Homepage screenshots are saved under ignored `test-results/` folders for visual inspection.
These tests do not verify a commerce backend or supplier products.

## Visual assets

Local illustrative photography is sourced from Unsplash image CDN URLs, under the
[Unsplash license](https://unsplash.com/license). Original image identifiers:

| File             | Source                                                         |
| ---------------- | -------------------------------------------------------------- |
| `hero.jpg`       | `https://images.unsplash.com/photo-1616486338812-3dadae4b4ace` |
| `dinnerware.jpg` | `https://images.unsplash.com/photo-1578749556568-bc2c40e68b61` |
| `lamp.jpg`       | `https://images.unsplash.com/photo-1513506003901-1e6a229e2d15` |
| `candle.jpg`     | `https://images.unsplash.com/photo-1603006905003-be475563bc59` |
| `bag.jpg`        | `https://images.unsplash.com/photo-1544816155-12df9643f363`    |

Photos are reference imagery, not supplier fulfillment assets. Replace them with rights-cleared,
accurate supplier photography before selling. Daymark is a placeholder storefront identity;
perform naming/trademark checks before adopting it commercially.
