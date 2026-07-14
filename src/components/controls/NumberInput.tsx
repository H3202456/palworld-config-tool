import type { NumericRangeKind } from '../../data/settings-types'
import type { ControlProps } from './control-types'

interface NumberInputProps extends ControlProps<number> {
  min: number
  max: number
  step: number
  precision?: number
  unit?: string
  rangeKind: NumericRangeKind
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function roundToPrecision(value: number, precision: number): number {
  return Number(value.toFixed(precision))
}

export function NumberInput({
  id,
  value,
  disabled = false,
  min,
  max,
  step,
  precision = 0,
  unit,
  rangeKind,
  onChange,
}: NumberInputProps) {
  const commitValue = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) {
      return
    }

    const limitedValue =
      rangeKind === 'hard'
        ? clamp(nextValue, min, max)
        : nextValue

    onChange(roundToPrecision(limitedValue, precision))
  }

  const decreaseDisabled =
    disabled || (rangeKind === 'hard' && value <= min)

  const increaseDisabled =
    disabled || (rangeKind === 'hard' && value >= max)

  return (
    <div className="number-control">
      <div className="numeric-stepper">
        <button
          className="stepper-button"
          type="button"
          aria-label="减少"
          disabled={decreaseDisabled}
          onClick={() => commitValue(value - step)}
        >
          −
        </button>

        <div className="numeric-input-wrapper">
          <input
            id={id}
            className="numeric-input"
            type="number"
            value={value}
            min={rangeKind === 'hard' ? min : undefined}
            max={rangeKind === 'hard' ? max : undefined}
            step={step}
            disabled={disabled}
            onChange={(event) => {
              if (event.target.value === '') {
                return
              }

              commitValue(Number(event.target.value))
            }}
          />

          {unit && <span className="numeric-unit">{unit}</span>}
        </div>

        <button
          className="stepper-button"
          type="button"
          aria-label="增加"
          disabled={increaseDisabled}
          onClick={() => commitValue(value + step)}
        >
          +
        </button>
      </div>

      <p className="control-hint">
        {rangeKind === 'hard' ? '允许范围' : '建议范围'}：
        {min} ～ {max}
      </p>
    </div>
  )
}