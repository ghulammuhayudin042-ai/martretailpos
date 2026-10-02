import { useState } from 'react'
import { Save, ShieldCheck } from 'lucide-react'
const ROLES = ['Super Admin','Admin','Manager','Cashier','Accountant','Inventory Manager']
const PERMS = ['View','Create','Edit','Delete','Return','Payment','Export','Print','Reports','Settings']
export function Roles({ toast }) {
  const [m, setM] = useState(() => Object.fromEntries(ROLES.map((r, i) => [r, PERMS.filter((_, j) => i < 2 || (r === 'Cashier' ? [0,1,4,5,7].includes(j) : j < 3 + i % 4))])))
  const tog = (r, p) => setM((x) => ({ ...x, [r]: x[r].includes(p) ? x[r].filter((q) => q !== p) : [...x[r], p] }))
  return (
    <div className="card overflow-auto">
      <table className="w-full text-sm"><thead className="bg-brand-50 text-left text-brand-900"><tr><th className="px-3 py-2">Role</th>{PERMS.map((p) => <th key={p} className="px-3 py-2">{p}</th>)}</tr></thead>
        <tbody>{ROLES.map((r) => <tr key={r} className="border-t border-brand-50"><td className="px-3 py-2 font-medium"><ShieldCheck size={14} className="mr-1 inline text-brand-600" />{r}</td>
          {PERMS.map((p) => <td key={p} className="px-3 py-2"><input type="checkbox" checked={m[r].includes(p)} disabled={r === 'Super Admin'} onChange={() => tog(r, p)} /></td>)}</tr>)}</tbody></table>
      <div className="p-3"><button className="btn-p" onClick={() => toast('Permissions saved.')}><Save size={16} />Save changes</button></div>
    </div>
  )
}
const SECTIONS = {
  Business: ['Business Name','Logo','Address','Phone','Email','Website'],
  POS: ['Default Customer','Default Tax','Receipt Settings','Barcode Settings','Discount Settings'],
  Invoice: ['Invoice Prefix','Invoice Number','Receipt Footer','Return Policy'],
  Currency: ['Currency','Decimal Places','Currency Position'],
  Printer: ['Receipt Width','Printer Settings'],
}
export function Settings({ toast }) {
  const [tab, setTab] = useState('Business')
  const [v, setV] = useState({ 'Business Name': 'Blue Mart Retail', Currency: 'PKR', 'Decimal Places': '2', 'Receipt Width': '80mm', 'Invoice Prefix': 'INV-', 'Default Tax': '5' })
  return (
    <div className="card">
      <div className="flex gap-1 border-b border-brand-100 p-2">{Object.keys(SECTIONS).map((s) => <button key={s} onClick={() => setTab(s)} className={s === tab ? 'btn-p' : 'btn-o'}>{s}</button>)}</div>
      <div className="grid max-w-2xl gap-3 p-4">{SECTIONS[tab].map((k) => <label key={k} className="text-sm text-slate-600">{k}
        <input className="inp mt-1" value={v[k] || ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>)}
        <div><button className="btn-p" onClick={() => toast('Settings saved.')}><Save size={16} />Save changes</button></div></div>
    </div>
  )
}
