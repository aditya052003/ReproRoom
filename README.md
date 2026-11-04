# Checkout Demo

A small Node.js shopping cart and checkout calculation demo. It uses only Node's built-in modules: there is no database, payment service, or API key.

## Start the app

Requires Node.js 18 or newer. From this folder, run:

```sh
npm start
```

Then open <http://127.0.0.1:3000>. Set `PORT` to use a different local port.

## Checkout behavior

- Item prices and checkout amounts are stored and calculated as integer paise.
- `SAVE10` discounts the item subtotal by 10%; a half-paise discount rounds up to the next paise.
- Shipping is ₹50 when the item subtotal is below ₹1,000, and free at ₹1,000 or above.
- `POST /api/checkout` accepts JSON such as `{"items":[{"name":"Demo item","pricePaise":100000,"quantity":1}],"couponCode":"SAVE10"}`.
- The response contains `subtotalPaise`, `discountPaise`, `shippingPaise`, and `totalPaise`.

## Seeded bug for the repair demo

The free-shipping check intentionally uses the **discounted** subtotal instead of the item subtotal before discounts. For example, a ₹1,000 cart with `SAVE10` is incorrectly charged ₹50 shipping: the buggy total is ₹950. The expected total is ₹900 with free shipping because the original item subtotal qualifies for free shipping. The baseline tests cover ordinary cases; they intentionally do not include this coupon/threshold regression case.

## Tests

Run the baseline tests with:

```sh
npm test
```
