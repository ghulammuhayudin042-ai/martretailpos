import { useState } from 'react'
import { Filter, RotateCcw, Download, Printer, FileText } from 'lucide-react'
import DataPage from './DataPage.jsx'
const PRESETS = ['Today','Yesterday','This Week','Last Week','This Month','Last Month','This Year','Last Year','Custom Range']
const iso = (d) => d.toISOString().slice(0, 10)
function range(p) {
  const n = new Date(), d = (o) => new Date(n.getFullYear(), n.getMonth(), n.getDate() + o)
  const dow = (n.getDay() + 6) % 7
  return { Today: [d(0), d(0)], Yesterday: [d(-1), d(-1)], 'This Week': [d(-dow), d(0)], 'Last Week': [d(-dow - 7), d(-dow - 1)],
    'This Month': [new Date(n.getFullYear(), n.getMonth(), 1), d(0)], 'Last Month': [new Date(n.getFullYear(), n.getMonth() - 1, 1), new Date(n.getFullYear(), n.getMonth(), 0)],
    'This Year': [new Date(n.getFullYear(), 0, 1), d(0)], 'Last Year': [new Date(n.getFullYear() - 1, 0, 1), new Date(n.getFullYear() - 1, 11, 31)] }[p]?.map(iso)
}
const FIELDS = ['Customer','Supplier','Product','Category','Brand','Cashier','Payment Method','Status']
const blank = { preset: 'This Month', from: '', to: '', ...Object.fromEntries(FIELDS.map((f) => [f, ''])) }
export default function Reports({ title }) {
  const [f, setF] = useState(blank), [applied, setApplied] = useState(null)
  const set = (k, v) => setF((x) => {
    const n = { ...x, [k]: v }
    if (k === 'preset' && v !== 'Custom Range') { const r = range(v); n.from = r[0]; n.to = r[1] }
    return n
  })
  const filter = applied && ((r) => {
    const dt = r.Date || ''
    if (applied.from && dt < applied.from) return false
    if (applied.to && dt > applied.to) return false
    return ['Customer', 'Supplier', 'Status'].every((k) => !applied[k] || String(r[k] ?? r.Name ?? '').toLowerCase().includes(applied[k].toLowerCase()))
  })
  const cols = ['Date','Reference','Customer','Amount','Paid','Balance','Status']
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-slate-500">Date Preset<select className="inp" value={f.preset} onChange={(e) => set('preset', e.target.value)}>{PRESETS.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label className="text-xs text-slate-500">Date From<input type="date" className="inp" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value, preset: 'Custom Range' })} /></label>
          <label className="text-xs text-slate-500">Date To<input type="date" className="inp" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value, preset: 'Custom Range' })} /></label>
          {FIELDS.map((k) => <label key={k} className="text-xs text-slate-500">{k}<input className="inp" value={f[k]} onChange={(e) => set(k, e.target.value)} /></label>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-p" onClick={() => setApplied(f)}><Filter size={16} />Apply</button>
          <button className="btn-o" onClick={() => { setF(blank); setApplied(null) }}><RotateCcw size={16} />Reset</button>
          <button className="btn-o" onClick={() => window.print()}><Printer size={16} />Print</button>
          <button className="btn-o" onClick={() => window.print()}><FileText size={16} />PDF</button>
        </div>
      </div>
      <DataPage key={title} title={title} cols={cols} filter={filter} hideAdd />
    </div>
  )
}
