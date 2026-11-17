const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  draft:    { label: 'Brouillon', dot: 'bg-gray-400' },
  sent:     { label: 'Envoyé',    dot: 'bg-blue-600' },
  viewed:   { label: 'Consulté',  dot: 'bg-amber-500' },
  accepted: { label: 'Accepté',   dot: 'bg-emerald-500' },
  rejected: { label: 'Refusé',    dot: 'bg-red-500' },
  expired:  { label: 'Expiré',    dot: 'bg-orange-500' },
}

export function QuoteStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-medium text-gray-700 whitespace-nowrap">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  )
}
