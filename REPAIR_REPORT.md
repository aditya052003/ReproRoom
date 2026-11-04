# Repair report: seeded free-shipping bug

## Classification

This was an intentionally seeded bug for the checkout demo's controlled repair exercise. Free-shipping eligibility was checked after applying `SAVE10`, even though the rule uses the item subtotal before discounts.

## Reproduction and repair

For an item subtotal of ₹1,000 (`100000` paise) with `SAVE10`, the expected discount is ₹100, shipping is free, and the total is ₹900. Before the fix, the focused test observed ₹50 shipping and a ₹950 total. The fix checks the original `subtotalPaise` against the ₹1,000 threshold.

Threshold coverage now includes ₹999.99, ₹1,000, and ₹1,000.01, both with and without `SAVE10`.

## Test results

Before the fix:

```text
Command: node --test --test-name-pattern="keeps free shipping" test\checkout.test.js
Exit code: 1
# tests 1
# pass 0
# fail 1
Actual: shippingPaise 5000, totalPaise 95000
Expected: shippingPaise 0, totalPaise 90000
```

After the fix:

```text
Command: node --test --test-name-pattern="keeps free shipping" test\checkout.test.js
Exit code: 0
# tests 1
# pass 1
# fail 0
```

Full suite:

```text
Command: npm test
Exit code: 0
# tests 10
# pass 10
# fail 0
```

The repair is on branch `fix/checkout-free-shipping-eligibility`. It has not been merged or deployed.
