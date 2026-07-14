import type { SettingOption } from '../../data/settings-types'
import type { ControlProps } from './control-types'

interface SegmentedControlProps extends ControlProps<string> {
  options: readonly SettingOption[]
}

export function SegmentedControl({
  id,
  value,
  disabled = false,
  options,
  onChange,
}: SegmentedControlProps) {
  return (
    <div
      id={id}
      className="segmented-control"
      role="group"
      aria-label="选择一个选项"
    >
      {options.map((option) => {
        const active = value === option.value

        return (
          <button
            key={option.value}
            className={`segmented-option ${
              active ? 'segmented-option-active' : ''
            }`}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            title={option.description}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}