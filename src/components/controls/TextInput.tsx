import type { ControlProps } from './control-types'

interface TextInputProps extends ControlProps<string> {
  placeholder?: string
  maxLength?: number
}

export function TextInput({
  id,
  value,
  disabled = false,
  placeholder,
  maxLength,
  onChange,
}: TextInputProps) {
  return (
    <input
      id={id}
      className="text-control"
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={maxLength}
      autoComplete="off"
      onChange={(event) => onChange(event.target.value)}
    />
  )
}