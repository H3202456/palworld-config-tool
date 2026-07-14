import {
  getSettingByKey,
  type SettingKey,
  type SettingsValues,
} from '../data/settings-schema'
import type { ValidationIssue } from './validation-types'

function createIssue(
  id: string,
  severity: ValidationIssue['severity'],
  settingKey: SettingKey,
  message: string,
): ValidationIssue {
  return {
    id,
    severity,
    message,
    settingKey,
    category: getSettingByKey(settingKey)?.category,
  }
}

export function validateFeatureRelations(
  values: SettingsValues,
): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const randomizerDisabled =
    values.RandomizerType === 'None'

  if (
    randomizerDisabled &&
    (
      values.RandomizerSeed !== '' ||
      values.bIsRandomizerPalLevelRandom === true
    )
  ) {
    issues.push(
      createIssue(
        'randomizer-options-ignored',
        'warning',
        'RandomizerType',
        '帕鲁随机模式当前为关闭，随机种子和等级随机设置不会生效。',
      ),
    )
  }

  if (
    values.RandomizerType === 'All' &&
    values.bIsRandomizerPalLevelRandom === true
  ) {
    issues.push(
      createIssue(
        'randomizer-fully-chaotic',
        'warning',
        'bIsRandomizerPalLevelRandom',
        '当前同时启用了完全随机的帕鲁种类和等级，可能彻底打乱地图难度与成长顺序。',
      ),
    )
  }

  if (values.bAutoResetGuildNoOnlinePlayers === true) {
    const autoResetHours =
      values.AutoResetGuildTimeNoOnlinePlayers

    const autoResetHoursText =
      typeof autoResetHours === 'number'
        ? String(autoResetHours)
        : '无效'

    issues.push(
      createIssue(
        'guild-auto-reset-destructive',
        'warning',
        'bAutoResetGuildNoOnlinePlayers',
        `长期离线公会清理已开启。公会全员连续离线 ${autoResetHoursText} 小时后，建筑与据点帕鲁可能被自动删除。`,
      ),
    )

    if (
      typeof autoResetHours === 'number' &&
      autoResetHours < 24
    ) {
      issues.push(
        createIssue(
          'guild-auto-reset-too-fast',
          'warning',
          'AutoResetGuildTimeNoOnlinePlayers',
          '公会离线清理等待时间不足 24 小时，短暂断线或一天未登录就可能触发破坏性清理。',
        ),
      )
    }
  }

  const totalBaseCampLimit = values.BaseCampMaxNum
  const guildBaseCampLimit = values.BaseCampMaxNumInGuild

  if (
    typeof totalBaseCampLimit === 'number' &&
    typeof guildBaseCampLimit === 'number' &&
    totalBaseCampLimit < guildBaseCampLimit
  ) {
    issues.push(
      createIssue(
        'base-camp-total-lower-than-guild-limit',
        'warning',
        'BaseCampMaxNum',
        `服务器据点总数上限为 ${totalBaseCampLimit}，低于单个公会据点上限 ${guildBaseCampLimit}。单个公会的实际可用据点数会受到服务器总上限限制。`,
      ),
    )
  }

  const pawnCullDistance =
    values.ServerReplicatePawnCullDistance
  const workerLimit = values.BaseCampWorkerMaxNum
  const palSpawnRate = values.PalSpawnNumRate

  const highWorkerLoad =
    typeof workerLimit === 'number' &&
    workerLimit >= 40

  const highSpawnLoad =
    typeof palSpawnRate === 'number' &&
    palSpawnRate >= 2

  if (
    typeof pawnCullDistance === 'number' &&
    pawnCullDistance >= 15000 &&
    (highWorkerLoad || highSpawnLoad)
  ) {
    issues.push(
      createIssue(
        'server-pal-sync-load-high',
        'warning',
        'ServerReplicatePawnCullDistance',
        '帕鲁网络同步距离已使用最大值，同时工作帕鲁上限或帕鲁出现倍率较高，可能增加服务器网络同步与 CPU 压力。',
      ),
    )
  }

  const containerSyncInterval =
    values.ItemContainerForceMarkDirtyInterval

  if (
    typeof containerSyncInterval === 'number' &&
    containerSyncInterval < 0.5
  ) {
    issues.push(
      createIssue(
        'item-container-sync-too-frequent',
        'warning',
        'ItemContainerForceMarkDirtyInterval',
        `容器强制同步间隔当前为 ${containerSyncInterval} 秒。低于 0.5 秒会显著提高同步频率，通常没有必要。`,
      ),
    )
  }

  return issues
}
