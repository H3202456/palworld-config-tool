import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  getSettingByKey,
} from './settings-schema'

describe('settings schema: server management and permissions', () => {
  it('世界备份默认开启，并在简单模式显示', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'bIsUseBackupSaveData',
    )

    expect(values.bIsUseBackupSaveData).toBe(true)
    expect(setting?.category).toBe('server')
    expect(setting?.simpleMode).toBe(true)
    expect(setting?.serialization).toBe('boolean')
  })

  it('玩家列表默认关闭，并在服务器简单模式显示', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('bShowPlayerList')

    expect(values.bShowPlayerList).toBe(false)
    expect(setting?.category).toBe('server')
    expect(setting?.simpleMode).toBe(true)
  })

  it('日志格式默认使用不带引号的 Text', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('LogFormatType')

    expect(values.LogFormatType).toBe('Text')
    expect(setting?.serialization).toBe('raw')
    expect(setting?.control).toBe('segmented')
    expect(setting?.simpleMode).toBe(false)
  })

  it('日志格式只允许 Text 和 Json', () => {
    const setting = getSettingByKey('LogFormatType')

    if (!setting || setting.control !== 'segmented') {
      throw new Error('LogFormatType Schema 不正确')
    }

    expect(
      setting.options.map((option) => option.value),
    ).toEqual(['Text', 'Json'])
  })

  it('全局帕鲁终端默认允许导出但禁止导入', () => {
    const values = createDefaultSettingsValues()

    expect(values.bAllowGlobalPalboxExport).toBe(true)
    expect(values.bAllowGlobalPalboxImport).toBe(false)
    expect(
      getSettingByKey('bAllowGlobalPalboxExport')
        ?.simpleMode,
    ).toBe(false)
    expect(
      getSettingByKey('bAllowGlobalPalboxImport')
        ?.simpleMode,
    ).toBe(false)
  })

  it('五个玩家属性加点权限默认全部开启', () => {
    const values = createDefaultSettingsValues()

    expect(values.bAllowEnhanceStat_Health).toBe(true)
    expect(values.bAllowEnhanceStat_Attack).toBe(true)
    expect(values.bAllowEnhanceStat_Stamina).toBe(true)
    expect(values.bAllowEnhanceStat_Weight).toBe(true)
    expect(values.bAllowEnhanceStat_WorkSpeed).toBe(true)
  })

  it('属性加点权限全部属于玩家专业设置', () => {
    const keys = [
      'bAllowEnhanceStat_Health',
      'bAllowEnhanceStat_Attack',
      'bAllowEnhanceStat_Stamina',
      'bAllowEnhanceStat_Weight',
      'bAllowEnhanceStat_WorkSpeed',
    ]

    for (const key of keys) {
      const setting = getSettingByKey(key)

      expect(setting?.category).toBe('player')
      expect(setting?.simpleMode).toBe(false)
      expect(setting?.control).toBe('switch')
    }
  })
})