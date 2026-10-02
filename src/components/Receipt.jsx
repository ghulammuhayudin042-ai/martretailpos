import { Printer, Download, X, Store } from 'lucide-react'
import { Modal, fmt } from './ui.jsx'
const L = ({ a, b, bold }) => <div className={`flex justify-between ${bold ? 'font-bold' : ''}`}><span>{a}</span><span>{b}</span></div>
export default function Receipt({ sale, onClose }) {
  return (
    <Modal title="Receipt Preview (80mm)" onClose={onClose}
      footer={<><button className="btn-o" onClick={onClose}><X size={16} />Close</button>
        <button className="btn-o" onClick={() => window.print()}><Download size={16} />Download PDF</button>
        <button className="btn-p" onClick={() => window.print()}><Printer size={16} />Print</button></>}>
      <div id="receipt" className="mx-auto w-[80mm] bg-white p-3 font-mono text-xs">
        <div className="text-center"><Store className="mx-auto" size={28} /><div className="text-sm font-bold">Blue Mart Retail</div>
          <div>12 Main Boulevard, Lahore</div><div>+92 300 0000000</div></div>
        <hr className="my-2 border-dashed" />
        <L a="Invoice" b={sale.no} /><L a="Date" b={sale.date} /><L a="Cashier" b="Admin" /><L a="Customer" b={sale.customer.name} />
        <hr className="my-2 border-dashed" />
        {sale.items.map((i) => <div key={i.id}><div>{i.name}</div><L a={`${i.qty} x ${i.price}`} b={(i.qty * i.price).toFixed(2)} /></div>)}
        <hr className="my-2 border-dashed" />
        <L a="Subtotal" b={fmt(sale.subtotal)} /><L a="Discount" b={fmt(sale.discount)} /><L a="Tax" b={fmt(sale.tax)} />
        <L bold a="Grand Total" b={fmt(sale.total)} />
        <hr className="my-2 border-dashed" />
        <L a="Previous Balance" b={fmt(sale.customer.balance)} /><L a="Paid" b={fmt(sale.paid)} />
        <L bold a="New Balance" b={fmt(sale.customer.balance + sale.total - sale.paid)} /><L a="Payment" b={sale.method} />
        <hr className="my-2 border-dashed" />
        <div className="text-center">Thank you for shopping!<br />Returns within 7 days with receipt.<br />help@bluemart.example</div>
      </div>
    </Modal>
  )
}
