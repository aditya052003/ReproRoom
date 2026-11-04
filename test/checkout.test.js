'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { calculateCheckout, createServer } = require('../server');

test('charges shipping for a cart below the threshold without a coupon', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 25_000, quantity: 1 }],
  }), {
    subtotalPaise: 25_000,
    discountPaise: 0,
    shippingPaise: 5_000,
    totalPaise: 30_000,
    couponApplied: false,
  });
});

test('waives shipping when the undiscounted subtotal reaches the threshold', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 100_000, quantity: 1 }],
  }), {
    subtotalPaise: 100_000,
    discountPaise: 0,
    shippingPaise: 0,
    totalPaise: 100_000,
    couponApplied: false,
  });
});

test('applies SAVE10 and charges shipping when the discounted subtotal stays below threshold', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 80_000, quantity: 1 }],
    couponCode: 'SAVE10',
  }), {
    subtotalPaise: 80_000,
    discountPaise: 8_000,
    shippingPaise: 5_000,
    totalPaise: 77_000,
    couponApplied: true,
  });
});

test('applies SAVE10 and waives shipping when the discounted subtotal remains above threshold', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 120_000, quantity: 1 }],
    couponCode: 'SAVE10',
  }), {
    subtotalPaise: 120_000,
    discountPaise: 12_000,
    shippingPaise: 0,
    totalPaise: 108_000,
    couponApplied: true,
  });
});

test('POST /api/checkout returns the calculation in integer paise', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/checkout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [{ pricePaise: 25_000, quantity: 1 }] }),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    subtotalPaise: 25_000,
    discountPaise: 0,
    shippingPaise: 5_000,
    totalPaise: 30_000,
    couponApplied: false,
  });
});
