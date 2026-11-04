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

test('charges shipping for a cart just below the threshold without a coupon', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 99_999, quantity: 1 }],
  }), {
    subtotalPaise: 99_999,
    discountPaise: 0,
    shippingPaise: 5_000,
    totalPaise: 104_999,
    couponApplied: false,
  });
});

test('applies SAVE10 and charges shipping for a subtotal just below threshold', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 99_999, quantity: 1 }],
    couponCode: 'SAVE10',
  }), {
    subtotalPaise: 99_999,
    discountPaise: 10_000,
    shippingPaise: 5_000,
    totalPaise: 94_999,
    couponApplied: true,
  });
});

test('waives shipping for a cart just above the threshold without a coupon', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 100_001, quantity: 1 }],
  }), {
    subtotalPaise: 100_001,
    discountPaise: 0,
    shippingPaise: 0,
    totalPaise: 100_001,
    couponApplied: false,
  });
});

test('applies SAVE10 and waives shipping for a subtotal just above threshold', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 100_001, quantity: 1 }],
    couponCode: 'SAVE10',
  }), {
    subtotalPaise: 100_001,
    discountPaise: 10_000,
    shippingPaise: 0,
    totalPaise: 90_001,
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

test('keeps free shipping when SAVE10 discounts a qualifying item subtotal below threshold', () => {
  assert.deepEqual(calculateCheckout({
    items: [{ pricePaise: 100_000, quantity: 1 }],
    couponCode: 'SAVE10',
  }), {
    subtotalPaise: 100_000,
    discountPaise: 10_000,
    shippingPaise: 0,
    totalPaise: 90_000,
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
