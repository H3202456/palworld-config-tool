import {
  SETTINGS_SCHEMA,
  type SettingsValues,
} from '../data/settings-schema'
import type { OptionSettingEntry } from './option-settings-types'
import { serializeSettingValue } from './setting-value'

const PALWORLD_SETTINGS_HEADER =
  '[/Script/Pal.PalGameWorldSettings]'

export function generatePalWorldSettingsIni(
  values: SettingsValues,
  sourceEntries: readonly OptionSettingEntry[] = [],
): string {
  const supportedValues = new Map<string, string>()

  for (const setting of SETTINGS_SCHEMA) {
    supportedValues.set(
      setting.key,
      serializeSettingValue(setting, values[setting.key]),
    )
  }

  const generatedEntries: OptionSettingEntry[] = []
  const emittedKeys = new Set<string>()

  /*
   * 优先保持导入配置原本的参数顺序。
   *
   * 已支持参数使用编辑器中的新值。
   * 暂未支持参数保留原始文本。
   */
  for (const sourceEntry of sourceEntries) {
    if (emittedKeys.has(sourceEntry.key)) {
      continue
    }

    const supportedValue = supportedValues.get(sourceEntry.key)

    generatedEntries.push({
      key: sourceEntry.key,
      rawValue:
        supportedValue === undefined
          ? sourceEntry.rawValue
          : supportedValue,
    })

    emittedKeys.add(sourceEntry.key)
  }

  /*
   * 将导入配置中不存在、但当前 Schema 已支持的参数补到末尾。
   */
  for (const setting of SETTINGS_SCHEMA) {
    if (emittedKeys.has(setting.key)) {
      continue
    }

    generatedEntries.push({
      key: setting.key,
      rawValue: supportedValues.get(setting.key) ?? '',
    })

    emittedKeys.add(setting.key)
  }

  const optionSettingsBody = generatedEntries
    .map((entry) => `${entry.key}=${entry.rawValue}`)
    .join(',')

  return `${PALWORLD_SETTINGS_HEADER}
OptionSettings=(${optionSettingsBody})
`
}