import type { ControlProps } from './control-types'

interface SwitchControlProps extends ControlProps<boolean> {
  onLabel?: string
  offLabel?: string
}

export function SwitchControl({
  id,
  value,
  disabled = false,
  onChange,
  onLabel = '开启',
  offLabel = '关闭',
}: SwitchControlProps) {
  return (
    <button
      id={id}
      className={`switch-control ${value ? 'switch-control-active' : ''}`}
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
    >
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>

      <span className="switch-label">{value ? onLabel : offLabel}</span>
    </button>
  )
}