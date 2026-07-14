import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  getSettingByKey,
} from './settings-schema'

describe('settings schema: world events and dropped items', () => {
  it('袭击事件默认开启，并在基础简单模式中显示', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('bEnableInvaderEnemy')

    expect(values.bEnableInvaderEnemy).toBe(true)
    expect(setting?.category).toBe('basic')
    expect(setting?.simpleMode).toBe(true)
    expect(setting?.control).toBe('switch')
  })

  it('陨石与补给事件间隔默认是 180 分钟', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('SupplyDropSpan')

    expect(values.SupplyDropSpan).toBe(180)
    expect(setting?.serialization).toBe('integer')
    expect(setting?.category).toBe('basic')
    expect(setting?.simpleMode).toBe(true)
  })

  it('捕食者首领帕鲁默认开启', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'EnablePredatorBossPal',
    )

    expect(values.EnablePredatorBossPal).toBe(true)
    expect(setting?.category).toBe('pal')
    expect(setting?.control).toBe('switch')
    expect(setting?.simpleMode).toBe(true)
  })

  it('世界掉落物上限默认是 3000，并使用整数导出', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('DropItemMaxNum')

    expect(values.DropItemMaxNum).toBe(3000)
    expect(setting?.serialization).toBe('integer')
    expect(setting?.simpleMode).toBe(false)
  })

  it('物理掉落物上限默认使用 -1 表示不限制', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'PhysicsActiveDropItemMaxNum',
    )

    expect(values.PhysicsActiveDropItemMaxNum).toBe(-1)
    expect(setting?.control).toBe('unlimited-number')

    if (
      !setting ||
      setting.control !== 'unlimited-number'
    ) {
      throw new Error(
        'PhysicsActiveDropItemMaxNum Schema 不正确',
      )
    }

    expect(setting.unlimitedValue).toBe(-1)
    expect(setting.finiteDefaultValue).toBe(3000)
  })

  it('掉落物地面存活时间默认是 1 小时', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'DropItemAliveMaxHours',
    )

    expect(values.DropItemAliveMaxHours).toBe(1)
    expect(setting?.serialization).toBe('float')
    expect(setting?.category).toBe('resources')
    expect(setting?.simpleMode).toBe(false)
  })

  it('本批参数使用服务器配置中的准确英文 Key', () => {
    expect(
      getSettingByKey('bEnableInvaderEnemy'),
    ).toBeDefined()
    expect(
      getSettingByKey('EnablePredatorBossPal'),
    ).toBeDefined()
    expect(getSettingByKey('SupplyDropSpan')).toBeDefined()
    expect(getSettingByKey('DropItemMaxNum')).toBeDefined()
    expect(
      getSettingByKey('PhysicsActiveDropItemMaxNum'),
    ).toBeDefined()
    expect(
      getSettingByKey('DropItemAliveMaxHours'),
    ).toBeDefined()
  })
})