import {
  createDefaultSettingsValues,
  isSettingKey,
  type SettingKey,
  type SettingsValues,
} from './settings-schema'
import type { SettingRuntimeValue } from './settings-types'

export type ConfigPresetId =
  | 'casual-building'
  | 'balanced-friends'
  | 'fast-progression'
  | 'performance-first'

export type ConfigPresetRisk = 'low' | 'medium'

export interface ConfigPreset {
  id: ConfigPresetId
  label: string
  description: string
  recommendedFor: string
  risk: ConfigPresetRisk

  /**
   * 预设只保存需要改变的参数。
   * 未列出的参数保持用户当前值，不会被重置。
   */
  overrides: Readonly<
    Partial<Record<SettingKey, SettingRuntimeValue>>
  >
}

export interface ConfigPresetChange {
  key: SettingKey
  before: SettingRuntimeValue
  after: SettingRuntimeValue
}

const CONFIG_PRESETS: readonly ConfigPreset[] = [
  {
    id: 'casual-building',
    label: '休闲建造',
    description:
      '降低生存消耗和建筑劣化，减少袭击压力，同时适度提高采集与工作效率。',
    recommendedFor:
      '偏建造、收集和轻度生存体验的私人服务器。',
    risk: 'low',
    overrides: {
      ExpRate: 3,
      PalCaptureRate: 2,
      WorkSpeedRate: 3,
      PalEggDefaultHatchingTime: 0.5,
      PlayerStomachDecreaceRate: 0.5,
      PlayerStaminaDecreaceRate: 0.5,
      PalStomachDecreaceRate: 0.5,
      PalStaminaDecreaceRate: 0.5,
      PlayerAutoHPRegeneRate: 2,
      PalAutoHPRegeneRate: 2,
      CollectionDropRate: 2,
      EnemyDropItemRate: 2,
      ItemWeightRate: 0.5,
      ItemCorruptionMultiplier: 0.5,
      BuildObjectDeteriorationDamageRate: 0.1,
      EquipmentDurabilityDamageRate: 0.5,
      DeathPenalty: 'None',
      bEnableInvaderEnemy: false,
    },
  },
  {
    id: 'balanced-friends',
    label: '好友合作',
    description:
      '保持基本挑战，适度加快成长、捕获、采集和孵化，适合固定朋友长期游玩。',
    recommendedFor:
      '希望比官方默认轻松，但仍保留探索与成长过程的小型好友服。',
    risk: 'low',
    overrides: {
      ExpRate: 2,
      PalCaptureRate: 1.5,
      PalSpawnNumRate: 1.2,
      WorkSpeedRate: 2,
      PalEggDefaultHatchingTime: 1,
      PlayerStomachDecreaceRate: 0.8,
      PlayerStaminaDecreaceRate: 0.8,
      PalStomachDecreaceRate: 0.8,
      PalStaminaDecreaceRate: 0.8,
      CollectionDropRate: 1.5,
      EnemyDropItemRate: 1.5,
      MonsterFarmActionSpeedRate: 1.5,
      ItemWeightRate: 0.8,
      DeathPenalty: 'Item',
      SupplyDropSpan: 120,
    },
  },
  {
    id: 'fast-progression',
    label: '快速成长',
    description:
      '明显提高经验、工作、采集、掉落和放牧效率，并大幅缩短孵化与事件等待时间。',
    recommendedFor:
      '已经体验过正常流程，希望快速进入中后期内容的合作服务器。',
    risk: 'medium',
    overrides: {
      ExpRate: 10,
      PalCaptureRate: 2,
      PalSpawnNumRate: 1.5,
      WorkSpeedRate: 5,
      PalEggDefaultHatchingTime: 0.3,
      PlayerStomachDecreaceRate: 0.5,
      PlayerStaminaDecreaceRate: 0.3,
      PalStomachDecreaceRate: 0.3,
      PalStaminaDecreaceRate: 0.3,
      PlayerAutoHPRegeneRate: 3,
      PalAutoHPRegeneRate: 3,
      CollectionDropRate: 3,
      EnemyDropItemRate: 3,
      MonsterFarmActionSpeedRate: 3,
      ItemWeightRate: 0.5,
      ItemCorruptionMultiplier: 0.5,
      EquipmentDurabilityDamageRate: 0.5,
      SupplyDropSpan: 60,
    },
  },
  {
    id: 'performance-first',
    label: '性能优先',
    description:
      '减少帕鲁密度、据点规模、掉落物堆积和同步范围，降低繁忙服务器的持续负载。',
    recommendedFor:
      '配置较低、在线人数较多，或已经出现卡顿和同步压力的服务器。',
    risk: 'medium',
    overrides: {
      PalSpawnNumRate: 0.8,
      DropItemMaxNum: 1500,
      PhysicsActiveDropItemMaxNum: 1000,
      DropItemAliveMaxHours: 0.5,
      BaseCampMaxNum: 64,
      BaseCampMaxNumInGuild: 4,
      BaseCampWorkerMaxNum: 20,
      ServerReplicatePawnCullDistance: 8000,
      ItemContainerForceMarkDirtyInterval: 2,
      AutoSaveSpan: 60,
    },
  },
]

const CONFIG_PRESET_MAP = new Map<
  ConfigPresetId,
  ConfigPreset
>(
  CONFIG_PRESETS.map((preset) => [
    preset.id,
    preset,
  ]),
)

function cloneRuntimeValue(
  value: SettingRuntimeValue,
): SettingRuntimeValue {
  return Array.isArray(value) ? [...value] : value
}

export function settingValuesAreEqual(
  first: SettingRuntimeValue,
  second: SettingRuntimeValue,
): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length &&
      first.every(
        (item, index) => item === second[index],
      )
    )
  }

  return first === second
}

export function getConfigPresets(): readonly ConfigPreset[] {
  return CONFIG_PRESETS
}

export function getConfigPreset(
  id: ConfigPresetId,
): ConfigPreset {
  const preset = CONFIG_PRESET_MAP.get(id)

  if (!preset) {
    throw new Error(`找不到配置预设：${id}`)
  }

  return preset
}

export function getConfigPresetChanges(
  values: SettingsValues,
  preset: ConfigPreset,
): ConfigPresetChange[] {
  const changes: ConfigPresetChange[] = []

  for (const [rawKey, rawValue] of Object.entries(
    preset.overrides,
  )) {
    if (!isSettingKey(rawKey) || rawValue === undefined) {
      continue
    }

    const currentValue = values[rawKey]

    if (settingValuesAreEqual(currentValue, rawValue)) {
      continue
    }

    changes.push({
      key: rawKey,
      before: cloneRuntimeValue(currentValue),
      after: cloneRuntimeValue(rawValue),
    })
  }

  return changes
}

export function applyConfigPreset(
  values: SettingsValues,
  preset: ConfigPreset,
): SettingsValues {
  const nextValues = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      cloneRuntimeValue(value),
    ]),
  ) as SettingsValues

  for (const change of getConfigPresetChanges(
    values,
    preset,
  )) {
    nextValues[change.key] = cloneRuntimeValue(
      change.after,
    )
  }

  return nextValues
}

/**
 * 供测试、预览和后续 UI 使用。
 * 预设以官方默认配置为起点时也必须保持合法。
 */
export function createPresetPreviewValues(
  preset: ConfigPreset,
): SettingsValues {
  return applyConfigPreset(
    createDefaultSettingsValues(),
    preset,
  )
}
