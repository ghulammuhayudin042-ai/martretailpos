import { X, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
export const fmt = (n) => 'PKR ' + Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 2 })
export function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 p-4" onClick={onClose}>
      <div className={`card max-h-[90vh] w-full overflow-auto ${wide ? 'max-w-3xl' : 'max-w-lg'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-brand-100 px-5 py-3">
          <h3 className="font-semibold text-brand-900">{title}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-brand-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}
const tone = { Paid: 'green', Active: 'green', Pending: 'amber', Partial: 'amber', Draft: 'slate' }
export const Badge = ({ v }) => {
  const c = { green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', slate: 'bg-slate-100 text-slate-600' }[tone[v] || 'slate']
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>{v}</span>
}
export const StatCard = ({ icon: I, label, value, hint }) => (
  <div className="card flex items-center gap-3 p-4">
    <div className="rounded-lg bg-brand-50 p-2.5 text-brand-600"><I size={20} /></div>
    <div><div className="text-xs text-slate-500">{label}</div><div className="text-lg font-semibold text-brand-900">{value}</div>{hint && <div className="text-xs text-slate-400">{hint}</div>}</div>
  </div>
)
export const EmptyState = ({ text = 'No records found.' }) => (
  <div className="flex flex-col items-center gap-2 py-12 text-slate-400"><Inbox size={32} /><p className="text-sm">{text}</p></div>
)
export function Pagination({ page, size, total, onPage, onSize }) {
  const pages = Math.max(1, Math.ceil(total / size))
  const from = total ? (page - 1) * size + 1 : 0
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b)
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-100 px-4 py-3 text-sm">
      <span className="text-slate-500">Showing {from.toLocaleString()}–{Math.min(page * size, total).toLocaleString()} of {total.toLocaleString()} records</span>
      <div className="flex items-center gap-1">
        <select className="inp !w-auto" value={size} onChange={(e) => onSize(+e.target.value)}>{[10, 25, 50, 100].map((s) => <option key={s}>{s}</option>)}</select>
        <button className="btn-o" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} />Previous</button>
        {nums.map((p) => <button key={p} onClick={() => onPage(p)} className={p === page ? 'btn-p' : 'btn-o'}>{p}</button>)}
        <button className="btn-o" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next<ChevronRight size={16} /></button>
      </div>
    </div>
  )
}
