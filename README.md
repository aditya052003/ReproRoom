# ReproRoom

**Report a bug in Mattermost. Review the tested repair in the same room.**

A customer applies a discount to a ₹1,000 cart and unexpectedly loses free shipping. In ReproRoom, a teammate reports the ₹50 overcharge in chat, a Codex agent reproduces the failure and fixes it on a branch, and the teammate checks the result before deciding whether to accept it.

[Watch the demo](https://youtu.be/XqM5f-dg35M) · [Read the repair report](./REPAIR_REPORT.md) · [Inspect the tests](./test/checkout.test.js)

## What Switch makes possible

A bug report often starts in team chat, but the failing test, code change, and review decision end up in different places. ReproRoom uses Switch to connect a private Mattermost room, `reproroom`, to a local Codex agent, `repro-agent`. The reporter can ask for evidence and review the result where they first described the problem.

| Who | What happened in this demo |
| --- | --- |
| Reporter | Tagged the agent with the cart inputs, the ₹950 result, and the expected ₹900 total. |
| Codex agent | Reproduced the error with a failing regression test, repaired the threshold check on a separate branch, and reported the commit and test results in the room. |
| Human reviewer | Repeated the calculation in the browser and accepted the repair for the demo. Merging and deployment require separate approval. |

## The ₹50 bug

The demo intentionally includes a bug in its baseline. Shipping should be free when the **original item subtotal** is at least ₹1,000. The baseline checked the discounted amount instead. One item and the same `SAVE10` coupon produce these two results:

| Checkout | Item subtotal | Discount | Shipping | Total |
| --- | ---: | ---: | ---: | ---: |
| [Baseline · `abd68ed`](https://github.com/aditya052003/ReproRoom/commit/abd68ed) | ₹1,000 | ₹100 | ₹50 | **₹950** |
| [Repair · `658f2a9`](https://github.com/aditya052003/ReproRoom/commit/658f2a9) | ₹1,000 | ₹100 | Free | **₹900** |

The repaired suite passed **10 tests with 0 failures**. It checks ₹999.99, ₹1,000.00, and ₹1,000.01, each with and without the coupon. Those one-paise differences matter: the first cart owes ₹50 shipping, and the other two qualify for free shipping. The [repair report](./REPAIR_REPORT.md) records the failing regression and the results after the fix.

## Try the repaired checkout

Use Git and Node.js 18 or newer. The checkout runs locally using Node's built-in modules. Run these commands in a new folder:

```sh
git clone --branch fix/checkout-free-shipping-eligibility https://github.com/aditya052003/ReproRoom.git
cd ReproRoom
npm test
npm start
```

Open [the local checkout](http://127.0.0.1:3000), set **Quantity** to **1**, enter **SAVE10**, and select **Calculate checkout**. Look for **Free** on the shipping line and **₹900.00** at the bottom. On Windows PowerShell, use `npm.cmd test` and `npm.cmd start` if needed.

### Compare the original failure

Use the fresh clone above. Stop the server with **Ctrl+C**. Run `git status --short` and continue when its output is empty.

```sh
git switch --detach abd68ed
npm start
```

Refresh the checkout and repeat the same inputs. The baseline shows **₹50 shipping** and a **₹950 total**. Stop the server again with **Ctrl+C**, then return to the reviewed branch:

```sh
git switch fix/checkout-free-shipping-eligibility
```

## Recreate the team workflow

1. In Switch Console, connect Mattermost and create a private room for the reporter and agent. This demo uses `reproroom`.
2. Create a local agent named `repro-agent`, select Codex as its provider, add the agent to the room, and give it access to the demo checkout. To repeat the repair exercise, start from baseline commit `abd68ed` in a fresh clone.
3. Ask the agent to work on a separate repair branch, run the regression test **before** changing the implementation, run the full suite afterward, and post the before-and-after results and commit for review.
4. In the room, tag the agent with a concrete report: “@repro-agent With one ₹1,000 item and SAVE10, checkout shows ₹50 shipping and a ₹950 total. I expect free shipping and ₹900. Please reproduce the issue and prepare a tested repair for review.”
5. Repeat the checkout in the browser and record your review decision in the room. Keep merge and deployment under separate human approval.

## Checkout API

`POST /api/checkout` accepts an item list and a coupon. Amounts are integer paise. For the repaired example, the request is:

```json
{
  "items": [{ "name": "Demo item", "pricePaise": 100000, "quantity": 1 }],
  "couponCode": "SAVE10"
}
```

The expected amounts are `subtotalPaise = 100000`, `discountPaise = 10000`, `shippingPaise = 0`, and `totalPaise = 90000`. The coupon takes 10% off the item subtotal, with half-paise discounts rounded up to the next paise.

Built by Aditya Raut for the **Best Business Workflow** track of the Flip the Switch Hackathon.
