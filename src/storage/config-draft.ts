import {
  createDefaultSettingsValues,
  getSettingByKey,
  isSettingKey,
  type SettingKey,
  type SettingsValues,
} from '../data/settings-schema'
import type { SettingRuntimeValue } from '../data/settings-types'
import type { OptionSettingEntry } from '../parser/option-settings-types'

export const CONFIG_DRAFT_STORAGE_KEY =
  'palworld-config-tool:draft:v2'

export const LEGACY_CONFIG_DRAFT_STORAGE_KEY =
  'palworld-config-tool:draft:v1'

export const CONFIG_DRAFT_VERSION = 2

const SENSITIVE_SETTING_KEYS = new Set<SettingKey>([
  'ServerPassword',
  'AdminPassword',
])

export interface ConfigDraftSnapshot {
  values: SettingsValues
  baselineValues: SettingsValues
  sourceEntries: OptionSettingEntry[]
  importSourceLabel?: string
}

export interface ConfigDraftV2 {
  version: typeof CONFIG_DRAFT_VERSION
  savedAt: string
  values: SettingsValues
  baselineValues: SettingsValues
  sourceEntries: OptionSettingEntry[]
  importSourceLabel?: string
  omittedSensitiveKeys: SettingKey[]
}

export interface DraftStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type LoadConfigDraftResult =
  | {
      status: 'empty'
    }
  | {
      status: 'loaded'
      draft: ConfigDraftV2
      warnings: string[]
    }
  | {
      status: 'invalid'
      reason: string
    }

function cloneRuntimeValue(
  value: SettingRuntimeValue,
): SettingRuntimeValue {
  return Array.isArray(value) ? [...value] : value
}

function valuesAreEqual(
  first: SettingRuntimeValue,
  second: SettingRuntimeValue,
): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length &&
      first.every(
        (item, index) => item === second[index],
      )
    )
  }

  return first === second
}

function isSensitiveSettingKey(
  key: string,
): key is SettingKey {
  return (
    isSettingKey(key) &&
    SENSITIVE_SETTING_KEYS.has(key)
  )
}

function sanitizeSettingsValues(
  values: SettingsValues,
  omittedSensitiveKeys: Set<SettingKey>,
): SettingsValues {
  const sanitized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      cloneRuntimeValue(value),
    ]),
  ) as SettingsValues

  for (const key of SENSITIVE_SETTING_KEYS) {
    if (
      typeof values[key] === 'string' &&
      values[key].length > 0
    ) {
      omittedSensitiveKeys.add(key)
    }

    sanitized[key] = ''
  }

  return sanitized
}

function sanitizeSourceEntries(
  entries: readonly OptionSettingEntry[],
  omittedSensitiveKeys: Set<SettingKey>,
): OptionSettingEntry[] {
  return entries.map((entry) => {
    if (!isSensitiveSettingKey(entry.key)) {
      return { ...entry }
    }

    omittedSensitiveKeys.add(entry.key)

    return {
      key: entry.key,
      rawValue: '""',
    }
  })
}

function runtimeValueMatchesSetting(
  key: string,
  value: unknown,
): value is SettingRuntimeValue {
  const setting = getSettingByKey(key)

  if (!setting) {
    return false
  }

  switch (setting.valueType) {
    case 'boolean':
      return typeof value === 'boolean'

    case 'number':
      return (
        typeof value === 'number' &&
        Number.isFinite(value)
      )

    case 'string':
    case 'enum':
      return typeof value === 'string'

    case 'string-array':
      return (
        Array.isArray(value) &&
        value.every(
          (item) => typeof item === 'string',
        )
      )

    default:
      return false
  }
}

function normalizeSettingsValues(
  rawValues: unknown,
  warnings: string[],
  label: string,
): SettingsValues {
  const normalized = createDefaultSettingsValues()

  if (
    typeof rawValues !== 'object' ||
    rawValues === null ||
    Array.isArray(rawValues)
  ) {
    warnings.push(
      `${label}不是有效对象，已改用官方默认值。`,
    )

    return normalized
  }

  for (const [key, value] of Object.entries(rawValues)) {
    if (!isSettingKey(key)) {
      warnings.push(
        `${label}包含当前版本不认识的参数 ${key}，已忽略。`,
      )
      continue
    }

    if (!runtimeValueMatchesSetting(key, value)) {
      warnings.push(
        `${label}中的 ${key} 值类型无效，已恢复官方默认值。`,
      )
      continue
    }

    normalized[key] = isSensitiveSettingKey(key)
      ? ''
      : cloneRuntimeValue(value)
  }

  return normalized
}

function normalizeSourceEntries(
  rawEntries: unknown,
  warnings: string[],
): OptionSettingEntry[] {
  if (!Array.isArray(rawEntries)) {
    warnings.push(
      '草稿中的原始参数列表无效，已清空。',
    )
    return []
  }

  const entries: OptionSettingEntry[] = []

  for (const entry of rawEntries) {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      Array.isArray(entry)
    ) {
      warnings.push(
        '草稿中存在无效原始参数项，已忽略。',
      )
      continue
    }

    const candidate = entry as Record<string, unknown>

    if (
      typeof candidate.key !== 'string' ||
      typeof candidate.rawValue !== 'string'
    ) {
      warnings.push(
        '草稿中存在缺少 key 或 rawValue 的参数项，已忽略。',
      )
      continue
    }

    entries.push({
      key: candidate.key,
      rawValue: isSensitiveSettingKey(candidate.key)
        ? '""'
        : candidate.rawValue,
    })
  }

  return entries
}

function normalizeSensitiveKeys(
  rawKeys: unknown,
): SettingKey[] {
  if (!Array.isArray(rawKeys)) {
    return []
  }

  return rawKeys.filter(
    (key): key is SettingKey =>
      typeof key === 'string' &&
      isSensitiveSettingKey(key),
  )
}

function normalizeImportSourceLabel(
  value: unknown,
): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : undefined
}

export function createConfigDraft(
  snapshot: ConfigDraftSnapshot,
  now: Date = new Date(),
): ConfigDraftV2 {
  const omittedSensitiveKeys = new Set<SettingKey>()

  const values = sanitizeSettingsValues(
    snapshot.values,
    omittedSensitiveKeys,
  )

  const baselineValues = sanitizeSettingsValues(
    snapshot.baselineValues,
    omittedSensitiveKeys,
  )

  const sourceEntries = sanitizeSourceEntries(
    snapshot.sourceEntries,
    omittedSensitiveKeys,
  )

  return {
    version: CONFIG_DRAFT_VERSION,
    savedAt: now.toISOString(),
    values,
    baselineValues,
    sourceEntries,
    importSourceLabel:
      normalizeImportSourceLabel(
        snapshot.importSourceLabel,
      ),
    omittedSensitiveKeys: [
      ...omittedSensitiveKeys,
    ],
  }
}

export function serializeConfigDraft(
  draft: ConfigDraftV2,
): string {
  return JSON.stringify(draft)
}

export function parseConfigDraft(
  rawDraft: string,
): LoadConfigDraftResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(rawDraft)
  } catch {
    return {
      status: 'invalid',
      reason: '本地草稿不是有效 JSON。',
    }
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    return {
      status: 'invalid',
      reason: '本地草稿结构无效。',
    }
  }

  const candidate = parsed as Record<string, unknown>

  if (candidate.version !== CONFIG_DRAFT_VERSION) {
    return {
      status: 'invalid',
      reason: `不支持的草稿版本：${String(
        candidate.version,
      )}。`,
    }
  }

  if (
    typeof candidate.savedAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.savedAt))
  ) {
    return {
      status: 'invalid',
      reason: '草稿保存时间无效。',
    }
  }

  const warnings: string[] = []
  const omittedSensitiveKeys =
    normalizeSensitiveKeys(
      candidate.omittedSensitiveKeys,
    )

  if (omittedSensitiveKeys.length > 0) {
    warnings.push(
      '出于安全考虑，服务器密码和管理员密码没有保存在草稿中，恢复后需要重新输入。',
    )
  }

  const draft: ConfigDraftV2 = {
    version: CONFIG_DRAFT_VERSION,
    savedAt: candidate.savedAt,
    values: normalizeSettingsValues(
      candidate.values,
      warnings,
      '当前配置',
    ),
    baselineValues: normalizeSettingsValues(
      candidate.baselineValues,
      warnings,
      '修改基准',
    ),
    sourceEntries: normalizeSourceEntries(
      candidate.sourceEntries,
      warnings,
    ),
    importSourceLabel:
      normalizeImportSourceLabel(
        candidate.importSourceLabel,
      ),
    omittedSensitiveKeys,
  }

  return {
    status: 'loaded',
    draft,
    warnings,
  }
}

export function saveConfigDraft(
  storage: DraftStorage,
  snapshot: ConfigDraftSnapshot,
  now: Date = new Date(),
): ConfigDraftV2 {
  const draft = createConfigDraft(snapshot, now)

  storage.setItem(
    CONFIG_DRAFT_STORAGE_KEY,
    serializeConfigDraft(draft),
  )

  storage.removeItem(LEGACY_CONFIG_DRAFT_STORAGE_KEY)

  return draft
}

export function loadConfigDraft(
  storage: DraftStorage,
): LoadConfigDraftResult {
  const rawDraft = storage.getItem(
    CONFIG_DRAFT_STORAGE_KEY,
  )

  if (rawDraft === null) {
    if (
      storage.getItem(
        LEGACY_CONFIG_DRAFT_STORAGE_KEY,
      ) !== null
    ) {
      storage.removeItem(
        LEGACY_CONFIG_DRAFT_STORAGE_KEY,
      )
    }

    return {
      status: 'empty',
    }
  }

  return parseConfigDraft(rawDraft)
}

export function removeConfigDraft(
  storage: DraftStorage,
): void {
  storage.removeItem(CONFIG_DRAFT_STORAGE_KEY)
  storage.removeItem(LEGACY_CONFIG_DRAFT_STORAGE_KEY)
}

export function configDraftHasUserWork(
  snapshot: ConfigDraftSnapshot,
): boolean {
  if (snapshot.sourceEntries.length > 0) {
    return true
  }

  const officialDefaults =
    createDefaultSettingsValues()

  return Object.keys(officialDefaults).some((key) => {
    if (!isSettingKey(key)) {
      return false
    }

    return !valuesAreEqual(
      snapshot.values[key],
      officialDefaults[key],
    )
  })
}
