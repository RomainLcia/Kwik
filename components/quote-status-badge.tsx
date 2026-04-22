import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:    { label: 'Brouillon',  className: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Envoyé',     className: 'bg-blue-100 text-blue-700' },
  viewed:   { label: 'Consulté',   className: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Accepté',    className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusé',     className: 'bg-red-100 text-red-700' },
  expired:  { label: 'Expiré',     className: 'bg-orange-100 text-orange-700' },
}

export function QuoteStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
