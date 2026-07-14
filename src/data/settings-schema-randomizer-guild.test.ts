import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  getSettingByKey,
} from './settings-schema'

describe('settings schema: randomizer and guild cleanup', () => {
  it('随机模式默认关闭，并只允许三个官方选项', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('RandomizerType')

    expect(values.RandomizerType).toBe('None')

    if (!setting || setting.control !== 'segmented') {
      throw new Error('RandomizerType Schema 不正确')
    }

    expect(
      setting.options.map((option) => option.value),
    ).toEqual(['None', 'Region', 'All'])
  })

  it('随机种子默认空白，并使用带引号文本导出', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('RandomizerSeed')

    expect(values.RandomizerSeed).toBe('')
    expect(setting?.serialization).toBe('quoted-string')
    expect(setting?.simpleMode).toBe(false)
  })

  it('等级完全随机默认关闭', () => {
    const values = createDefaultSettingsValues()

    expect(values.bIsRandomizerPalLevelRandom).toBe(false)
    expect(
      getSettingByKey('bIsRandomizerPalLevelRandom')
        ?.control,
    ).toBe('switch')
  })

  it('随机种子和等级开关依赖随机模式开启', () => {
    for (const key of [
      'RandomizerSeed',
      'bIsRandomizerPalLevelRandom',
    ]) {
      const setting = getSettingByKey(key)

      expect(setting?.dependsOn).toEqual({
        key: 'RandomizerType',
        operator: 'not-equals',
        value: 'None',
        behavior: 'disable',
      })
    }
  })

  it('公会自动清理默认关闭，等待时间默认 72 小时', () => {
    const values = createDefaultSettingsValues()

    expect(values.bAutoResetGuildNoOnlinePlayers).toBe(
      false,
    )
    expect(values.AutoResetGuildTimeNoOnlinePlayers).toBe(
      72,
    )
  })

  it('公会清理等待时间只在父开关开启时生效', () => {
    const setting = getSettingByKey(
      'AutoResetGuildTimeNoOnlinePlayers',
    )

    expect(setting?.dependsOn).toEqual({
      key: 'bAutoResetGuildNoOnlinePlayers',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    })
    expect(setting?.serialization).toBe('float')
  })

  it('公会成员人数上限默认是 20', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('GuildPlayerMaxNum')

    expect(values.GuildPlayerMaxNum).toBe(20)
    expect(setting?.serialization).toBe('integer')
    expect(setting?.simpleMode).toBe(true)
  })
})