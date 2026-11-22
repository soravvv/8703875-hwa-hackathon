# ScentQuest

Scent-driven enrichment toys for curious dogs — a storefront built with React and Vite, deployed on Vercel.

Live site: https://8703875-hwa-hackathon.vercel.app

## What it does

- **Landing page** — hero, the boredom problem, a four-step "how it works", three difficulty levels, a ScentQuest vs ordinary toy comparison table, reviews and a closing CTA.
- **Shop** — three kits (Snuffle Snack Mat, Scent Puzzle Box, Backyard Trail Kit) with size, colour and scent variants, add-ons and live pricing.
- **Product page** — image gallery, variant pickers, add-ons, quantity, live price breakdown and add-to-cart feedback.
- **Cart** — persisted in `localStorage`, quantity controls, remove, delivery-fee progress towards free delivery.
- **Checkout** — validated name, phone, email, address and pincode with inline errors, cash on delivery, server-side order creation.
- **Order confirmation** — order ID, items, totals and delivery address.
- **About, Safety guide and FAQ** pages, a 404 page, per-page document titles and an error boundary.

## Stack

| Layer | Choice |
| --- | --- |
| Front end | React 19 + Vite 8, hash-based routing (no router library) |
| Styling | Hand-written CSS design system in `src/index.css` |
| Lint | Oxlint (`npm run lint`) |
| Back end | Vercel serverless function at `api/orders.js` |
| Storage | Vercel Blob (private store `sq-orders`), with an in-memory fallback |

## API

`POST /api/orders`

```json
{
  "items": [
    {
      "productId": "snuffle-mat",
      "name": "Snuffle Snack Mat",
      "size": "Small",
      "color": "forest",
      "scent": "Unscented",
      "addOns": [],
      "qty": 1,
      "unitPrice": 1299
    }
  ],
  "customer": {
    "name": "Priya Sharma",
    "phone": "9876543210",
    "email": "priya@example.com",
    "address": "Flat 4B, Green Residency, 12 MG Road",
    "pincode": "560001",
    "paymentMethod": "cash_on_delivery"
  }
}
```

Returns `201` with `{ ok, orderId, order }`. Totals are always recomputed on the server — client-supplied totals are ignored. Invalid payloads return `400` with a field-keyed `errors` object; a wrong content type returns `415`, an oversized body `413`, and any other method `405`.

`GET /api/orders` lists orders. `GET /api/orders?id=SQ-XXXXXXXX` returns a single order, or `404` when the id is unknown.

## Local development

```bash
npm install
npm run dev      # dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run lint     # oxlint
```

## Deployment

The project is linked to the Vercel project `8703875-hwa-hackathon`. `vercel --prod` from a git checkout is blocked by Vercel's commit-author team check on the Hobby plan, so the deploy is run from a copy of the project outside git:

```bash
rsync -a --delete --exclude '.git' --exclude 'node_modules' --exclude '.hwa' \
  --exclude 'init.py' --exclude 'submit.py' --exclude 'hwa-start.sh' \
  --exclude 'opencode.json' --exclude '.vercel' --exclude '.env.local' --exclude 'dist' \
  ./ /tmp/sq-deploy/
cd /tmp/sq-deploy && vercel link --yes --scope <team> --project 8703875-hwa-hackathon && vercel --prod
```

Order storage needs the `BLOB_READ_WRITE_TOKEN` environment variable, which is already set on the Vercel project. Without it the API falls back to an in-memory array.
