import {
  OptionSettingsParseError,
  type OptionSettingEntry,
  type ParsedOptionSettings,
} from './option-settings-types'

function findMatchingParenthesis(
  source: string,
  openingIndex: number,
): number {
  let depth = 0
  let insideQuote = false
  let escaped = false

  for (let index = openingIndex; index < source.length; index += 1) {
    const character = source[index]

    if (insideQuote) {
      if (escaped) {
        escaped = false
        continue
      }

      if (character === '\\') {
        escaped = true
        continue
      }

      if (character === '"') {
        insideQuote = false
      }

      continue
    }

    if (character === '"') {
      insideQuote = true
      continue
    }

    if (character === '(') {
      depth += 1
      continue
    }

    if (character === ')') {
      depth -= 1

      if (depth === 0) {
        return index
      }

      if (depth < 0) {
        throw new OptionSettingsParseError(
          '配置中出现了多余的右括号。',
        )
      }
    }
  }

  return -1
}

function extractOptionSettingsBody(source: string): string {
  const trimmedSource = source.trim()

  if (trimmedSource.length === 0) {
    throw new OptionSettingsParseError('配置内容不能为空。')
  }

  const markerMatch = /OptionSettings\s*=/i.exec(trimmedSource)

  if (markerMatch) {
    const afterMarker = trimmedSource.slice(
      markerMatch.index + markerMatch[0].length,
    )

    const openingIndex = afterMarker.indexOf('(')

    if (openingIndex === -1) {
      throw new OptionSettingsParseError(
        '找到了 OptionSettings，但没有找到开始括号。',
      )
    }

    const closingIndex = findMatchingParenthesis(
      afterMarker,
      openingIndex,
    )

    if (closingIndex === -1) {
      throw new OptionSettingsParseError(
        'OptionSettings 缺少结束括号。',
      )
    }

    return afterMarker.slice(openingIndex + 1, closingIndex)
  }

  if (trimmedSource.startsWith('(')) {
    const closingIndex = findMatchingParenthesis(trimmedSource, 0)

    if (closingIndex === -1) {
      throw new OptionSettingsParseError(
        '配置内容缺少结束括号。',
      )
    }

    return trimmedSource.slice(1, closingIndex)
  }

  if (trimmedSource.includes('=')) {
    return trimmedSource
  }

  throw new OptionSettingsParseError(
    '没有找到 OptionSettings 或有效的参数内容。',
  )
}

/**
 * 按顶层逗号拆分。
 *
 * 不会错误拆分：
 * CrossplayPlatforms=(Steam,Xbox)
 * ServerName="A,B Server"
 */
export function splitTopLevelValues(source: string): string[] {
  const parts: string[] = []

  let currentPart = ''
  let parenthesisDepth = 0
  let insideQuote = false
  let escaped = false

  for (const character of source) {
    if (insideQuote) {
      currentPart += character

      if (escaped) {
        escaped = false
        continue
      }

      if (character === '\\') {
        escaped = true
        continue
      }

      if (character === '"') {
        insideQuote = false
      }

      continue
    }

    if (character === '"') {
      insideQuote = true
      currentPart += character
      continue
    }

    if (character === '(') {
      parenthesisDepth += 1
      currentPart += character
      continue
    }

    if (character === ')') {
      parenthesisDepth -= 1

      if (parenthesisDepth < 0) {
        throw new OptionSettingsParseError(
          '参数内容中出现了多余的右括号。',
        )
      }

      currentPart += character
      continue
    }

    if (character === ',' && parenthesisDepth === 0) {
      parts.push(currentPart.trim())
      currentPart = ''
      continue
    }

    currentPart += character
  }

  if (insideQuote) {
    throw new OptionSettingsParseError(
      '配置内容中存在未闭合的双引号。',
    )
  }

  if (parenthesisDepth !== 0) {
    throw new OptionSettingsParseError(
      '配置内容中的括号没有正确闭合。',
    )
  }

  if (currentPart.trim().length > 0) {
    parts.push(currentPart.trim())
  }

  return parts
}

function findTopLevelEquals(source: string): number {
  let parenthesisDepth = 0
  let insideQuote = false
  let escaped = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]

    if (insideQuote) {
      if (escaped) {
        escaped = false
        continue
      }

      if (character === '\\') {
        escaped = true
        continue
      }

      if (character === '"') {
        insideQuote = false
      }

      continue
    }

    if (character === '"') {
      insideQuote = true
      continue
    }

    if (character === '(') {
      parenthesisDepth += 1
      continue
    }

    if (character === ')') {
      parenthesisDepth -= 1
      continue
    }

    if (character === '=' && parenthesisDepth === 0) {
      return index
    }
  }

  return -1
}

export function parseOptionSettings(
  source: string,
): ParsedOptionSettings {
  const body = extractOptionSettingsBody(source)
  const rawParts = splitTopLevelValues(body)

  const entries: OptionSettingEntry[] = []
  const warnings: string[] = []
  const encounteredKeys = new Set<string>()

  for (const rawPart of rawParts) {
    if (rawPart.length === 0) {
      continue
    }

    const equalsIndex = findTopLevelEquals(rawPart)

    if (equalsIndex === -1) {
      throw new OptionSettingsParseError(
        `无法解析参数片段：${rawPart}`,
      )
    }

    const key = rawPart.slice(0, equalsIndex).trim()
    const rawValue = rawPart.slice(equalsIndex + 1).trim()

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      throw new OptionSettingsParseError(
        `参数名称不合法：${key || '空参数名'}`,
      )
    }

    if (encounteredKeys.has(key)) {
      warnings.push(
        `参数 ${key} 重复出现，编辑器将采用最后一次出现的值。`,
      )
    }

    encounteredKeys.add(key)

    entries.push({
      key,
      rawValue,
    })
  }

  if (entries.length === 0) {
    throw new OptionSettingsParseError(
      '没有从配置中解析出任何参数。',
    )
  }

  return {
    entries,
    warnings,
  }
}