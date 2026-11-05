# ReproRoom: from bug report to reviewed repair

ReproRoom is a team workflow for fixing bugs with a clear human review step. A teammate reports a bug in Mattermost, Switch connects that room to a Codex agent, Codex reproduces and tests a repair on its branch, and a person reviews the result before any merge or deployment.

## Set up the room and agent

1. In Switch, create a room bridged to Mattermost and add the teammate and Codex agent who will work on the demo.
2. Give the agent access to this checkout and instructions to reproduce reported behavior with a focused test, make the smallest relevant repair on a separate branch, run the tests, and report the commands and results. Keep merge and deployment under separate human approval.
3. Ask the teammate to report the exact steps, expected result, actual result, environment, and any relevant logs. For example: “With one ₹1,000 item and `SAVE10`, I expect ₹900 total and free shipping; the page shows ₹950 and ₹50 shipping.”
4. Have the agent post its reproduction and test results in the room. A human reviews the branch and repair report, then accepts or requests changes.

## Walkthrough: the seeded checkout bug

The cart contains one ₹1,000 item. At baseline commit `abd68ed`, `SAVE10` reduces the item subtotal to ₹900 before the shipping check, so the bug adds ₹50 shipping and returns **₹950**. At repaired commit `658f2a9`, shipping eligibility uses the original ₹1,000 item subtotal, so shipping is free and the total is **₹900**.

The repaired commit's full test suite reports **10 passed, 0 failed** with `npm test`. The cases cover ₹999.99, ₹1,000, and ₹1,000.01, each with and without `SAVE10`, plus the coupon and endpoint cases.

## Run the demo

Requires Node.js 18 or newer. No package installation is needed; the app uses Node's built-in modules. Use a fresh clone that includes commits `abd68ed`, `658f2a9`, and branch `fix/checkout-free-shipping-eligibility`. Start with a clean working tree; `git status --short` should print nothing.

```sh
node --version
git status --short
git switch --detach abd68ed
npm start
```

Open <http://127.0.0.1:3000>, enter `SAVE10`, and select **Calculate checkout**. The baseline shows a ₹950 total. Stop the server with Ctrl+C, then view and test the repair:

```sh
git switch --detach 658f2a9
npm test
npm start
```

The repaired page shows a ₹900 total with free shipping. Stop the server with Ctrl+C, then return to the repair branch:

```sh
git switch fix/checkout-free-shipping-eligibility
```

In Windows PowerShell, `npm.cmd start` and `npm.cmd test` are alternatives to `npm start` and `npm test`. The repair stays on its branch until a human separately approves a merge or deployment.

## Repair details

See the [repair report](REPAIR_REPORT.md) for the pre-fix reproduction, focused regression result, full-suite output, and threshold coverage. The [checkout tests](test/checkout.test.js) show the cases directly.

## Checkout behavior

- Item prices and checkout amounts are stored and calculated as integer paise.
- `SAVE10` discounts the item subtotal by 10%; a half-paise discount rounds up to the next paise.
- Shipping is ₹50 when the item subtotal is below ₹1,000, and free at ₹1,000 or above before discounts.
- `POST /api/checkout` accepts JSON such as `{"items":[{"name":"Demo item","pricePaise":100000,"quantity":1}],"couponCode":"SAVE10"}`.
- The response contains `subtotalPaise`, `discountPaise`, `shippingPaise`, and `totalPaise`.
