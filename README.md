# Estackly Next.js storefront starter

A headless storefront for an [Estackly](https://estackly.com) store, built with Next.js (App Router) and [`@estackly/storefront`](https://developers.estackly.com/docs/starters).

- Home page with the store's hero banner and featured products
- Product list with categories, search, sorting and paging
- Product pages with photos, option pickers (size, colour…), reviews and related products
- Cart with quantities, discount codes and live totals (tax and shipping from the store)
- Checkout on the store's own secure checkout, so payments, tax and shipping stay correct
- Store name, logo, colours, contact details and policy pages straight from the store
- Currency switcher when the store sells in more than one currency

## Run it

1. In your store's admin go to **Settings → Developers** and create a **private** key with the permissions *catalog:read*, *content:read*, *cart:write* and *checkout:write*.
2. Then:

```sh
cp .env.example .env.local   # paste the key into ESTACKLY_PRIVATE_KEY
npm install
npm run dev                  # http://localhost:3000
```

No store yet? [Join the partner programme](https://developers.estackly.com/partners) for free test stores with demo products.

## How it fits together

| File | What it does |
| --- | --- |
| `lib/estackly.ts` | The API client (server only), the cart cookie and the currency cookie |
| `lib/actions.ts` | Server actions: add to cart, change quantity, discount code, checkout |
| `app/layout.tsx` | Header, categories, cart count, footer with policy pages |
| `app/page.tsx` | Home page |
| `app/products/page.tsx` | Product list (`?category=`, `?q=`, `?sort=`) |
| `app/products/[slug]/page.tsx` | Product page |
| `app/cart/page.tsx` | Cart and checkout button |
| `app/pages/[slug]/page.tsx` | About, policies and other store pages |

Every API call runs on the server, so the key never reaches the browser. The cart's id and token sit in an `httpOnly` cookie. Store details, categories and pages are cached for five minutes; prices, stock and carts are always live.

**Checkout** asks the API for a one-use link (`POST /carts/{id}/checkout`) and redirects the shopper to it. The store's checkout then takes the address, delivery option and payment with whatever gateways the merchant has switched on.

## Deploy

Any host that runs Next.js works (Vercel, Netlify, a Node server). Set `ESTACKLY_PRIVATE_KEY` in the host's environment settings.

## Learn more

- [Headless storefront guide](https://developers.estackly.com/docs/guides/headless-storefront)
- [API reference](https://developers.estackly.com/reference)
- [Community](https://community.estackly.com)

MIT licensed.
