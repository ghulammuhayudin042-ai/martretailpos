// Service layer: swap these functions for real HTTP/DB calls later; UI stays unchanged.
const CATS = ['Grocery','Beverages','Apparel','Electronics','Household','Stationery']
const BRANDS = ['Nova','Zenith','Orbit','Crest','Alpha']
const NAMES = ['Basmati Rice 5kg','Cooking Oil 3L','Green Tea Box','Cotton T-Shirt','USB Cable','Notebook A4','Dish Soap','LED Bulb','Mineral Water 1.5L','Sugar 1kg']
const r = (i, m) => (i * 7919 + 13) % m
export const PRODUCTS = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1, name: `${NAMES[i % 10]} #${i + 1}`, sku: `SKU${String(i + 1).padStart(5, '0')}`,
  barcode: String(6001000000000 + i * 13), category: CATS[r(i, 6)], brand: BRANDS[r(i, 5)],
  cost: 80 + r(i, 900), price: 120 + r(i, 1200), stock: r(i, 60) === 0 ? 0 : r(i, 120), min: 10, tax: 5,
}))
export const CUSTOMERS = [
  { id: 'C001', name: 'Walk-in Customer', balance: 0, limit: 0 },
  { id: 'C002', name: 'Ahmed Traders', balance: 10000, limit: 50000 },
  { id: 'C003', name: 'Bilal General Store', balance: 42000, limit: 45000 },
  { id: 'C004', name: 'Sana Boutique', balance: 0, limit: 20000 },
]
export const api = {
  products: async ({ q = '', category = '', page = 1, size = 24 } = {}) => {
    const t = q.toLowerCase()
    const all = PRODUCTS.filter((p) => (!category || p.category === category) &&
      (!t || [p.name, p.sku, p.barcode, p.brand, p.category].some((v) => v.toLowerCase().includes(t))))
    return { rows: all.slice((page - 1) * size, page * size), total: all.length }
  },
  byCode: async (code) => PRODUCTS.find((p) => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase()),
  customers: async () => CUSTOMERS,
  categories: () => CATS,
}
// Generic mock rows for list modules
const STATUS = ['Paid','Pending','Partial','Active','Draft']
export function makeRows(cols, n) {
  return Array.from({ length: n }, (_, i) => {
    const row = { _id: i }
    cols.forEach((c, j) => {
      const k = c.toLowerCase()
      row[c] = /date/.test(k) ? `2026-09-${String(1 + ((i + j) % 28)).padStart(2, '0')}`
        : /status/.test(k) ? STATUS[(i + j) % 5]
        : /number|reference|invoice|id$/.test(k) ? `${c.slice(0, 3).toUpperCase()}-${10000 + i}`
        : /customer|supplier|name|user|cashier/.test(k) ? ['Ahmed Traders','Bilal Store','Sana Boutique','Noor Mart'][(i + j) % 4]
        : /amount|total|balance|price|cost|debit|credit|paid|stock|qty|quantity|value/.test(k) ? 100 + ((i * 37 + j * 91) % 9000)
        : `${c} ${i + 1}`
    })
    return row
  })
}
