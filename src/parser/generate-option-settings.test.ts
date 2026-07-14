import { describe, expect, it } from 'vitest'
import {
  SETTINGS_SCHEMA,
  createDefaultSettingsValues,
  getSettingByKey,
  isSettingKey,
  type SettingsValues,
} from '../data/settings-schema'
import { generatePalWorldSettingsIni } from './generate-option-settings'
import type { OptionSettingEntry } from './option-settings-types'
import { parseOptionSettings } from './parse-option-settings'
import { parseSettingValue } from './setting-value'

function loadSupportedValues(source: string): {
  values: SettingsValues
  entries: OptionSettingEntry[]
} {
  const parsed = parseOptionSettings(source)
  const values = createDefaultSettingsValues()

  for (const entry of parsed.entries) {
    if (!isSettingKey(entry.key)) {
      continue
    }

    const setting = getSettingByKey(entry.key)

    if (!setting) {
      continue
    }

    values[entry.key] = parseSettingValue(
      setting,
      entry.rawValue,
    )
  }

  return {
    values,
    entries: parsed.entries,
  }
}

function getEntry(
  source: string,
  key: string,
): OptionSettingEntry | undefined {
  return parseOptionSettings(source).entries.find(
    (entry) => entry.key === key,
  )
}

describe('generatePalWorldSettingsIni', () => {
  it('生成包含脚本段和完整 OptionSettings 的默认配置', () => {
    const values = createDefaultSettingsValues()

    const generated = generatePalWorldSettingsIni(values, [])
    const parsed = parseOptionSettings(generated)
    const generatedKeys = new Set(
      parsed.entries.map((entry) => entry.key),
    )

    expect(generated).toContain(
      '[/Script/Pal.PalGameWorldSettings]',
    )
    expect(generated).toContain('OptionSettings=(')
    expect(parsed.entries).toHaveLength(SETTINGS_SCHEMA.length)

    for (const setting of SETTINGS_SCHEMA) {
      expect(generatedKeys.has(setting.key)).toBe(true)
    }
  })

  it('用当前界面值覆盖已知参数，同时保留未知参数原始内容', () => {
    const values = createDefaultSettingsValues()

    values.ServerName = 'new server'
    values.ExpRate = 5

    const sourceEntries: OptionSettingEntry[] = [
      {
        key: 'ServerName',
        rawValue: '"old server"',
      },
      {
        key: 'FutureNestedSetting',
        rawValue: '(Mode="A,B",Flags=(One,Two))',
      },
      {
        key: 'ExpRate',
        rawValue: '2.000000',
      },
    ]

    const generated = generatePalWorldSettingsIni(
      values,
      sourceEntries,
    )
    const parsed = parseOptionSettings(generated)
    const keys = parsed.entries.map((entry) => entry.key)

    expect(
      getEntry(generated, 'ServerName')?.rawValue,
    ).toBe('"new server"')
    expect(getEntry(generated, 'ExpRate')?.rawValue).toBe(
      '5.000000',
    )
    expect(
      getEntry(generated, 'FutureNestedSetting')?.rawValue,
    ).toBe('(Mode="A,B",Flags=(One,Two))')

    expect(keys.indexOf('ServerName')).toBeLessThan(
      keys.indexOf('FutureNestedSetting'),
    )
    expect(keys.indexOf('FutureNestedSetting')).toBeLessThan(
      keys.indexOf('ExpRate'),
    )
  })

  it('正确生成布尔值、整数、浮点数、文本和列表', () => {
    const values = createDefaultSettingsValues()

    values.bEnableVoiceChat = true
    values.ServerPlayerMaxNum = 7
    values.PalCaptureRate = 2.5
    values.ServerDescription = 'friends, "only"'
    values.CrossplayPlatforms = ['Steam', 'PS5']

    const generated = generatePalWorldSettingsIni(values, [])

    expect(
      getEntry(generated, 'bEnableVoiceChat')?.rawValue,
    ).toBe('True')
    expect(
      getEntry(generated, 'ServerPlayerMaxNum')?.rawValue,
    ).toBe('7')
    expect(
      getEntry(generated, 'PalCaptureRate')?.rawValue,
    ).toBe('2.500000')
    expect(
      getEntry(generated, 'ServerDescription')?.rawValue,
    ).toBe('"friends, \\"only\\""')
    expect(
      getEntry(generated, 'CrossplayPlatforms')?.rawValue,
    ).toBe('(Steam,PS5)')
  })

  it('导入、修改、生成并重新导入后，已知值和未知值保持一致', () => {
    const source = `[/Script/Pal.PalGameWorldSettings]
OptionSettings=(ServerName="before",ExpRate=2.000000,FutureSetting=(Level=3,Tags=("A,B",C)),CrossplayPlatforms=(Steam,Xbox))`

    const imported = loadSupportedValues(source)

    imported.values.ServerName = 'after'
    imported.values.ExpRate = 3.5
    imported.values.CrossplayPlatforms = ['Steam', 'PS5']

    const generated = generatePalWorldSettingsIni(
      imported.values,
      imported.entries,
    )
    const reloaded = loadSupportedValues(generated)

    expect(reloaded.values.ServerName).toBe('after')
    expect(reloaded.values.ExpRate).toBe(3.5)
    expect(reloaded.values.CrossplayPlatforms).toEqual([
      'Steam',
      'PS5',
    ])
    expect(
      getEntry(generated, 'FutureSetting')?.rawValue,
    ).toBe('(Level=3,Tags=("A,B",C))')
  })

  it('生成结果再次解析和生成时保持稳定', () => {
    const values = createDefaultSettingsValues()

    values.ServerName = 'stable'
    values.AdminPassword = 'a,b="c"'
    values.ExpRate = 20

    const sourceEntries: OptionSettingEntry[] = [
      {
        key: 'UnknownBefore',
        rawValue: '"keep me"',
      },
      {
        key: 'ServerName',
        rawValue: '"old"',
      },
    ]

    const firstGenerated = generatePalWorldSettingsIni(
      values,
      sourceEntries,
    )
    const reloaded = loadSupportedValues(firstGenerated)
    const secondGenerated = generatePalWorldSettingsIni(
      reloaded.values,
      reloaded.entries,
    )

    expect(secondGenerated).toBe(firstGenerated)
  })
})