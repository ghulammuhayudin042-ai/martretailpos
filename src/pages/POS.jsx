import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Barcode, Search, Plus, Minus, Trash2, Pause, Save, RotateCcw, Percent, CreditCard, CheckCircle2, Printer, AlertTriangle, ShoppingCart } from 'lucide-react'
import { api } from '../services/api.js'
import { Modal, EmptyState, fmt } from '../components/ui.jsx'
import Receipt from '../components/Receipt.jsx'
const METHODS = ['Cash', 'Card', 'Bank', 'Mobile Payment', 'Other']
export default function POS({ toast }) {
  const [q, setQ] = useState(''), [dq, setDq] = useState(''), [cat, setCat] = useState('')
  const [list, setList] = useState({ rows: [], total: 0 }), [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([]), [customers, setCustomers] = useState([]), [cid, setCid] = useState('C001')
  const [disc, setDisc] = useState(0), [paid, setPaid] = useState(''), [method, setMethod] = useState('Cash')
  const [split, setSplit] = useState({ Cash: '', Card: '', Credit: '' }), [payOpen, setPayOpen] = useState(false)
  const [held, setHeld] = useState([]), [receipt, setReceipt] = useState(null), [code, setCode] = useState('')
  const searchRef = useRef(), codeRef = useRef(), custRef = useRef()
  useEffect(() => { api.customers().then(setCustomers) }, [])
  useEffect(() => { const t = setTimeout(() => setDq(q), 250); return () => clearTimeout(t) }, [q])
  useEffect(() => { setLoading(true); api.products({ q: dq, category: cat }).then((r) => { setList(r); setLoading(false) }) }, [dq, cat])
  const customer = customers.find((c) => c.id === cid) || { name: '', balance: 0, limit: 0 }
  const add = useCallback((p) => {
    if (p.stock <= 0) return toast('Insufficient stock.', 'error')
    setCart((c) => {
      const f = c.find((x) => x.id === p.id)
      if (f) return f.qty + 1 > p.stock ? (toast('Insufficient stock.', 'error'), c) : c.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x)
      return [...c, { ...p, qty: 1 }]
    })
  }, [toast])
  const scan = async (e) => {
    e.preventDefault(); if (!code.trim()) return
    const p = await api.byCode(code.trim()); p ? add(p) : toast('Product not found.', 'error'); setCode('')
  }
  const setQty = (id, d) => setCart((c) => c.map((x) => x.id === id ? { ...x, qty: Math.max(1, Math.min(x.stock, x.qty + d)) } : x))
  const t = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0)
    const discount = subtotal * (disc / 100), taxable = subtotal - discount
    const tax = cart.reduce((s, i) => s + (i.qty * i.price * (1 - disc / 100) * i.tax) / 100, 0)
    return { subtotal, discount, tax, total: taxable + tax }
  }, [cart, disc])
  const splitPaid = (+split.Cash || 0) + (+split.Card || 0)
  const amountPaid = method === 'Split' ? splitPaid : +paid || 0
  const outstanding = customer.balance + t.total - amountPaid
  const overLimit = customer.limit > 0 ? outstanding > customer.limit : outstanding > customer.balance
  const complete = () => {
    if (!cart.length) return toast('Cart is empty.', 'error')
    if (amountPaid < 0 || amountPaid > t.total + customer.balance) return toast('Invalid payment amount.', 'error')
    if (amountPaid < t.total && customer.id === 'C001') return toast('Walk-in customers must pay in full.', 'error')
    if (overLimit && customer.id !== 'C001') return toast('Customer credit limit exceeded.', 'error')
    setReceipt({ no: `INV-${Date.now().toString().slice(-6)}`, date: new Date().toLocaleString(), customer, items: cart, ...t, paid: amountPaid, method })
    setCart([]); setPaid(''); setDisc(0); setSplit({ Cash: '', Card: '', Credit: '' }); setPayOpen(false); toast('Sale completed.')
  }
  const hold = () => { if (!cart.length) return; setHeld((h) => [...h, { cart, cid, at: new Date().toLocaleTimeString() }]); setCart([]); toast('Sale held.') }
  useEffect(() => {
    const k = (e) => {
      const m = { F2: () => searchRef.current?.focus(), F4: () => custRef.current?.focus(), F6: hold, F8: () => setPayOpen(true), F9: complete, F10: () => receipt && window.print(), Escape: () => { setPayOpen(false); setReceipt(null) } }
      if (m[e.key]) { e.preventDefault(); m[e.key]() }
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  return (
    <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[1fr_26rem]">
      <section className="flex min-h-0 flex-col gap-3">
        <div className="grid gap-2 md:grid-cols-2">
          <form onSubmit={scan} className="relative"><Barcode size={16} className="absolute left-3 top-2.5 text-brand-600" />
            <input ref={codeRef} autoFocus className="inp pl-9" placeholder="Scan barcode or SKU, press Enter" value={code} onChange={(e) => setCode(e.target.value)} /></form>
          <div className="relative"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input ref={searchRef} className="inp pl-9" placeholder="Search name, SKU, brand (F2)" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap gap-2">{['', ...api.categories()].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={c === cat ? 'btn-p' : 'btn-o'}>{c || 'All'}</button>))}</div>
        <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-3 overflow-auto md:grid-cols-3 xl:grid-cols-4">
          {loading ? Array.from({ length: 8 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-brand-50" />)
            : list.rows.map((p) => (
              <button key={p.id} onClick={() => add(p)} disabled={p.stock <= 0} className="card p-3 text-left hover:border-brand-500 disabled:opacity-50">
                <div className="truncate text-sm font-semibold text-brand-900">{p.name}</div>
                <div className="text-xs text-slate-500">{p.sku} · {p.barcode}</div>
                <div className="mt-2 flex items-center justify-between"><span className="font-semibold text-brand-700">{fmt(p.price)}</span>
                  <span className={`text-xs ${p.stock <= p.min ? 'text-red-600' : 'text-slate-500'}`}>Stock {p.stock}</span></div>
              </button>))}
          {!loading && !list.rows.length && <div className="col-span-full"><EmptyState text="No products found." /></div>}
        </div>
      </section>
      <aside className="card flex min-h-0 flex-col">
        <div className="space-y-2 border-b border-brand-100 p-3">
          <select ref={custRef} className="inp" value={cid} onChange={(e) => setCid(e.target.value)}>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          {customer.id !== 'C001' && <div className="grid grid-cols-2 gap-x-3 text-xs text-slate-600">
            <span>Previous Balance: <b>{fmt(customer.balance)}</b></span><span>Credit Limit: <b>{fmt(customer.limit)}</b></span>
            <span>Available Credit: <b>{fmt(Math.max(0, customer.limit - customer.balance))}</b></span></div>}
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-3">
          {!cart.length ? <EmptyState text="Cart is empty. Scan or add a product." /> : cart.map((i) => (
            <div key={i.id} className="border-b border-brand-50 py-2 text-sm">
              <div className="flex justify-between"><span className="font-medium">{i.name}</span><button onClick={() => setCart((c) => c.filter((x) => x.id !== i.id))} aria-label="Remove"><Trash2 size={15} className="text-red-500" /></button></div>
              <div className="flex items-center justify-between text-xs text-slate-500"><span>{i.sku} · {fmt(i.price)} · Tax {i.tax}%</span>
                <span className="flex items-center gap-1"><button className="btn-o !p-1" onClick={() => setQty(i.id, -1)}><Minus size={12} /></button><b className="w-6 text-center text-slate-800">{i.qty}</b><button className="btn-o !p-1" onClick={() => setQty(i.id, 1)}><Plus size={12} /></button></span>
                <b className="text-slate-800">{fmt(i.qty * i.price)}</b></div>
            </div>))}
        </div>
        <div className="space-y-1 border-t border-brand-100 p-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{fmt(t.subtotal)}</span></div>
          <div className="flex items-center justify-between"><span>Discount %</span><input type="number" min="0" max="100" className="inp !w-20 !py-1" value={disc} onChange={(e) => setDisc(Math.min(100, Math.max(0, +e.target.value)))} /></div>
          <div className="flex justify-between"><span>Tax</span><span>{fmt(t.tax)}</span></div>
          <div className="flex justify-between text-base font-bold text-brand-900"><span>Grand Total</span><span>{fmt(t.total)}</span></div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button className="btn-o justify-center" onClick={hold}><Pause size={15} />Hold</button>
            <button className="btn-o justify-center" onClick={() => toast('Draft saved.')}><Save size={15} />Draft</button>
            <button className="btn-o justify-center" onClick={() => setCart([])}><RotateCcw size={15} />Clear</button>
          </div>
          <button className="btn-p w-full justify-center py-3 text-base" onClick={() => setPayOpen(true)} disabled={!cart.length}><CreditCard size={18} />Payment (F8)</button>
          {held.length > 0 && <div className="flex items-center justify-between text-xs text-slate-500">{held.length} held sale(s)
            <button className="text-brand-600 underline" onClick={() => { const h = held[held.length - 1]; setCart(h.cart); setCid(h.cid); setHeld((x) => x.slice(0, -1)) }}>Resume last</button></div>}
        </div>
      </aside>
      {payOpen && <Modal title="Payment" onClose={() => setPayOpen(false)}
        footer={<><button className="btn-o" onClick={() => setPayOpen(false)}>Cancel</button><button className="btn-p px-6 py-3 text-base" onClick={complete}><CheckCircle2 size={18} />Complete Sale (F9)</button></>}>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">{[...METHODS, 'Split'].map((m) => <button key={m} onClick={() => setMethod(m)} className={m === method ? 'btn-p' : 'btn-o'}>{m}</button>)}</div>
          {method === 'Split' ? ['Cash', 'Card', 'Credit'].map((k) => (
            <label key={k} className="flex items-center justify-between gap-3">{k}<input type="number" min="0" className="inp !w-40" value={split[k]} onChange={(e) => setSplit({ ...split, [k]: e.target.value })} /></label>))
            : <label className="flex items-center justify-between gap-3">Amount Paid<input type="number" min="0" autoFocus className="inp !w-40" value={paid} onChange={(e) => setPaid(e.target.value)} /></label>}
          <div className="rounded-lg bg-brand-50 p-3 space-y-1">
            <div className="flex justify-between"><span>Previous Balance</span><b>{fmt(customer.balance)}</b></div>
            <div className="flex justify-between"><span>Current Invoice</span><b>{fmt(t.total)}</b></div>
            <div className="flex justify-between"><span>Amount Paid</span><b>{fmt(amountPaid)}</b></div>
            <div className="flex justify-between text-brand-900"><span>Outstanding Balance</span><b>{fmt(Math.max(0, outstanding))}</b></div>
            <div className="flex justify-between"><span>Change</span><b>{fmt(Math.max(0, amountPaid - t.total - customer.balance))}</b></div>
          </div>
          {overLimit && customer.id !== 'C001' && <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-amber-700"><AlertTriangle size={16} />Customer credit limit exceeded.</div>}
        </div></Modal>}
      {receipt && <Receipt sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}
