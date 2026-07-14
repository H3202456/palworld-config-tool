import {
  SETTINGS_SCHEMA,
  type SettingKey,
  type SettingsValues,
} from '../data/settings-schema'
import type {
  NumericRangeKind,
  SettingRuntimeValue,
} from '../data/settings-types'
import type {
  ValidationIssue,
  ValidationSeverity,
} from './validation-types'

function createIssue(
  settingKey: SettingKey,
  severity: ValidationSeverity,
  suffix: string,
  message: string,
): ValidationIssue {
  const setting = SETTINGS_SCHEMA.find(
    (candidate) => candidate.key === settingKey,
  )

  return {
    id: `${settingKey}-${suffix}`,
    severity,
    message,
    settingKey,
    category: setting?.category,
  }
}

function valueTypeName(value: SettingRuntimeValue): string {
  if (Array.isArray(value)) {
    return '列表'
  }

  switch (typeof value) {
    case 'boolean':
      return '布尔值'

    case 'number':
      return '数字'

    case 'string':
      return '文本'

    default:
      return '未知类型'
  }
}

export function validateSettingValues(
  values: SettingsValues,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const setting of SETTINGS_SCHEMA) {
    const value = values[setting.key]

    switch (setting.valueType) {
      case 'boolean': {
        if (typeof value !== 'boolean') {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'invalid-boolean',
              `「${setting.label}」应该是开启或关闭状态，当前却是${valueTypeName(
                value,
              )}。`,
            ),
          )
        }

        break
      }

      case 'number': {
        if (
          typeof value !== 'number' ||
          !Number.isFinite(value)
        ) {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'invalid-number',
              `「${setting.label}」不是有效数字。`,
            ),
          )

          break
        }

        if (
          setting.serialization === 'integer' &&
          !Number.isInteger(value)
        ) {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'not-integer',
              `「${setting.label}」必须填写整数，当前值为 ${value}。`,
            ),
          )
        }

        const unlimited =
          setting.control === 'unlimited-number' &&
          value === setting.unlimitedValue

        if (unlimited) {
          break
        }

        const belowMinimum = value < setting.min
        const aboveMaximum = value > setting.max

        if (belowMinimum || aboveMaximum) {
          /*
           * SETTINGS_SCHEMA 使用了 as const。
           * 当前数据全部是 suggested，因此这里主动扩展为完整类型，
           * 为之后加入 hard 范围参数保留支持。
           */
          const rangeKind =
            setting.rangeKind as NumericRangeKind

          const severity: ValidationSeverity =
            rangeKind === 'hard' ? 'error' : 'warning'

          const rangeLabel =
            rangeKind === 'hard'
              ? '允许范围'
              : '建议范围'

          issues.push(
            createIssue(
              setting.key,
              severity,
              'outside-range',
              `「${setting.label}」当前为 ${value}${
                setting.unit ?? ''
              }，${rangeLabel}为 ${setting.min}～${
                setting.max
              }${setting.unit ?? ''}。`,
            ),
          )
        }

        break
      }

      case 'enum': {
        if (typeof value !== 'string') {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'invalid-enum-type',
              `「${setting.label}」不是有效选项。`,
            ),
          )

          break
        }

        const allowed = setting.options.some(
          (option) => option.value === value,
        )

        if (!allowed) {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'unsupported-enum',
              `「${setting.label}」包含不支持的选项：${value}。`,
            ),
          )
        }

        break
      }

      case 'string': {
        if (typeof value !== 'string') {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'invalid-string',
              `「${setting.label}」应该是文本。`,
            ),
          )

          break
        }

        const maxLength =
          'maxLength' in setting &&
          typeof setting.maxLength === 'number'
            ? setting.maxLength
            : undefined

        if (
          maxLength !== undefined &&
          value.length > maxLength
        ) {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'text-too-long',
              `「${setting.label}」最多允许 ${maxLength} 个字符，当前为 ${value.length} 个字符。`,
            ),
          )
        }

        break
      }

      case 'string-array': {
        if (
          !Array.isArray(value) ||
          !value.every(
            (item) => typeof item === 'string',
          )
        ) {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'invalid-string-list',
              `「${setting.label}」不是有效的多选列表。`,
            ),
          )

          break
        }

        if (
          setting.minSelections !== undefined &&
          value.length < setting.minSelections
        ) {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'too-few-selections',
              `「${setting.label}」至少需要选择 ${setting.minSelections} 项。`,
            ),
          )
        }

        /*
         * 显式声明 Set<string>。
         *
         * 否则 TypeScript 会将它推断为：
         * Set<'Steam' | 'Xbox' | 'PS5' | 'Mac'>
         *
         * 然后拒绝检查普通 string。
         */
        const allowedValues = new Set<string>(
          setting.options.map(
            (option) => option.value,
          ),
        )

        const unsupportedValues = value.filter(
          (item) => !allowedValues.has(item),
        )

        if (unsupportedValues.length > 0) {
          issues.push(
            createIssue(
              setting.key,
              'error',
              'unsupported-list-values',
              `「${setting.label}」包含不支持的选项：${unsupportedValues.join(
                '、',
              )}。`,
            ),
          )
        }

        const uniqueValues = new Set<string>(value)

        if (uniqueValues.size !== value.length) {
          issues.push(
            createIssue(
              setting.key,
              'warning',
              'duplicate-list-values',
              `「${setting.label}」包含重复选项。`,
            ),
          )
        }

        break
      }

      default:
        break
    }
  }

  return issues
}