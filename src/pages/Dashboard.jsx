import { TrendingUp, ShoppingCart, Truck, Receipt, Users, Building2, Banknote, Landmark, Package, AlertTriangle, Ban } from 'lucide-react'
import { StatCard, fmt } from '../components/ui.jsx'
const bars = [42, 58, 51, 74, 66, 90, 82]
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export default function Dashboard() {
  const stats = [
    [ShoppingCart, "Today's Sales", fmt(184500)], [TrendingUp, "Today's Profit", fmt(41200)], [Truck, "Today's Purchases", fmt(96000)],
    [Receipt, "Today's Expenses", fmt(12400)], [Users, 'Customer Receivables', fmt(512000)], [Building2, 'Supplier Payables', fmt(238000)],
    [Banknote, 'Cash Balance', fmt(76500)], [Landmark, 'Bank Balance', fmt(1240000)], [Package, 'Total Products', '2,000'],
    [AlertTriangle, 'Low Stock', '37'], [Ban, 'Out of Stock', '12'],
  ]
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([i, l, v]) => <StatCard key={l} icon={i} label={l} value={v} />)}</div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-3 font-semibold text-brand-900">Sales Overview</h3>
          <div className="flex h-48 items-end gap-3">{bars.map((b, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t bg-brand-500" style={{ height: `${b}%` }} /><span className="text-xs text-slate-500">{days[i]}</span></div>))}</div>
        </div>
        <div className="card p-4">
          <h3 className="mb-3 font-semibold text-brand-900">Action Required</h3>
          {[['Low stock products', 37], ['Out of stock', 12], ['Pending customer payments', 18], ['Supplier payments due', 6], ['Expiring products', 9], ['Pending returns', 3]].map(([l, n]) => (
            <div key={l} className="flex justify-between border-b border-brand-50 py-2 text-sm last:border-0"><span>{l}</span><span className="font-semibold text-brand-700">{n}</span></div>))}
        </div>
      </div>
    </div>
  )
}
