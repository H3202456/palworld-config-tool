export const SETTING_CATEGORY_IDS = [
  'basic',
  'player',
  'pal',
  'resources',
  'building',
  'guild',
  'pvp',
  'server',
  'advanced',
] as const

export type SettingCategoryId =
  (typeof SETTING_CATEGORY_IDS)[number]

export interface SettingCategoryDefinition {
  id: SettingCategoryId
  label: string
  description: string
  order: number
}

export const SETTING_CATEGORIES = [
  {
    id: 'basic',
    label: '常用设置',
    description:
      '最常调整的游戏体验与服务器设置。',
    order: 10,
  },
  {
    id: 'player',
    label: '玩家',
    description:
      '玩家伤害、生存、成长和死亡相关设置。',
    order: 20,
  },
  {
    id: 'pal',
    label: '帕鲁',
    description:
      '帕鲁刷新、战斗、体力和成长相关设置。',
    order: 30,
  },
  {
    id: 'resources',
    label: '资源与掉落',
    description:
      '采集、掉落、资源刷新和物品重量相关设置。',
    order: 40,
  },
  {
    id: 'building',
    label: '建筑与据点',
    description:
      '建筑限制、据点数量和工作帕鲁相关设置。',
    order: 50,
  },
  {
    id: 'guild',
    label: '公会',
    description:
      '公会人数、自动清理和会长转移相关设置。',
    order: 60,
  },
  {
    id: 'pvp',
    label: 'PvP',
    description:
      '玩家对战、友军伤害和 PvP 掉落相关设置。',
    order: 70,
  },
  {
    id: 'server',
    label: '服务器',
    description:
      '服务器名称、人数、密码和平台相关设置。',
    order: 80,
  },
  {
    id: 'advanced',
    label: '高级设置',
    description:
      '网络、接口、同步和性能相关设置。',
    order: 90,
  },
] as const satisfies readonly SettingCategoryDefinition[]

export function getSettingCategory(
  id: SettingCategoryId,
): SettingCategoryDefinition | undefined {
  return SETTING_CATEGORIES.find(
    (category) => category.id === id,
  )
}