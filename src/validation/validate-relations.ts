import type { SettingsValues } from '../data/settings-schema'
import type { ValidationIssue } from './validation-types'

function getFiniteNumber(
  value: SettingsValues[keyof SettingsValues],
): number | undefined {
  return typeof value === 'number' &&
    Number.isFinite(value)
    ? value
    : undefined
}

export function validateSettingRelations(
  values: SettingsValues,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  /*
   * PvP 组合校验
   */

  const pvpEnabled = values.bIsPvP === true

  const playerDamageEnabled =
    values.bEnablePlayerToPlayerDamage === true

  const baseDefenseEnabled =
    values.bEnableDefenseOtherGuildPlayer === true

  if (
    pvpEnabled &&
    (!playerDamageEnabled || !baseDefenseEnabled)
  ) {
    const missingSettings: string[] = []

    if (!playerDamageEnabled) {
      missingSettings.push('允许玩家互相伤害')
    }

    if (!baseDefenseEnabled) {
      missingSettings.push(
        '据点帕鲁攻击敌对公会玩家',
      )
    }

    issues.push({
      id: 'pvp-incomplete',
      severity: 'error',
      settingKey: 'bIsPvP',
      category: 'pvp',
      message: `PvP 配置不完整，还需要开启：${missingSettings.join(
        '、',
      )}。`,
    })
  }

  if (
    !pvpEnabled &&
    (playerDamageEnabled || baseDefenseEnabled)
  ) {
    issues.push({
      id: 'pvp-child-settings-ignored',
      severity: 'warning',
      settingKey: 'bIsPvP',
      category: 'pvp',
      message:
        'PvP 当前处于关闭状态，相关伤害和据点防御设置不会完整生效。',
    })
  }

  /*
   * 联机人数关系校验
   */

  const coopPlayerMaxNum = getFiniteNumber(
    values.CoopPlayerMaxNum,
  )

  const serverPlayerMaxNum = getFiniteNumber(
    values.ServerPlayerMaxNum,
  )

  if (
    coopPlayerMaxNum !== undefined &&
    serverPlayerMaxNum !== undefined &&
    coopPlayerMaxNum > serverPlayerMaxNum
  ) {
    issues.push({
      id: 'coop-player-limit-exceeds-server-limit',
      severity: 'error',
      settingKey: 'CoopPlayerMaxNum',
      category: 'server',
      message: `合作模式人数上限当前为 ${coopPlayerMaxNum} 人，不能高于服务器最大人数 ${serverPlayerMaxNum} 人。`,
    })
  }

  /*
   * 语音聊天距离关系校验
   */

  const voiceChatEnabled =
    values.bEnableVoiceChat === true

  const maxVolumeDistance = getFiniteNumber(
    values.VoiceChatMaxVolumeDistance,
  )

  const zeroVolumeDistance = getFiniteNumber(
    values.VoiceChatZeroVolumeDistance,
  )

  if (
    voiceChatEnabled &&
    maxVolumeDistance !== undefined &&
    zeroVolumeDistance !== undefined &&
    zeroVolumeDistance <= maxVolumeDistance
  ) {
    issues.push({
      id: 'voice-chat-distance-order-invalid',
      severity: 'error',
      settingKey: 'VoiceChatZeroVolumeDistance',
      category: 'server',
      message: `语音完全静音的距离当前为 ${zeroVolumeDistance}，必须大于语音保持最大音量的距离 ${maxVolumeDistance}。`,
    })
  }

  if (
    voiceChatEnabled &&
    maxVolumeDistance !== undefined &&
    zeroVolumeDistance !== undefined &&
    zeroVolumeDistance > maxVolumeDistance &&
    zeroVolumeDistance < maxVolumeDistance * 1.2
  ) {
    issues.push({
      id: 'voice-chat-fade-range-too-short',
      severity: 'warning',
      settingKey: 'VoiceChatZeroVolumeDistance',
      category: 'server',
      message:
        '语音从最大音量衰减到完全静音的距离区间较短，玩家可能会感觉声音变化过于突然。',
    })
  }

  /*
   * 远程管理接口校验
   */

  const rconEnabled =
    values.RCONEnabled === true

  const restApiEnabled =
    values.RESTAPIEnabled === true

  const rconPort = getFiniteNumber(
    values.RCONPort,
  )

  const restApiPort = getFiniteNumber(
    values.RESTAPIPort,
  )

  if (rconEnabled) {
    issues.push({
      id: 'rcon-deprecated',
      severity: 'warning',
      settingKey: 'RCONEnabled',
      category: 'advanced',
      message:
        'RCON 已被官方标记为弃用，并计划在后续更新中停止工作。新部署建议优先使用 REST API。',
    })
  }

  if (rconEnabled || restApiEnabled) {
    issues.push({
      id: 'remote-api-lan-only',
      severity: 'warning',
      settingKey: restApiEnabled
        ? 'RESTAPIEnabled'
        : 'RCONEnabled',
      category: 'advanced',
      message:
        '远程管理接口不建议直接暴露到互联网。请优先限制为局域网访问，并配合防火墙或其他访问控制。',
    })
  }

  if (
    rconEnabled &&
    restApiEnabled &&
    rconPort !== undefined &&
    restApiPort !== undefined &&
    rconPort === restApiPort
  ) {
    issues.push({
      id: 'remote-api-port-conflict',
      severity: 'error',
      settingKey: 'RESTAPIPort',
      category: 'advanced',
      message: `RCON 与 REST API 当前都使用端口 ${rconPort}。两个服务不能监听同一个端口，请修改其中一个端口。`,
    })
  }

  /*
   * 据点规模与服务器性能提醒
   */

  const baseCampMaxNumInGuild = getFiniteNumber(
    values.BaseCampMaxNumInGuild,
  )

  const baseCampWorkerMaxNum = getFiniteNumber(
    values.BaseCampWorkerMaxNum,
  )

  const highBaseCampCount =
    baseCampMaxNumInGuild !== undefined &&
    baseCampMaxNumInGuild >= 8

  const highWorkerCount =
    baseCampWorkerMaxNum !== undefined &&
    baseCampWorkerMaxNum >= 40

  if (highBaseCampCount && highWorkerCount) {
    issues.push({
      id: 'base-camp-high-load-combination',
      severity: 'warning',
      settingKey: 'BaseCampWorkerMaxNum',
      category: 'building',
      message: `当前每个公会允许 ${baseCampMaxNumInGuild} 个据点，每个据点允许 ${baseCampWorkerMaxNum} 只工作帕鲁。这是一组高负载配置，可能明显增加服务器的 CPU、内存和同步压力。`,
    })
  } else {
    if (highBaseCampCount) {
      issues.push({
        id: 'base-camp-count-high',
        severity: 'warning',
        settingKey: 'BaseCampMaxNumInGuild',
        category: 'building',
        message: `每个公会据点数量当前为 ${baseCampMaxNumInGuild} 个。较多据点会增加建筑、帕鲁和世界状态的服务器处理压力。`,
      })
    }

    if (highWorkerCount) {
      issues.push({
        id: 'base-camp-worker-count-high',
        severity: 'warning',
        settingKey: 'BaseCampWorkerMaxNum',
        category: 'building',
        message: `每个据点工作帕鲁上限当前为 ${baseCampWorkerMaxNum} 只。大量工作帕鲁可能增加寻路、工作计算和网络同步压力。`,
      })
    }
  }

  return issues
}
