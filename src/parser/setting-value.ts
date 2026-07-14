import type {
  SettingDefinition,
  SettingRuntimeValue,
} from '../data/settings-types'
import { splitTopLevelValues } from './parse-option-settings'

function unescapeQuotedString(value: string): string {
  const trimmedValue = value.trim()

  if (
    trimmedValue.startsWith('"') &&
    trimmedValue.endsWith('"')
  ) {
    return trimmedValue
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }

  return trimmedValue
}

function escapeQuotedString(value: string): string {
  const escapedValue = value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')

  return `"${escapedValue}"`
}

function parseBoolean(rawValue: string): boolean {
  const normalizedValue = rawValue.trim().toLowerCase()

  if (normalizedValue === 'true') {
    return true
  }

  if (normalizedValue === 'false') {
    return false
  }

  throw new Error(`预期 True 或 False，实际为 ${rawValue}`)
}

function parseNumberValue(
  rawValue: string,
  integerOnly: boolean,
): number {
  const parsedValue = Number(rawValue.trim())

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`不是有效数字：${rawValue}`)
  }

  if (integerOnly && !Number.isInteger(parsedValue)) {
    throw new Error(`预期整数，实际为 ${rawValue}`)
  }

  return parsedValue
}

function parseStringList(rawValue: string): string[] {
  const trimmedValue = rawValue.trim()

  if (
    !trimmedValue.startsWith('(') ||
    !trimmedValue.endsWith(')')
  ) {
    throw new Error(`预期括号列表，实际为 ${rawValue}`)
  }

  const listBody = trimmedValue.slice(1, -1).trim()

  if (listBody.length === 0) {
    return []
  }

  return splitTopLevelValues(listBody).map((item) =>
    unescapeQuotedString(item),
  )
}

export function parseSettingValue(
  setting: SettingDefinition,
  rawValue: string,
): SettingRuntimeValue {
  switch (setting.serialization) {
    case 'boolean':
      return parseBoolean(rawValue)

    case 'float':
      return parseNumberValue(rawValue, false)

    case 'integer':
      return parseNumberValue(rawValue, true)

    case 'quoted-string':
      return unescapeQuotedString(rawValue)

    case 'raw': {
      const value = rawValue.trim()

      const allowed = setting.options.some(
        (option) => option.value === value,
      )

      if (!allowed) {
        throw new Error(`不支持的选项：${value}`)
      }

      return value
    }

    case 'string-list':
      return parseStringList(rawValue)

    default:
      throw new Error(`不支持的序列化类型。`)
  }
}

export function serializeSettingValue(
  setting: SettingDefinition,
  value: SettingRuntimeValue,
): string {
  switch (setting.serialization) {
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new Error(`${setting.key} 不是布尔值。`)
      }

      return value ? 'True' : 'False'

    case 'float':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${setting.key} 不是有效数字。`)
      }

      return value.toFixed(6)

    case 'integer':
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        !Number.isInteger(value)
      ) {
        throw new Error(`${setting.key} 不是有效整数。`)
      }

      return String(value)

    case 'quoted-string':
      if (typeof value !== 'string') {
        throw new Error(`${setting.key} 不是文本。`)
      }

      return escapeQuotedString(value)

    case 'raw':
      if (typeof value !== 'string') {
        throw new Error(`${setting.key} 不是有效选项。`)
      }

      return value

    case 'string-list':
      if (
        !Array.isArray(value) ||
        !value.every((item) => typeof item === 'string')
      ) {
        throw new Error(`${setting.key} 不是有效列表。`)
      }

      return `(${value
        .map((item) => {
          const needsQuotes = /[,\s()"\\]/.test(item)

          return needsQuotes
            ? escapeQuotedString(item)
            : item
        })
        .join(',')})`

    default:
      throw new Error(`不支持的序列化类型。`)
  }
}