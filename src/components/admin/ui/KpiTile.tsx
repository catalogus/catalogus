type KpiTileProps = {
  label: string
  value: string
  helper?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

const toneClasses: Record<NonNullable<KpiTileProps['tone']>, string> = {
  default: 'text-gray-900',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-rose-600',
}

export function KpiTile({
  label,
  value,
  helper,
  tone = 'default',
}: KpiTileProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClasses[tone]}`}>
        {value}
      </p>
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </div>
  )
}
