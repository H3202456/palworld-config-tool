import { useState } from 'react'
import {
  getSettingByKey,
  type SettingsValues,
} from '../data/settings-schema'
import type {
  ConfigPreset,
  ConfigPresetId,
  ConfigPresetRisk,
} from '../data/config-presets'
import { getConfigPresets } from '../data/config-presets'
import { analyzeConfigPreset } from '../data/preset-validation'
import type {
  SettingDefinition,
  SettingRuntimeValue,
} from '../data/settings-types'
import type { ValidationIssue } from '../validation/validation-types'

interface PresetPanelProps {
  values: SettingsValues
  onClose: () => void
  onApplyPreset: (preset: ConfigPreset) => void
}

function formatNumber(
  value: number,
  precision: number | undefined,
  unit: string | undefined,
): string {
  const formatted =
    precision === undefined
      ? String(value)
      : value.toFixed(precision)

  return unit ? `${formatted} ${unit}` : formatted
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
        ? formatNumber(
            value,
            setting.precision,
            setting.unit,
          )
        : '无效数值'

    case 'unlimited-number':
      if (typeof value !== 'number') {
        return '无效数值'
      }

      if (value === setting.unlimitedValue) {
        return setting.unlimitedLabel
      }

      return formatNumber(
        value,
        setting.precision,
        setting.unit,
      )

    case 'segmented': {
      if (typeof value !== 'string') {
        return '无效选项'
      }

      return (
        setting.options.find(
          (option) => option.value === value,
        )?.label ?? value
      )
    }

    case 'text':
      return typeof value === 'string'
        ? value || '空白'
        : '无效文本'

    case 'password':
      if (typeof value !== 'string') {
        return '无效密码'
      }

      return value.length > 0 ? '已设置' : '未设置'

    case 'multi-select':
      if (!Array.isArray(value)) {
        return '无效列表'
      }

      return value.length > 0
        ? value.join('、')
        : '未选择'

    default:
      return String(value)
  }
}

function getRiskLabel(risk: ConfigPresetRisk): string {
  switch (risk) {
    case 'low':
      return '改动温和'

    case 'medium':
      return '改动较多'

    default:
      return '预设'
  }
}

function ValidationIssueList({
  issues,
}: {
  issues: readonly ValidationIssue[]
}) {
  return (
    <ul>
      {issues.map((issue) => (
        <li key={issue.id}>{issue.message}</li>
      ))}
    </ul>
  )
}

export function PresetPanel({
  values,
  onClose,
  onApplyPreset,
}: PresetPanelProps) {
  const presets = getConfigPresets()

  const [selectedPresetId, setSelectedPresetId] =
    useState<ConfigPresetId>(presets[0].id)

  const selectedPreset =
    presets.find(
      (preset) => preset.id === selectedPresetId,
    ) ?? presets[0]

  const analysis = analyzeConfigPreset(
    values,
    selectedPreset,
  )

  const introducedErrors =
    analysis.introducedIssues.filter(
      (issue) => issue.severity === 'error',
    )

  const introducedWarnings =
    analysis.introducedIssues.filter(
      (issue) => issue.severity === 'warning',
    )

  const changes = analysis.changes

  const handleApply = () => {
    if (
      changes.length === 0 ||
      !analysis.canApply
    ) {
      return
    }

    onApplyPreset(selectedPreset)
  }

  return (
    <div
      className="config-preview-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="config-preview-dialog preset-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="体验预设"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="config-tool-heading">
          <div>
            <p className="section-label">体验预设</p>
            <h2>选择你想要的服务器体验</h2>
            <p>
              预设只修改列出的玩法参数，不会覆盖服务器名称、密码、人数和远程管理配置。
            </p>
          </div>

          <button
            className="config-close-button"
            type="button"
            aria-label="关闭体验预设"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="preset-layout">
          <div
            className="preset-list"
            role="list"
            aria-label="可用体验预设"
          >
            {presets.map((preset) => {
              const selected =
                preset.id === selectedPreset.id

              return (
                <button
                  key={preset.id}
                  className={[
                    'preset-card',
                    selected
                      ? 'preset-card-selected'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  type="button"
                  role="listitem"
                  aria-pressed={selected}
                  onClick={() =>
                    setSelectedPresetId(preset.id)
                  }
                >
                  <div className="preset-card-heading">
                    <strong>{preset.label}</strong>
                    <span
                      className={`preset-risk preset-risk-${preset.risk}`}
                    >
                      {getRiskLabel(preset.risk)}
                    </span>
                  </div>

                  <p>{preset.description}</p>
                  <small>{preset.recommendedFor}</small>
                </button>
              )
            })}
          </div>

          <div className="preset-preview">
            <div className="preset-preview-heading">
              <div>
                <p className="section-label">
                  应用前预览
                </p>
                <h3>{selectedPreset.label}</h3>
              </div>

              <span>
                将修改 {changes.length} 项
              </span>
            </div>

            <div className="preset-validation-summary">
              {introducedErrors.length > 0 && (
                <div className="preset-validation-card preset-validation-error">
                  <strong>
                    会新增 {introducedErrors.length} 个错误，暂时不能应用
                  </strong>
                  <ValidationIssueList
                    issues={introducedErrors}
                  />
                </div>
              )}

              {introducedWarnings.length > 0 && (
                <div className="preset-validation-card preset-validation-warning">
                  <strong>
                    会新增 {introducedWarnings.length} 个提醒
                  </strong>
                  <ValidationIssueList
                    issues={introducedWarnings}
                  />
                </div>
              )}

              {analysis.resolvedIssues.length > 0 && (
                <div className="preset-validation-card preset-validation-success">
                  <strong>
                    会解决 {analysis.resolvedIssues.length} 个现有问题
                  </strong>
                  <ValidationIssueList
                    issues={analysis.resolvedIssues}
                  />
                </div>
              )}

              {analysis.remainingErrorCount > 0 && (
                <div className="preset-validation-card preset-validation-existing">
                  <strong>
                    应用后仍会保留 {analysis.remainingErrorCount} 个已有错误
                  </strong>
                  <p>
                    这些错误不是本预设新增的，应用后仍需在校验面板中处理。
                  </p>
                </div>
              )}

              {introducedErrors.length === 0 &&
                introducedWarnings.length === 0 &&
                analysis.resolvedIssues.length === 0 &&
                analysis.remainingErrorCount === 0 && (
                  <div className="preset-validation-card preset-validation-clean">
                    <strong>
                      应用后不会新增校验问题
                    </strong>
                    <p>
                      当前预设与现有配置之间没有发现新的冲突。
                    </p>
                  </div>
                )}
            </div>

            {changes.length > 0 ? (
              <div className="preset-change-list">
                {changes.map((change) => {
                  const setting = getSettingByKey(
                    change.key,
                  )

                  if (!setting) {
                    return null
                  }

                  return (
                    <article
                      className="preset-change-item"
                      key={change.key}
                    >
                      <div className="preset-change-title">
                        <div>
                          <strong>{setting.label}</strong>
                          <code>{setting.key}</code>
                        </div>

                        <span aria-hidden="true">→</span>
                      </div>

                      <div className="preset-change-values">
                        <div>
                          <span>当前</span>
                          <strong>
                            {formatSettingValue(
                              setting,
                              change.before,
                            )}
                          </strong>
                        </div>

                        <div className="preset-change-next">
                          <span>预设</span>
                          <strong>
                            {formatSettingValue(
                              setting,
                              change.after,
                            )}
                          </strong>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="preset-empty-state">
                <strong>
                  当前配置已经符合这个预设
                </strong>
                <p>
                  没有参数需要再次修改。重复按按钮并不会让服务器获得第二层成长加成。
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="preset-footer">
          <div>
            <strong>
              {analysis.canApply
                ? '应用后仍可通过“查看修改”逐项撤销'
                : '请先处理预设会新增的错误'}
            </strong>
            <span>
              预设不会改变最近导入值，也不会清空未知参数。
            </span>
          </div>

          <div className="preset-footer-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={onClose}
            >
              取消
            </button>

            <button
              className="button button-primary"
              type="button"
              disabled={
                changes.length === 0 ||
                !analysis.canApply
              }
              title={
                analysis.canApply
                  ? undefined
                  : '这个预设会新增配置错误'
              }
              onClick={handleApply}
            >
              应用“{selectedPreset.label}”
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}