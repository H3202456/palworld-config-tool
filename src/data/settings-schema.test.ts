import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  getSettingByKey,
} from './settings-schema'

describe('settings schema: time and player survival', () => {
  it('包含白天和夜晚速度参数，并使用当前默认值', () => {
    const values = createDefaultSettingsValues()

    expect(values.DayTimeSpeedRate).toBe(1)
    expect(values.NightTimeSpeedRate).toBe(1)
    expect(
      getSettingByKey('DayTimeSpeedRate')?.serialization,
    ).toBe('float')
    expect(
      getSettingByKey('NightTimeSpeedRate')?.serialization,
    ).toBe('float')
  })

  it('包含自动保存间隔，并按浮点格式导出', () => {
    const setting = getSettingByKey('AutoSaveSpan')
    const values = createDefaultSettingsValues()

    expect(values.AutoSaveSpan).toBe(30)
    expect(setting?.control).toBe('number')
    expect(setting?.serialization).toBe('float')
    expect(setting?.category).toBe('server')
  })

  it('包含四个玩家生存参数，并使用当前默认值 1', () => {
    const values = createDefaultSettingsValues()

    expect(values.PlayerStomachDecreaceRate).toBe(1)
    expect(values.PlayerStaminaDecreaceRate).toBe(1)
    expect(values.PlayerAutoHPRegeneRate).toBe(1)
    expect(values.PlayerAutoHpRegeneRateInSleep).toBe(1)
  })

  it('使用服务器实际识别的 Decreace 参数拼写', () => {
    expect(
      getSettingByKey('PlayerStomachDecreaceRate'),
    ).toBeDefined()
    expect(
      getSettingByKey('PlayerStaminaDecreaceRate'),
    ).toBeDefined()
    expect(
      getSettingByKey('PlayerStomachDecreaseRate'),
    ).toBeUndefined()
  })
})