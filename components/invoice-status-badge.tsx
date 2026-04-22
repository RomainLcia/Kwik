const PAYMENT_STYLES: Record<string, string> = {
  unpaid: 'bg-orange-100 text-orange-700',
  partial: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
}

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: 'Non payée',
  partial: 'Partiel',
  paid: 'Payée',
}

export function InvoicePaymentBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {PAYMENT_LABELS[status] ?? status}
    </span>
  )
}
