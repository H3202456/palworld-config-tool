import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  type SettingsValues,
} from '../data/settings-schema'
import { validateSettingRelations } from './validate-relations'

function createValues(
  overrides: Partial<SettingsValues> = {},
): SettingsValues {
  return {
    ...createDefaultSettingsValues(),
    ...overrides,
  }
}

function getIssueIds(values: SettingsValues): string[] {
  return validateSettingRelations(values).map(
    (issue) => issue.id,
  )
}

describe('validateSettingRelations', () => {
  it('官方默认配置不产生关系校验问题', () => {
    const issues = validateSettingRelations(createValues())

    expect(issues).toEqual([])
  })

  it('开启 PvP 但未开启必要子项时产生错误', () => {
    const issues = validateSettingRelations(
      createValues({
        bIsPvP: true,
        bEnablePlayerToPlayerDamage: false,
        bEnableDefenseOtherGuildPlayer: false,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'pvp-incomplete',
        severity: 'error',
        settingKey: 'bIsPvP',
      }),
    )
  })

  it('关闭 PvP 但开启相关子项时产生提醒', () => {
    const issues = validateSettingRelations(
      createValues({
        bIsPvP: false,
        bEnablePlayerToPlayerDamage: true,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'pvp-child-settings-ignored',
        severity: 'warning',
      }),
    )
  })

  it('合作人数高于服务器人数时产生错误', () => {
    const issues = validateSettingRelations(
      createValues({
        CoopPlayerMaxNum: 8,
        ServerPlayerMaxNum: 7,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'coop-player-limit-exceeds-server-limit',
        severity: 'error',
        settingKey: 'CoopPlayerMaxNum',
      }),
    )
  })

  it('合作人数等于服务器人数时不产生人数错误', () => {
    const ids = getIssueIds(
      createValues({
        CoopPlayerMaxNum: 7,
        ServerPlayerMaxNum: 7,
      }),
    )

    expect(ids).not.toContain(
      'coop-player-limit-exceeds-server-limit',
    )
  })

  it('语音关闭时不检查两个距离的先后关系', () => {
    const ids = getIssueIds(
      createValues({
        bEnableVoiceChat: false,
        VoiceChatMaxVolumeDistance: 15000,
        VoiceChatZeroVolumeDistance: 3000,
      }),
    )

    expect(ids).not.toContain(
      'voice-chat-distance-order-invalid',
    )
    expect(ids).not.toContain(
      'voice-chat-fade-range-too-short',
    )
  })

  it('语音开启且静音距离不大于最大音量距离时产生错误', () => {
    const issues = validateSettingRelations(
      createValues({
        bEnableVoiceChat: true,
        VoiceChatMaxVolumeDistance: 5000,
        VoiceChatZeroVolumeDistance: 5000,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'voice-chat-distance-order-invalid',
        severity: 'error',
        settingKey: 'VoiceChatZeroVolumeDistance',
      }),
    )
  })

  it('语音衰减区间过短时只产生提醒', () => {
    const issues = validateSettingRelations(
      createValues({
        bEnableVoiceChat: true,
        VoiceChatMaxVolumeDistance: 10000,
        VoiceChatZeroVolumeDistance: 11000,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'voice-chat-fade-range-too-short',
        severity: 'warning',
      }),
    )
    expect(getIssueIds(createValues({
      bEnableVoiceChat: true,
      VoiceChatMaxVolumeDistance: 10000,
      VoiceChatZeroVolumeDistance: 11000,
    }))).not.toContain(
      'voice-chat-distance-order-invalid',
    )
  })

  it('开启 RCON 时产生弃用和网络安全提醒', () => {
    const ids = getIssueIds(
      createValues({
        RCONEnabled: true,
      }),
    )

    expect(ids).toEqual(
      expect.arrayContaining([
        'rcon-deprecated',
        'remote-api-lan-only',
      ]),
    )
    expect(ids).not.toContain('remote-api-port-conflict')
  })

  it('RCON 与 REST API 使用相同端口时产生冲突错误', () => {
    const issues = validateSettingRelations(
      createValues({
        RCONEnabled: true,
        RESTAPIEnabled: true,
        RCONPort: 8212,
        RESTAPIPort: 8212,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'remote-api-port-conflict',
        severity: 'error',
        settingKey: 'RESTAPIPort',
      }),
    )
  })

  it('只有一个远程接口开启时不会误报端口冲突', () => {
    const ids = getIssueIds(
      createValues({
        RCONEnabled: false,
        RESTAPIEnabled: true,
        RCONPort: 8212,
        RESTAPIPort: 8212,
      }),
    )

    expect(ids).toContain('remote-api-lan-only')
    expect(ids).not.toContain('remote-api-port-conflict')
    expect(ids).not.toContain('rcon-deprecated')
  })

  it('据点数和工作帕鲁数同时过高时合并为一个高负载提醒', () => {
    const ids = getIssueIds(
      createValues({
        BaseCampMaxNumInGuild: 10,
        BaseCampWorkerMaxNum: 50,
      }),
    )

    expect(ids).toContain(
      'base-camp-high-load-combination',
    )
    expect(ids).not.toContain('base-camp-count-high')
    expect(ids).not.toContain(
      'base-camp-worker-count-high',
    )
  })

  it('单独提高据点数时只产生对应提醒', () => {
    const ids = getIssueIds(
      createValues({
        BaseCampMaxNumInGuild: 8,
        BaseCampWorkerMaxNum: 15,
      }),
    )

    expect(ids).toContain('base-camp-count-high')
    expect(ids).not.toContain(
      'base-camp-high-load-combination',
    )
    expect(ids).not.toContain(
      'base-camp-worker-count-high',
    )
  })

  it('单独提高工作帕鲁数时只产生对应提醒', () => {
    const ids = getIssueIds(
      createValues({
        BaseCampMaxNumInGuild: 4,
        BaseCampWorkerMaxNum: 40,
      }),
    )

    expect(ids).toContain(
      'base-camp-worker-count-high',
    )
    expect(ids).not.toContain(
      'base-camp-high-load-combination',
    )
    expect(ids).not.toContain('base-camp-count-high')
  })
})