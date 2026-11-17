const PAYMENT_DOTS: Record<string, string> = {
  unpaid: 'bg-orange-500',
  partial: 'bg-blue-600',
  paid: 'bg-emerald-500',
}

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: 'Non payée',
  partial: 'Partiel',
  paid: 'Payée',
}

export function InvoicePaymentBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 whitespace-nowrap">
      <span className={`h-1.5 w-1.5 rounded-full ${PAYMENT_DOTS[status] ?? 'bg-gray-400'}`} aria-hidden="true" />
      {PAYMENT_LABELS[status] ?? status}
    </span>
  )
}
