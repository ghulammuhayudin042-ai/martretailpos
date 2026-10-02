import { LayoutDashboard, ShoppingCart, Package, Boxes, Truck, Users, Wallet, FileText, Settings } from 'lucide-react'
const s = (t) => ({ id: t.toLowerCase().replace(/[^a-z]+/g, '-'), title: t })
export const NAV = [
  { group: 'Dashboard', icon: LayoutDashboard, items: [{ id: 'dashboard', title: 'Dashboard' }] },
  { group: 'Sales', icon: ShoppingCart, items: ['POS','Sales','Quotations','Held Sales','Sales Returns','Credit Notes'].map(s) },
  { group: 'Products', icon: Package, items: ['Products','Categories','Brands','Units','Product Variants','Barcode Management','Barcode Printing'].map(s) },
  { group: 'Inventory', icon: Boxes, items: ['Stock Overview','Stock Movement','Stock Adjustment','Stock Transfer','Low Stock','Out of Stock','Damaged Stock','Expiry Tracking'].map(s) },
  { group: 'Purchases', icon: Truck, items: ['Purchases','Purchase Returns','Suppliers','Supplier Payments','Supplier Ledger'].map(s) },
  { group: 'Customers', icon: Users, items: ['Customers','Customer Groups','Customer Payments','Customer Ledger','Customer Statements','Customer Credit'].map(s) },
  { group: 'Finance', icon: Wallet, items: ['Cash Register','Bank Accounts','Expenses','Income','Receivables','Payables','Daily Closing'].map(s) },
  { group: 'Reports', icon: FileText, items: ['Sales Reports','Purchase Reports','Inventory Reports','Customer Reports','Supplier Reports','Expense Reports','Profit & Loss','Cash Reports','Tax Reports'].map(s) },
  { group: 'Administration', icon: Settings, items: ['Users','Roles & Permissions','Notifications','Audit Logs','Settings','Backup & Restore'].map(s) },
]
