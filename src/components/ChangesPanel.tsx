import { useMemo } from 'react'
import {
  SETTINGS_SCHEMA,
  type SettingKey,
  type SettingsValues,
} from '../data/settings-schema'
import type {
  SettingDefinition,
  SettingRuntimeValue,
} from '../data/settings-types'
import { serializeSettingValue } from '../parser/setting-value'

interface ChangesPanelProps {
  values: SettingsValues
  baselineValues: SettingsValues
  officialDefaultValues: SettingsValues
  baselineLabel: string
  onClose: () => void
  onResetSetting: (key: SettingKey) => void
  onResetAll: () => void
  onSelectSetting: (key: SettingKey) => void
}

function valuesAreEqual(
  first: SettingRuntimeValue,
  second: SettingRuntimeValue,
): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length &&
      first.every((item, index) => item === second[index])
    )
  }

  return first === second
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
      return typeof value === 'string'
        ? value || '空白'
        : '无效文本'

    case 'password':
      if (typeof value !== 'string') {
        return '无效密码'
      }

      return value.length > 0
        ? `已设置，共 ${value.length} 个字符`
        : '未设置'

    case 'multi-select':
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

    default:
      return String(value)
  }
}

function formatIniValue(
  setting: SettingDefinition,
  value: SettingRuntimeValue,
): string {
  if (setting.control === 'password') {
    return typeof value === 'string' && value.length > 0
      ? '"••••••"'
      : '""'
  }

  try {
    return serializeSettingValue(setting, value)
  } catch {
    return '<无法生成>'
  }
}

export function ChangesPanel({
  values,
  baselineValues,
  officialDefaultValues,
  baselineLabel,
  onClose,
  onResetSetting,
  onResetAll,
  onSelectSetting,
}: ChangesPanelProps) {
  const changes = useMemo(
    () =>
      SETTINGS_SCHEMA.filter(
        (setting) =>
          !valuesAreEqual(
            values[setting.key],
            baselineValues[setting.key],
          ),
      ),
    [baselineValues, values],
  )

  const handleResetAll = () => {
    const confirmed = window.confirm(
      `确定撤销全部 ${changes.length} 项修改，并恢复到${baselineLabel}吗？`,
    )

    if (confirmed) {
      onResetAll()
    }
  }

  return (
    <div
      className="config-preview-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="config-preview-dialog changes-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="修改前后差异"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="config-tool-heading">
          <div>
            <p className="section-label">修改前后差异</p>
            <h2>本次修改了 {changes.length} 项</h2>
            <p>
              基准为{baselineLabel}。这里仅显示相对基准发生变化的参数。
            </p>
          </div>

          <button
            className="config-close-button"
            type="button"
            aria-label="关闭修改差异"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="changes-toolbar">
          <span>
            “恢复官方默认”和“撤销到{baselineLabel}”是两件不同的事。
          </span>

          <button
            className="button button-secondary"
            type="button"
            disabled={changes.length === 0}
            onClick={handleResetAll}
          >
            撤销全部修改
          </button>
        </div>

        {changes.length > 0 ? (
          <div className="changes-list">
            {changes.map((setting) => {
              const baselineValue = baselineValues[setting.key]
              const currentValue = values[setting.key]
              const officialValue = officialDefaultValues[setting.key]

              const currentDiffersFromOfficial = !valuesAreEqual(
                currentValue,
                officialValue,
              )

              const baselineDiffersFromOfficial = !valuesAreEqual(
                baselineValue,
                officialValue,
              )

              return (
                <article className="change-card" key={setting.key}>
                  <header className="change-card-header">
                    <div>
                      <h3>{setting.label}</h3>
                      <code className="setting-key">{setting.key}</code>
                    </div>

                    <div className="change-card-actions">
                      <button
                        className="change-link-button"
                        type="button"
                        onClick={() => onSelectSetting(setting.key)}
                      >
                        定位设置
                      </button>

                      <button
                        className="reset-setting-button"
                        type="button"
                        onClick={() => onResetSetting(setting.key)}
                      >
                        撤销此项
                      </button>
                    </div>
                  </header>

                  <div className="change-value-grid">
                    <div className="change-value-box">
                      <span>{baselineLabel}</span>
                      <strong>
                        {formatSettingValue(setting, baselineValue)}
                      </strong>
                      {baselineDiffersFromOfficial && (
                        <small>该基准本身不同于官方默认</small>
                      )}
                    </div>

                    <div className="change-arrow" aria-hidden="true">
                      →
                    </div>

                    <div className="change-value-box change-value-current">
                      <span>当前值</span>
                      <strong>
                        {formatSettingValue(setting, currentValue)}
                      </strong>
                      <small>
                        {currentDiffersFromOfficial
                          ? '当前值不同于官方默认'
                          : '当前值等于官方默认'}
                      </small>
                    </div>

                    <div className="change-value-box change-value-official">
                      <span>官方默认</span>
                      <strong>
                        {formatSettingValue(setting, officialValue)}
                      </strong>
                    </div>
                  </div>

                  <div className="change-code-diff">
                    <code className="change-code-old">
                      - {setting.key}=
                      {formatIniValue(setting, baselineValue)}
                    </code>
                    <code className="change-code-new">
                      + {setting.key}=
                      {formatIniValue(setting, currentValue)}
                    </code>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="changes-empty-state">
            <strong>当前没有未撤销的修改</strong>
            <p>所有已支持参数都与{baselineLabel}一致。</p>
          </div>
        )}
      </section>
    </div>
  )
}