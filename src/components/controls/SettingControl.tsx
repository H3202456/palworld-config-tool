import type {
  SettingDefinition,
  SettingRuntimeValue,
} from '../../data/settings-types'
import { MultiSelect } from './MultiSelect'
import { NumberInput } from './NumberInput'
import { PasswordInput } from './PasswordInput'
import { SegmentedControl } from './SegmentedControl'
import { SliderInput } from './SliderInput'
import { SwitchControl } from './SwitchControl'
import { TextInput } from './TextInput'
import { UnlimitedNumberInput } from './UnlimitedNumberInput'

interface SettingControlProps {
  setting: SettingDefinition
  value: SettingRuntimeValue
  disabled?: boolean
  onChange: (value: SettingRuntimeValue) => void
}

function asBoolean(value: SettingRuntimeValue): boolean {
  return typeof value === 'boolean' ? value : false
}

function asNumber(value: SettingRuntimeValue): number {
  return typeof value === 'number' ? value : 0
}

function asString(value: SettingRuntimeValue): string {
  return typeof value === 'string' ? value : ''
}

function asStringArray(value: SettingRuntimeValue): string[] {
  return Array.isArray(value) ? value : []
}

export function SettingControl({
  setting,
  value,
  disabled = false,
  onChange,
}: SettingControlProps) {
  const controlId = `setting-${setting.key}`

  switch (setting.control) {
    case 'switch':
      return (
        <SwitchControl
          id={controlId}
          value={asBoolean(value)}
          disabled={disabled}
          onChange={onChange}
        />
      )

    case 'slider':
      return (
        <SliderInput
          id={controlId}
          value={asNumber(value)}
          disabled={disabled}
          min={setting.min}
          max={setting.max}
          step={setting.step}
          precision={setting.precision}
          unit={setting.unit}
          rangeKind={setting.rangeKind}
          onChange={onChange}
        />
      )

    case 'number':
      return (
        <NumberInput
          id={controlId}
          value={asNumber(value)}
          disabled={disabled}
          min={setting.min}
          max={setting.max}
          step={setting.step}
          precision={setting.precision}
          unit={setting.unit}
          rangeKind={setting.rangeKind}
          onChange={onChange}
        />
      )

    case 'segmented':
      return (
        <SegmentedControl
          id={controlId}
          value={asString(value)}
          disabled={disabled}
          options={setting.options}
          onChange={onChange}
        />
      )

    case 'text':
      return (
        <TextInput
          id={controlId}
          value={asString(value)}
          disabled={disabled}
          placeholder={setting.placeholder}
          maxLength={setting.maxLength}
          onChange={onChange}
        />
      )

    case 'password':
      return (
        <PasswordInput
          id={controlId}
          value={asString(value)}
          disabled={disabled}
          placeholder={setting.placeholder}
          maxLength={setting.maxLength}
          onChange={onChange}
        />
      )

    case 'multi-select':
      return (
        <MultiSelect
          id={controlId}
          value={asStringArray(value)}
          disabled={disabled}
          options={setting.options}
          minSelections={setting.minSelections}
          onChange={onChange}
        />
      )

    case 'unlimited-number':
      return (
        <UnlimitedNumberInput
          id={controlId}
          value={asNumber(value)}
          disabled={disabled}
          min={setting.min}
          max={setting.max}
          step={setting.step}
          precision={setting.precision}
          unit={setting.unit}
          rangeKind={setting.rangeKind}
          unlimitedValue={setting.unlimitedValue}
          finiteDefaultValue={setting.finiteDefaultValue}
          unlimitedLabel={setting.unlimitedLabel}
          onChange={onChange}
        />
      )

    default:
      return null
  }
}