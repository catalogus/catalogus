type StatusVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'muted'
  | 'info'

type StatusBadgeProps = {
  label: string
  variant?: StatusVariant
}

const variantClasses: Record<StatusVariant, string> = {
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  muted: 'bg-gray-100 text-gray-700',
  info: 'bg-blue-100 text-blue-800',
}

export function StatusBadge({ label, variant = 'muted' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {label}
    </span>
  )
}
