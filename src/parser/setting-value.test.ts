import { describe, expect, it } from 'vitest'
import {
  getSettingByKey,
} from '../data/settings-schema'
import type { SettingDefinition } from '../data/settings-types'
import {
  parseSettingValue,
  serializeSettingValue,
} from './setting-value'

function requireSetting(key: string): SettingDefinition {
  const setting = getSettingByKey(key)

  if (!setting) {
    throw new Error(`测试所需参数不存在：${key}`)
  }

  return setting
}

describe('parseSettingValue / serializeSettingValue', () => {
  it('可以解析大小写不同的布尔值，并按 INI 格式导出', () => {
    const setting = requireSetting('bEnableVoiceChat')

    expect(parseSettingValue(setting, ' True ')).toBe(true)
    expect(parseSettingValue(setting, 'false')).toBe(false)
    expect(serializeSettingValue(setting, true)).toBe('True')
    expect(serializeSettingValue(setting, false)).toBe('False')
  })

  it('浮点数始终导出为六位小数', () => {
    const setting = requireSetting('ExpRate')

    expect(parseSettingValue(setting, '20.5')).toBe(20.5)
    expect(serializeSettingValue(setting, 20.5)).toBe('20.500000')
  })

  it('整数参数拒绝小数', () => {
    const setting = requireSetting('ServerPlayerMaxNum')

    expect(parseSettingValue(setting, '32')).toBe(32)
    expect(() => parseSettingValue(setting, '7.5')).toThrow(
      '预期整数',
    )
    expect(() => serializeSettingValue(setting, 7.5)).toThrow(
      '不是有效整数',
    )
  })

  it('带引号文本可以正确处理引号和反斜杠', () => {
    const setting = requireSetting('ServerName')
    const originalValue = 'Jason "Pal" Server \\ Test'

    const serialized = serializeSettingValue(
      setting,
      originalValue,
    )

    expect(serialized).toBe(
      '"Jason \\"Pal\\" Server \\\\ Test"',
    )
    expect(parseSettingValue(setting, serialized)).toBe(
      originalValue,
    )
  })

  it('固定选项只接受 Schema 中允许的值', () => {
    const setting = requireSetting('DeathPenalty')

    expect(parseSettingValue(setting, 'Item')).toBe('Item')
    expect(() => parseSettingValue(setting, 'Everything')).toThrow(
      '不支持的选项',
    )
  })

  it('多选列表可以解析和重新导出', () => {
    const setting = requireSetting('CrossplayPlatforms')

    const parsed = parseSettingValue(
      setting,
      '(Steam,Xbox,PS5,Mac)',
    )

    expect(parsed).toEqual(['Steam', 'Xbox', 'PS5', 'Mac'])
    expect(serializeSettingValue(setting, parsed)).toBe(
      '(Steam,Xbox,PS5,Mac)',
    )
  })

  it('含空格、逗号或引号的列表项会自动加引号并转义', () => {
    const setting = requireSetting('CrossplayPlatforms')
    const value = ['Steam', 'Custom Platform', 'A,B', 'A"B']

    const serialized = serializeSettingValue(setting, value)

    expect(serialized).toBe(
      '(Steam,"Custom Platform","A,B","A\\"B")',
    )
    expect(parseSettingValue(setting, serialized)).toEqual(value)
  })

  it('错误的运行时值类型不会被静默导出', () => {
    const booleanSetting = requireSetting('bEnableVoiceChat')
    const numberSetting = requireSetting('ExpRate')
    const textSetting = requireSetting('ServerName')

    expect(() =>
      serializeSettingValue(booleanSetting, 'True'),
    ).toThrow('不是布尔值')

    expect(() =>
      serializeSettingValue(numberSetting, Number.NaN),
    ).toThrow('不是有效数字')

    expect(() =>
      serializeSettingValue(textSetting, 123),
    ).toThrow('不是文本')
  })
})