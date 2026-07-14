import type {
  SettingDefinition,
  SettingRuntimeValue,
} from '../data/settings-types'
import type { ValidationIssue } from '../validation/validation-types'
import { SettingControl } from './controls/SettingControl'

interface SettingRowProps {
  setting: SettingDefinition
  value: SettingRuntimeValue
  defaultValue: SettingRuntimeValue
  modified: boolean
  disabled?: boolean
  disabledReason?: string
  issues?: readonly ValidationIssue[]
  onChange: (value: SettingRuntimeValue) => void
  onReset: () => void
}

function formatNumber(
  value: number,
  precision: number | undefined,
  unit: string | undefined,
): string {
  const formattedValue =
    precision === undefined ? String(value) : value.toFixed(precision)

  return unit ? `${formattedValue} ${unit}` : formattedValue
}

function formatSettingValue(
  setting: SettingDefinition,
  value: SettingRuntimeValue,
): string {
  switch (setting.control) {
    case 'switch':
      return value === true ? '开启' : '关闭'

    case 'slider':
    case 'number':
      return typeof value === 'number'
        ? formatNumber(value, setting.precision, setting.unit)
        : '无效数值'

    case 'unlimited-number':
      if (typeof value !== 'number') {
        return '无效数值'
      }

      if (value === setting.unlimitedValue) {
        return setting.unlimitedLabel
      }

      return formatNumber(value, setting.precision, setting.unit)

    case 'segmented': {
      if (typeof value !== 'string') {
        return '无效选项'
      }

      const option = setting.options.find(
        (candidate) => candidate.value === value,
      )

      return option?.label ?? value
    }

    case 'text':
      if (typeof value !== 'string') {
        return '无效文本'
      }

      return value.length > 0 ? value : '空白'

    case 'password':
      if (typeof value !== 'string') {
        return '无效密码'
      }

      return value.length > 0
        ? `已设置，共 ${value.length} 个字符`
        : '未设置'

    case 'multi-select': {
      if (!Array.isArray(value)) {
        return '无效选项'
      }

      if (value.length === 0) {
        return '未选择'
      }

      return value
        .map((selectedValue) => {
          const option = setting.options.find(
            (candidate) => candidate.value === selectedValue,
          )

          return option?.label ?? selectedValue
        })
        .join('、')
    }

    default:
      return String(value)
  }
}

function getIssueLabel(issue: ValidationIssue): string {
  switch (issue.severity) {
    case 'error':
      return '错误'

    case 'warning':
      return '提醒'

    case 'info':
      return '信息'

    default:
      return '检查结果'
  }
}

export function SettingRow({
  setting,
  value,
  defaultValue,
  modified,
  disabled = false,
  disabledReason,
  issues = [],
  onChange,
  onReset,
}: SettingRowProps) {
  const currentValueText = formatSettingValue(setting, value)
  const defaultValueText = formatSettingValue(setting, defaultValue)

  const containsError = issues.some(
    (issue) => issue.severity === 'error',
  )

  const containsWarning = issues.some(
    (issue) => issue.severity === 'warning',
  )

  const cardClassName = [
    'setting-card',
    modified ? 'setting-card-modified' : '',
    containsError ? 'setting-card-error' : '',
    !containsError && containsWarning
      ? 'setting-card-warning'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      id={`setting-row-${setting.key}`}
      className={cardClassName}
    >
      <header className="setting-card-header">
        <div className="setting-card-heading">
          <div className="setting-title-row">
            <h3>{setting.label}</h3>

            {modified && (
              <span className="modified-badge">已修改</span>
            )}
          </div>

          <code className="setting-key">{setting.key}</code>

          <p className="setting-description">
            {setting.description}
          </p>

          {setting.example && (
            <p className="setting-example">
              示例：{setting.example}
            </p>
          )}
        </div>

        <button
          className="reset-setting-button"
          type="button"
          disabled={!modified || disabled}
          onClick={onReset}
        >
          恢复默认
        </button>
      </header>

      <div className="setting-value-summary">
        <div className="value-summary-item">
          <span>当前值</span>
          <strong>{currentValueText}</strong>
        </div>

        <div className="value-summary-divider" />

        <div className="value-summary-item">
          <span>官方默认</span>
          <strong>{defaultValueText}</strong>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="setting-validation-list">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`setting-validation-item setting-validation-${issue.severity}`}
            >
              <strong>{getIssueLabel(issue)}</strong>
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="setting-control-area">
        {disabled && disabledReason && (
          <div className="setting-disabled-note">
            <span aria-hidden="true">🔒</span>
            <span>{disabledReason}</span>
          </div>
        )}

        <SettingControl
          setting={setting}
          value={value}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
    </article>
  )
}