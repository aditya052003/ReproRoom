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

## Free-shipping eligibility

Free-shipping eligibility uses the item subtotal before coupon discounts. For example, a ₹1,000 cart with `SAVE10` receives a ₹100 discount and free shipping, for a total of ₹900.

## Tests

Run the tests, including the coupon/free-shipping regression case, with:

```sh
npm test
```
