import { useState } from 'react'
import { Bell, AlertTriangle, Ban, CreditCard, Truck, CalendarX, CheckCircle2, RotateCcw, Lock } from 'lucide-react'
import { fmt, Modal } from '../components/ui.jsx'
const N = [[AlertTriangle, 'Low Stock', '37 products are below minimum level'], [Ban, 'Out of Stock', '12 products are out of stock'], [CreditCard, 'Customer Payment Due', 'Bilal General Store owes PKR 42,000'],
  [Truck, 'Supplier Payment Due', 'Nova Traders payment due in 3 days'], [CalendarX, 'Expired Product', 'Batch B-1042 expired'], [CalendarX, 'Expiring Product', '9 batches expire within 30 days'],
  [CheckCircle2, 'Sale Completed', 'INV-100245 completed'], [RotateCcw, 'Return Completed', 'Return RET-2201 processed']]
export function Notifications() {
  const [read, setRead] = useState([])
  return <div className="card divide-y divide-brand-50">{N.map(([I, t, d], i) => (
    <button key={t} onClick={() => setRead([...read, i])} className={`flex w-full items-center gap-3 p-4 text-left ${read.includes(i) ? 'opacity-50' : ''}`}>
      <span className="rounded-lg bg-brand-50 p-2 text-brand-600"><I size={18} /></span><span><b className="block text-sm">{t}</b><span className="text-xs text-slate-500">{d}</span></span></button>))}</div>
}
export function CashClose({ title }) {
  const [actual, setActual] = useState(''), [done, setDone] = useState(false), [ask, setAsk] = useState(false)
  const rows = [['Opening Cash', 20000], ['Cash Sales', 96500], ['Customer Payments', 18000], ['Expenses', -12400], ['Refunds', -3000], ['Withdrawals', -5000]]
  const expected = rows.reduce((s, r) => s + r[1], 0), bad = actual !== '' && (!isFinite(actual) || +actual < 0)
  const diff = actual === '' || bad ? null : +actual - expected
  return (
    <div className="card max-w-xl space-y-2 p-5 text-sm">
      {rows.map(([l, v]) => <div key={l} className="flex justify-between"><span>{l}</span><b>{fmt(v)}</b></div>)}
      <div className="flex justify-between border-t border-brand-100 pt-2 text-base text-brand-900"><span>Expected Cash</span><b>{fmt(expected)}</b></div>
      <label className="block">Actual Cash<input type="number" min="0" disabled={done} className={`inp mt-1 ${bad ? '!border-red-500' : ''}`} value={actual} onChange={(e) => setActual(e.target.value)} /></label>
      {bad && <p className="text-xs text-red-600">Invalid amount.</p>}
      {diff !== null && <div className={`flex justify-between ${diff ? 'text-amber-700' : 'text-emerald-700'}`}><span>Difference</span><b>{fmt(diff)}</b></div>}
      <button className="btn-p" disabled={done || diff === null} onClick={() => setAsk(true)}><Lock size={16} />{done ? 'Closed' : `Close ${title === 'Daily Closing' ? 'Day' : 'Register'}`}</button>
      {ask && <Modal title="Confirm closing" onClose={() => setAsk(false)} footer={<><button className="btn-o" onClick={() => setAsk(false)}>Cancel</button><button className="btn-p" onClick={() => { setDone(true); setAsk(false) }}>Confirm</button></>}>Close with a difference of {fmt(diff)}?</Modal>}
    </div>
  )
}
