'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const FREE_SHIPPING_THRESHOLD_PAISE = 100_000;
const SHIPPING_FEE_PAISE = 5_000;
const PUBLIC_DIR = path.join(__dirname, 'public');

function calculateCheckout({ items, couponCode = '' } = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new TypeError('items must be a non-empty array');
  }

  const subtotalPaise = items.reduce((subtotal, item) => {
    if (
      !item ||
      !Number.isSafeInteger(item.pricePaise) ||
      item.pricePaise <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      throw new TypeError('each item needs a positive integer pricePaise and quantity');
    }

    const lineTotalPaise = item.pricePaise * item.quantity;
    const nextSubtotalPaise = subtotal + lineTotalPaise;
    if (!Number.isSafeInteger(lineTotalPaise) || !Number.isSafeInteger(nextSubtotalPaise)) {
      throw new RangeError('cart amount is too large');
    }
    return nextSubtotalPaise;
  }, 0);

  const normalizedCouponCode = typeof couponCode === 'string' ? couponCode.trim().toUpperCase() : '';
  if (normalizedCouponCode && normalizedCouponCode !== 'SAVE10') {
    throw new TypeError('unsupported coupon code');
  }

  const couponApplied = normalizedCouponCode === 'SAVE10';
  // Round 10% to the nearest paise, with half-paise values rounded up.
  const discountPaise = couponApplied
    ? Number((BigInt(subtotalPaise) + 5n) / 10n)
    : 0;
  const discountedSubtotalPaise = subtotalPaise - discountPaise;

  // Intentional demo bug: the threshold is checked after the coupon discount.
  const shippingPaise = discountedSubtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE
    ? 0
    : SHIPPING_FEE_PAISE;

  return {
    subtotalPaise,
    discountPaise,
    shippingPaise,
    totalPaise: discountedSubtotalPaise + shippingPaise,
    couponApplied,
  };
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function createServer() {
  return http.createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(fs.readFileSync(path.join(PUBLIC_DIR, 'index.html')));
      return;
    }

    if (request.method === 'POST' && request.url === '/api/checkout') {
      let body = '';
      let tooLarge = false;

      request.on('data', (chunk) => {
        body += chunk;
        if (body.length > 10_000) {
          tooLarge = true;
          request.destroy();
        }
      });

      request.on('end', () => {
        if (tooLarge) return;
        try {
          const result = calculateCheckout(JSON.parse(body));
          sendJson(response, 200, result);
        } catch (error) {
          const statusCode = error instanceof SyntaxError ? 400 : 400;
          sendJson(response, statusCode, { error: error.message });
        }
      });
      return;
    }

    sendJson(response, 404, { error: 'not found' });
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Checkout demo running at http://127.0.0.1:${PORT}`);
  });
}

module.exports = {
  calculateCheckout,
  createServer,
};
