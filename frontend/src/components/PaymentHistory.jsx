function PaymentHistory({ payments, nameKey = 'tutorName', emptyLabel = 'No payments yet.' }) {
  if (!payments.length) {
    return <p className="mt-4 text-sm text-slate-500">{emptyLabel}</p>
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Lesson</th>
            <th className="px-4 py-3 font-medium">With</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3 text-slate-900">{payment.lessonTitle || 'Lesson'}</td>
              <td className="px-4 py-3 text-slate-600">{payment[nameKey]}</td>
              <td className="px-4 py-3 text-slate-900">
                {payment.currency} {Number(payment.amount).toFixed(2)}
              </td>
              <td className="px-4 py-3 capitalize text-slate-700">{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PaymentHistory
