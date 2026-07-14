import { useState } from 'react'
import type { ControlProps } from './control-types'

interface PasswordInputProps extends ControlProps<string> {
  placeholder?: string
  maxLength?: number
}

export function PasswordInput({
  id,
  value,
  disabled = false,
  placeholder,
  maxLength,
  onChange,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-control">
      <input
        id={id}
        className="text-control password-control-input"
        type={visible ? 'text' : 'password'}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="new-password"
        onChange={(event) => onChange(event.target.value)}
      />

      <button
        className="password-toggle"
        type="button"
        disabled={disabled}
        aria-label={visible ? '隐藏密码' : '显示密码'}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? '隐藏' : '显示'}
      </button>
    </div>
  )
}