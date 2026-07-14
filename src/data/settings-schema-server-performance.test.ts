import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  getSettingByKey,
} from './settings-schema'

describe('settings schema: server connection and performance', () => {
  it('服务器据点总数默认是 128', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('BaseCampMaxNum')

    expect(values.BaseCampMaxNum).toBe(128)
    expect(setting?.category).toBe('building')
    expect(setting?.serialization).toBe('integer')
    expect(setting?.simpleMode).toBe(false)
  })

  it('默认允许使用模组的客户端加入', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('bAllowClientMod')

    expect(values.bAllowClientMod).toBe(true)
    expect(setting?.category).toBe('server')
    expect(setting?.simpleMode).toBe(false)
  })

  it('默认显示玩家加入和离开消息', () => {
    const values = createDefaultSettingsValues()

    expect(values.bIsShowJoinLeftMessage).toBe(true)
    expect(
      getSettingByKey('bIsShowJoinLeftMessage')
        ?.simpleMode,
    ).toBe(true)
  })

  it('聊天消息上限默认是每分钟 30 条', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'ChatPostLimitPerMinute',
    )

    expect(values.ChatPostLimitPerMinute).toBe(30)
    expect(setting?.serialization).toBe('integer')
  })

  it('社区服务器公开 IP 默认留空', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('PublicIP')

    expect(values.PublicIP).toBe('')
    expect(setting?.serialization).toBe('quoted-string')
    expect(setting?.simpleMode).toBe(false)
  })

  it('社区服务器公开端口默认是 8211', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey('PublicPort')

    expect(values.PublicPort).toBe(8211)
    expect(setting?.serialization).toBe('integer')

    if (!setting || setting.valueType !== 'number') {
      throw new Error('PublicPort Schema 不正确')
    }

    expect(setting.min).toBe(1)
    expect(setting.max).toBe(65535)
    expect(setting.rangeKind).toBe('hard')
  })

  it('帕鲁同步距离默认是 15000，并使用官方硬范围', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'ServerReplicatePawnCullDistance',
    )

    expect(values.ServerReplicatePawnCullDistance).toBe(
      15000,
    )

    if (!setting || setting.valueType !== 'number') {
      throw new Error(
        'ServerReplicatePawnCullDistance Schema 不正确',
      )
    }

    expect(setting.min).toBe(5000)
    expect(setting.max).toBe(15000)
    expect(setting.rangeKind).toBe('hard')
    expect(setting.serialization).toBe('float')
  })

  it('容器强制同步间隔默认是 1 秒', () => {
    const values = createDefaultSettingsValues()
    const setting = getSettingByKey(
      'ItemContainerForceMarkDirtyInterval',
    )

    expect(
      values.ItemContainerForceMarkDirtyInterval,
    ).toBe(1)
    expect(setting?.serialization).toBe('float')
    expect(setting?.simpleMode).toBe(false)
  })
})
