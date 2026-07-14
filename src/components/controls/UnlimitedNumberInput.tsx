import type { NumericRangeKind } from '../../data/settings-types'
import type { ControlProps } from './control-types'
import { NumberInput } from './NumberInput'
import { SwitchControl } from './SwitchControl'

interface UnlimitedNumberInputProps extends ControlProps<number> {
  min: number
  max: number
  step: number
  precision?: number
  unit?: string
  rangeKind: NumericRangeKind
  unlimitedValue: number
  finiteDefaultValue: number
  unlimitedLabel: string
}

export function UnlimitedNumberInput({
  id,
  value,
  disabled = false,
  min,
  max,
  step,
  precision = 0,
  unit,
  rangeKind,
  unlimitedValue,
  finiteDefaultValue,
  unlimitedLabel,
  onChange,
}: UnlimitedNumberInputProps) {
  const unlimited = value === unlimitedValue

  return (
    <div className="unlimited-number-control">
      <SwitchControl
        id={`${id}-unlimited`}
        value={unlimited}
        disabled={disabled}
        onLabel="已开启"
        offLabel="已关闭"
        onChange={(nextUnlimited) => {
          onChange(
            nextUnlimited
              ? unlimitedValue
              : finiteDefaultValue,
          )
        }}
      />

      <p className="unlimited-label">{unlimitedLabel}</p>

      {!unlimited && (
        <NumberInput
          id={id}
          value={value}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          precision={precision}
          unit={unit}
          rangeKind={rangeKind}
          onChange={onChange}
        />
      )}

      {unlimited && (
        <p className="control-hint">
          当前将自动写入底层无限制数值，无需手动填写。
        </p>
      )}
    </div>
  )
}