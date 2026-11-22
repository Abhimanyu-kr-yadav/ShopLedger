var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function item(id, name, price, qty, hsn) {
  return {
    id: id,
    name: name,
    price: price,
    qty: qty,
    hsn: hsn,
    gstRate: null
  };
}

function calculate(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon)
  };
}

test('CURRENT BEHAVIOUR: #1001 invoice uses each line HSN GST slab', function () {
  var order = {
    coupon: '',
    items: [
      item(8, 'Assam CTC Masala Chai 250g', 140, 2, '0902'),
      item(2, 'Unpolished Toor Dal 1kg', 165, 2, '0713')
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9,
    rows: [
      { name: 'Assam CTC Masala Chai 250g', sku: '-', hsn: '0902', qty: 2, price: 140, gstPercent: 18, line: 280, lineTax: 50.4 },
      { name: 'Unpolished Toor Dal 1kg', sku: '-', hsn: '0713', qty: 2, price: 165, gstPercent: 5, line: 330, lineTax: 16.5 }
    ]
  });
  assert.equal(result.checkout.total, 676.9);
});

test('CURRENT BEHAVIOUR: #1002 invoice applies SAVE10 before HSN GST', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      item(1, 'Indrayani Basmati Rice 5kg', 640, 1, '1006'),
      item(4, 'Cold-Pressed Sunflower Oil 1L', 190, 2, '1512')
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
    rows: [
      { name: 'Indrayani Basmati Rice 5kg', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Cold-Pressed Sunflower Oil 1L', sku: '-', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.deepEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('CURRENT BEHAVIOUR: #1004 invoice respects the SAVE10 ₹150 cap', function () {
  var order = {
    coupon: 'SAVE10',
    items: [item(5, 'Cold-Pressed Groundnut Oil 5L', 1120, 2, '1508')]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
    rows: [
      { name: 'Cold-Pressed Groundnut Oil 5L', sku: '-', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.deepEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: #1008 all-18% uncouponed invoice matches checkout totals', function () {
  var order = {
    coupon: '',
    items: [
      item(8, 'Assam CTC Masala Chai 250g', 140, 1, '0902'),
      item(12, 'Kokum Sherbet Concentrate 750ml', 180, 2, '2106')
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
    rows: [
      { name: 'Assam CTC Masala Chai 250g', sku: '-', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Sherbet Concentrate 750ml', sku: '-', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.deepEqual(
    { tax: result.checkout.tax, total: result.checkout.total },
    { tax: 90, total: 590 }
  );
});

test('invoice matches checkout HSN GST breakdown and totals for #1001', function () {
  var order = {
    coupon: '',
    items: [
      item(8, 'Assam CTC Masala Chai 250g', 140, 2, '0902'),
      item(2, 'Unpolished Toor Dal 1kg', 165, 2, '0713')
    ]
  };
  var result = calculate(order);

  assert.deepEqual(
    {
      subtotal: result.invoice.subtotal,
      discount: result.invoice.discount,
      tax: result.invoice.tax,
      cgst: result.invoice.cgst,
      sgst: result.invoice.sgst,
      total: result.invoice.total,
      gstPercents: result.invoice.rows.map(function (row) { return row.gstPercent; })
    },
    {
      subtotal: result.checkout.subtotal,
      discount: result.checkout.discount,
      tax: result.checkout.tax,
      cgst: result.checkout.cgst,
      sgst: result.checkout.sgst,
      total: result.checkout.total,
      gstPercents: [18, 5]
    }
  );
});
