import type { SettingOption } from '../../data/settings-types'
import type { ControlProps } from './control-types'

interface MultiSelectProps extends ControlProps<string[]> {
  options: readonly SettingOption[]
  minSelections?: number
}

export function MultiSelect({
  id,
  value,
  disabled = false,
  options,
  minSelections = 0,
  onChange,
}: MultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    const selected = value.includes(optionValue)

    if (selected) {
      if (value.length <= minSelections) {
        return
      }

      onChange(value.filter((item) => item !== optionValue))
      return
    }

    onChange([...value, optionValue])
  }

  return (
    <div
      id={id}
      className="multi-select"
      role="group"
      aria-label="选择一个或多个选项"
    >
      {options.map((option) => {
        const selected = value.includes(option.value)

        const cannotDeselect =
          selected && value.length <= minSelections

        return (
          <button
            key={option.value}
            className={`multi-select-option ${
              selected ? 'multi-select-option-active' : ''
            }`}
            type="button"
            disabled={disabled || cannotDeselect}
            aria-pressed={selected}
            title={
              cannotDeselect
                ? `至少需要选择 ${minSelections} 项`
                : option.description
            }
            onClick={() => toggleOption(option.value)}
          >
            <span className="multi-select-check">
              {selected ? '✓' : ''}
            </span>

            {option.label}
          </button>
        )
      })}
    </div>
  )
}