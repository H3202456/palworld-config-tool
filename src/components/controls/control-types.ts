export interface ControlProps<TValue> {
  id: string
  value: TValue
  disabled?: boolean
  onChange: (value: TValue) => void
}