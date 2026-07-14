import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  getSettingByKey,
} from './settings-schema'

describe('settings schema: pal survival and durability', () => {
  it('包含四个帕鲁生存参数，并使用当前默认值 1', () => {
    const values = createDefaultSettingsValues()

    expect(values.PalStomachDecreaceRate).toBe(1)
    expect(values.PalStaminaDecreaceRate).toBe(1)
    expect(values.PalAutoHPRegeneRate).toBe(1)
    expect(values.PalAutoHpRegeneRateInSleep).toBe(1)
  })

  it('使用服务器实际识别的帕鲁 Decreace 参数拼写', () => {
    expect(
      getSettingByKey('PalStomachDecreaceRate'),
    ).toBeDefined()
    expect(
      getSettingByKey('PalStaminaDecreaceRate'),
    ).toBeDefined()
    expect(
      getSettingByKey('PalStomachDecreaseRate'),
    ).toBeUndefined()
  })

  it('包含三项建筑耐久参数，并使用当前默认值 1', () => {
    const values = createDefaultSettingsValues()

    expect(values.BuildObjectHpRate).toBe(1)
    expect(values.BuildObjectDamageRate).toBe(1)
    expect(values.BuildObjectDeteriorationDamageRate).toBe(1)
  })

  it('建筑生命值参数保留在专业模式', () => {
    const setting = getSettingByKey('BuildObjectHpRate')

    expect(setting?.category).toBe('building')
    expect(setting?.simpleMode).toBe(false)
    expect(setting?.serialization).toBe('float')
  })

  it('建筑伤害与劣化参数在简单模式中显示', () => {
    expect(
      getSettingByKey('BuildObjectDamageRate')?.simpleMode,
    ).toBe(true)
    expect(
      getSettingByKey(
        'BuildObjectDeteriorationDamageRate',
      )?.simpleMode,
    ).toBe(true)
  })

  it('包含装备耐久损耗倍率，并使用当前默认值 1', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'EquipmentDurabilityDamageRate',
    )

    expect(values.EquipmentDurabilityDamageRate).toBe(1)
    expect(setting?.category).toBe('player')
    expect(setting?.control).toBe('slider')
    expect(setting?.serialization).toBe('float')
  })
})