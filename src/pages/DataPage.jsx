import { useMemo, useState, useEffect } from 'react'
import { Search, Plus, Download, Printer, Trash2, Pencil, ArrowUp, ArrowDown, Columns3 } from 'lucide-react'
import { makeRows } from '../services/api.js'
import { Badge, EmptyState, Pagination, Modal } from '../components/ui.jsx'
const STATUSES = ['Active', 'Pending', 'Paid', 'Partial', 'Draft']
const NUM = /amount|total|balance|price|cost|debit|credit|paid|stock|quantity|value|items|subtotal|discount|tax|level|limit|payable|outstanding|sales|^stock in$|^stock out$/i
const kind = (c) => /date/i.test(c) ? 'date' : /status/i.test(c) ? 'status' : /phone/i.test(c) ? 'phone' : NUM.test(c) ? 'number' : 'text'
export default function DataPage({ title, cols, filter, hideAdd }) {
  const all = useMemo(() => makeRows(cols, 1500), [cols])
  const [added, setAdded] = useState([]), [edits, setEdits] = useState({}), [removed, setRemoved] = useState([])
  const [q, setQ] = useState(''), [dq, setDq] = useState(''), [page, setPage] = useState(1), [size, setSize] = useState(25)
  const [sort, setSort] = useState(null), [hidden, setHidden] = useState([]), [sel, setSel] = useState([])
  const [loading, setLoading] = useState(true), [form, setForm] = useState(null), [errs, setErrs] = useState({})
  const [del, setDel] = useState(null), [saving, setSaving] = useState(false)
  const statusCol = cols.find((c) => kind(c) === 'status')
  useEffect(() => { const t = setTimeout(() => setDq(q), 250); return () => clearTimeout(t) }, [q])
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t) }, [title])
  useEffect(() => setPage(1), [dq, size, title, filter])
  const data = useMemo(() => [...added, ...all].map((x) => edits[x._id] || x).filter((x) => !removed.includes(x._id)), [all, added, edits, removed])
  const rows = useMemo(() => {
    let r = data.filter((x) => (!filter || filter(x)) && (!dq || Object.values(x).join(' ').toLowerCase().includes(dq.toLowerCase())))
    if (sort) r = [...r].sort((a, b) => (a[sort.c] > b[sort.c] ? 1 : -1) * (sort.d ? 1 : -1))
    return r
  }, [data, filter, dq, sort])
  const view = rows.slice((page - 1) * size, page * size)
  const vis = cols.filter((c) => !hidden.includes(c))
  const csv = (list) => {
    const t = [vis.join(','), ...list.map((r) => vis.map((c) => `"${r[c]}"`).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t])); a.download = `${title}.csv`; a.click()
  }
  const validate = (f) => {
    const e = {}
    cols.forEach((c, i) => {
      const v = String(f[c] ?? '').trim(), k = kind(c)
      if ((i < 2 || k === 'status') && !v) e[c] = `${c} is required.`
      else if (v && k === 'number' && (!isFinite(v) || +v < 0)) e[c] = 'Enter a valid non-negative number.'
      else if (v && k === 'phone' && !/^[0-9+\-\s]{7,15}$/.test(v)) e[c] = 'Enter a valid phone number.'
      else if (i === 0 && data.some((r) => r._id !== f._id && String(r[c]).toLowerCase() === v.toLowerCase())) e[c] = `${c} already exists.`
    })
    return e
  }
  const save = () => {
    const e = validate(form); setErrs(e)
    if (Object.keys(e).length) return
    setSaving(true)
    setTimeout(() => {
      const row = { _id: form._id ?? 'n' + Date.now(), ...Object.fromEntries(cols.map((c) => [c, kind(c) === 'number' && String(form[c]).trim() !== '' ? +form[c] : String(form[c] ?? '').trim()])) }
      if (form._id !== undefined) setEdits((x) => ({ ...x, [row._id]: row })); else setAdded((a) => [row, ...a])
      setSaving(false); setForm(null)
    }, 300)
  }
  const bulkStatus = (v) => { if (!v) return; setEdits((x) => ({ ...x, ...Object.fromEntries(data.filter((r) => sel.includes(r._id)).map((r) => [r._id, { ...r, [statusCol]: v }])) })); setSel([]) }
  const confirmDel = () => { const ids = del; setRemoved((r) => [...r, ...ids]); setSel((s) => s.filter((x) => !ids.includes(x))); setDel(null) }
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-4">
        <div className="relative min-w-56 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="inp pl-9" placeholder={`Search ${title}`} value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <details className="relative"><summary className="btn-o cursor-pointer list-none"><Columns3 size={16} />Columns</summary>
          <div className="card absolute right-0 z-10 mt-1 w-48 p-2">{cols.map((c) => (
            <label key={c} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" checked={!hidden.includes(c)} onChange={() => setHidden((h) => h.includes(c) ? h.filter((x) => x !== c) : [...h, c])} />{c}</label>))}</div></details>
        {sel.length > 0 && !hideAdd && <>
          {statusCol && <select className="inp !w-auto" defaultValue="" onChange={(e) => { bulkStatus(e.target.value); e.target.value = '' }}><option value="">Set status…</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>}
          <button className="btn-d" onClick={() => setDel(sel)}><Trash2 size={16} />Delete ({sel.length})</button></>}
        {sel.length > 0 && <button className="btn-o" onClick={() => csv(rows.filter((r) => sel.includes(r._id)))}><Download size={16} />Export selected</button>}
        <button className="btn-o" onClick={() => csv(rows)}><Download size={16} />Export</button>
        <button className="btn-o" onClick={() => window.print()}><Printer size={16} />Print</button>
        {!hideAdd && <button className="btn-p" onClick={() => { setForm({}); setErrs({}) }}><Plus size={16} />Add New</button>}
      </div>
      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-brand-50 text-brand-900"><tr>
            <th className="w-10 px-3 py-2"><input type="checkbox" checked={view.length > 0 && view.every((r) => sel.includes(r._id))} onChange={(e) => setSel(e.target.checked ? view.map((r) => r._id) : [])} /></th>
            {vis.map((c) => <th key={c} className="cursor-pointer whitespace-nowrap px-3 py-2 font-semibold" onClick={() => setSort((s) => ({ c, d: s?.c === c ? !s.d : true }))}>
              <span className="inline-flex items-center gap-1">{c}{sort?.c === c && (sort.d ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</span></th>)}
            {!hideAdd && <th className="px-3 py-2">Actions</th>}
          </tr></thead>
          <tbody>
            {loading ? Array.from({ length: 8 }, (_, i) => <tr key={i}><td colSpan={vis.length + 2} className="px-3 py-3"><div className="h-4 animate-pulse rounded bg-brand-50" /></td></tr>)
              : view.map((r) => (
                <tr key={r._id} className="border-t border-brand-50 hover:bg-brand-50/50">
                  <td className="px-3 py-2"><input type="checkbox" checked={sel.includes(r._id)} onChange={() => setSel((s) => s.includes(r._id) ? s.filter((x) => x !== r._id) : [...s, r._id])} /></td>
                  {vis.map((c) => <td key={c} className="whitespace-nowrap px-3 py-2">{kind(c) === 'status' ? <Badge v={r[c]} /> : typeof r[c] === 'number' ? r[c].toLocaleString() : r[c]}</td>)}
                  {!hideAdd && <td className="whitespace-nowrap px-3 py-2"><button aria-label="Edit" className="mr-2 text-brand-600" onClick={() => { setForm({ ...r }); setErrs({}) }}><Pencil size={15} /></button>
                    <button aria-label="Delete" className="text-red-500" onClick={() => setDel([r._id])}><Trash2 size={15} /></button></td>}
                </tr>))}
          </tbody>
        </table>
        {!loading && !view.length && <EmptyState text={`No ${title.toLowerCase()} found.`} />}
      </div>
      <Pagination page={page} size={size} total={rows.length} onPage={setPage} onSize={setSize} />
      {form && <Modal title={`${form._id !== undefined ? 'Edit' : 'Add'} ${title}`} onClose={() => setForm(null)} wide
        footer={<><button className="btn-o" onClick={() => setForm(null)}>Cancel</button><button className="btn-p" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button></>}>
        {Object.keys(errs).length > 0 && <p className="mb-2 text-sm text-red-600">Please fix the highlighted fields.</p>}
        <div className="grid gap-3 sm:grid-cols-2">{cols.map((c, i) => { const k = kind(c), bad = errs[c]; return (
          <label key={c} className="text-sm text-slate-600">{c}{(i < 2 || k === 'status') && <span className="text-red-500"> *</span>}
            {k === 'status' ? <select className={`inp mt-1 ${bad ? '!border-red-500' : ''}`} value={form[c] ?? ''} onChange={(e) => setForm({ ...form, [c]: e.target.value })}><option value="">Select…</option>{STATUSES.map((o) => <option key={o}>{o}</option>)}</select>
              : <input className={`inp mt-1 ${bad ? '!border-red-500' : ''}`} type={k === 'date' ? 'date' : k === 'number' ? 'number' : 'text'} min={k === 'number' ? 0 : undefined} value={form[c] ?? ''} onChange={(e) => setForm({ ...form, [c]: e.target.value })} />}
            {bad && <span className="text-xs text-red-600">{bad}</span>}</label>) })}</div></Modal>}
      {del && <Modal title="Confirm delete" onClose={() => setDel(null)}
        footer={<><button className="btn-o" onClick={() => setDel(null)}>Cancel</button><button className="btn-d" onClick={confirmDel}>Delete</button></>}>
        Delete {del.length} record(s)? This cannot be undone.</Modal>}
    </div>
  )
}
