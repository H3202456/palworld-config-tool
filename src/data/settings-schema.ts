import type {
  SettingDefinition,
  SettingRuntimeValue,
} from './settings-types'

export const SETTINGS_SCHEMA = [
  {
    key: 'DayTimeSpeedRate',
    label: '白天流逝速度倍率',
    category: 'basic',
    order: 5,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制游戏内白天时间的流逝速度。数值越高，白天结束得越快；数值越低，白天持续得越久。',
    example:
      '设置为 0.5 时，白天持续时间约为默认情况的 2 倍。',
    simpleMode: true,
  },
  {
    key: 'NightTimeSpeedRate',
    label: '夜晚流逝速度倍率',
    category: 'basic',
    order: 6,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制游戏内夜晚时间的流逝速度。数值越高，夜晚结束得越快；数值越低，夜晚持续得越久。',
    example:
      '设置为 2 时，夜晚持续时间约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'ExpRate',
    label: '经验值倍率',
    category: 'basic',
    order: 10,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 20,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description: '控制玩家和帕鲁获得经验值的倍率。',
    example: '设置为 2 时，获得的经验值约为默认情况的 2 倍。',
    simpleMode: true,
  },
  {
    key: 'PalCaptureRate',
    label: '帕鲁捕获率',
    category: 'basic',
    order: 20,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description: '控制捕获帕鲁时的成功率倍率。',
    example: '数值越高，帕鲁通常越容易捕获。',
    simpleMode: true,
  },
  {
    key: 'PalSpawnNumRate',
    label: '帕鲁出现数量倍率',
    category: 'basic',
    order: 30,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 3,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制地图中帕鲁出现的数量。数值越高，同时出现的帕鲁越多，也会增加服务器性能压力。',
    example: '设置为 1.5 时，帕鲁出现数量约为默认情况的 1.5 倍。',
    simpleMode: true,
  },
  {
    key: 'PalDamageRateAttack',
    label: '帕鲁造成伤害倍率',
    category: 'basic',
    order: 40,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制所有帕鲁造成的伤害，包括玩家拥有的帕鲁和野生帕鲁。',
    example: '设置为 2 时，帕鲁造成的伤害约为默认情况的 2 倍。',
    simpleMode: true,
  },
  {
    key: 'PalDamageRateDefense',
    label: '帕鲁承受伤害倍率',
    category: 'basic',
    order: 50,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制所有帕鲁实际承受的伤害。数值越高，帕鲁受到的伤害越高。',
    example: '设置为 2 时，帕鲁受到的伤害约为默认情况的 2 倍。',
    simpleMode: true,
  },
  {
    key: 'WorkSpeedRate',
    label: '工作速度倍率',
    category: 'basic',
    order: 60,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制制作、建造和据点工作的完成速度。数值越高，工作完成得越快。',
    example: '设置为 5 时，工作速度会明显快于默认状态。',
    simpleMode: true,
  },
  {
    key: 'PalEggDefaultHatchingTime',
    label: '巨大蛋孵化时间',
    category: 'basic',
    order: 70,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 72,
    step: 0.1,
    precision: 1,
    unit: '小时',
    rangeKind: 'suggested',

    description:
      '控制巨大帕鲁蛋孵化所需的基础时间，其他尺寸的蛋会按比例计算孵化时间。',
    example:
      '设置为 0.3 时，巨大蛋的基础孵化时间约为 18 分钟。',
    simpleMode: true,
  },
  {
    key: 'bEnableFastTravel',
    label: '允许快速传送',
    category: 'basic',
    order: 80,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description: '允许玩家使用快速传送功能。',
    simpleMode: true,
  },
  {
    key: 'bEnableInvaderEnemy',
    label: '启用据点袭击事件',
    category: 'basic',
    order: 90,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许世界触发敌对势力袭击据点的事件。关闭后，服务器的据点防守压力会明显降低。',
    example:
      '想保留完整生存体验时保持开启；休闲建造服务器可以关闭。',
    simpleMode: true,
  },
  {
    key: 'SupplyDropSpan',
    label: '陨石与补给事件间隔',
    category: 'basic',
    order: 100,

    valueType: 'number',
    control: 'number',
    defaultValue: 180,
    serialization: 'integer',

    min: 1,
    max: 1440,
    step: 1,
    precision: 0,
    unit: '分钟',
    rangeKind: 'suggested',

    description:
      '控制陨石和补给物资事件之间的基础间隔。数值越低，事件通常出现得越频繁。',
    example:
      '当前默认值为 180 分钟；设置为 60 时，事件间隔约为 1 小时。',
    simpleMode: true,
  },
  {
    key: 'PlayerDamageRateAttack',
    label: '玩家造成伤害倍率',
    category: 'player',
    order: 10,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description: '控制玩家攻击造成的实际伤害。',
    example:
      '设置为 2.5 时，玩家造成的伤害约为默认值的 2.5 倍。',
    simpleMode: true,
  },
  {
    key: 'PlayerDamageRateDefense',
    label: '玩家承受伤害倍率',
    category: 'player',
    order: 20,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制玩家实际受到的伤害。数值越低，玩家受到的伤害越少。',
    example:
      '设置为 0.5 时，玩家受到的伤害约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'PlayerStomachDecreaceRate',
    label: '玩家饱腹度消耗倍率',
    category: 'player',
    order: 21,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制玩家饱腹度下降的速度。数值越低，玩家越不容易饥饿；数值越高，饱腹度消耗越快。',
    example:
      '设置为 0.5 时，玩家饱腹度消耗速度约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'PlayerStaminaDecreaceRate',
    label: '玩家耐力消耗倍率',
    category: 'player',
    order: 22,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制奔跑、攀爬和其他行动消耗耐力的速度。数值越低，耐力消耗越慢。',
    example:
      '设置为 0.1 时，玩家耐力消耗会明显低于默认状态。',
    simpleMode: true,
  },
  {
    key: 'PlayerAutoHPRegeneRate',
    label: '玩家自动回血倍率',
    category: 'player',
    order: 23,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制玩家在正常状态下自动恢复生命值的速度。数值越高，回血越快。',
    example:
      '设置为 5 时，玩家脱离危险后的生命恢复会明显加快。',
    simpleMode: true,
  },
  {
    key: 'PlayerAutoHpRegeneRateInSleep',
    label: '玩家睡眠回血倍率',
    category: 'player',
    order: 24,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制玩家睡眠时自动恢复生命值的速度。该参数只影响睡眠状态下的回血。',
    example:
      '设置为 5 时，玩家睡眠期间的生命恢复速度会明显加快。',
    simpleMode: true,
  },
  {
    key: 'bAllowEnhanceStat_Health',
    label: '允许生命值属性加点',
    category: 'player',
    order: 25,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许玩家将属性点分配到生命值。关闭后，玩家不能继续提升生命值属性。',
    simpleMode: false,
  },
  {
    key: 'bAllowEnhanceStat_Attack',
    label: '允许攻击属性加点',
    category: 'player',
    order: 26,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许玩家将属性点分配到攻击力。关闭后，玩家不能继续提升攻击属性。',
    simpleMode: false,
  },
  {
    key: 'bAllowEnhanceStat_Stamina',
    label: '允许耐力属性加点',
    category: 'player',
    order: 27,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许玩家将属性点分配到耐力。关闭后，玩家不能继续提升耐力属性。',
    simpleMode: false,
  },
  {
    key: 'bAllowEnhanceStat_Weight',
    label: '允许负重属性加点',
    category: 'player',
    order: 28,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许玩家将属性点分配到负重。关闭后，玩家不能继续提升携带重量。',
    simpleMode: false,
  },
  {
    key: 'bAllowEnhanceStat_WorkSpeed',
    label: '允许工作速度属性加点',
    category: 'player',
    order: 29,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许玩家将属性点分配到工作速度。关闭后，玩家不能继续提升工作速度属性。',
    simpleMode: false,
  },
  {
    key: 'EquipmentDurabilityDamageRate',
    label: '装备耐久损耗倍率',
    category: 'player',
    order: 30,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制武器、护甲和工具使用时损失耐久度的速度。数值越低，装备越耐用。',
    example:
      '设置为 0.5 时，装备耐久损耗速度约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'DeathPenalty',
    label: '死亡惩罚',
    category: 'player',
    order: 40,

    valueType: 'enum',
    control: 'segmented',
    defaultValue: 'Item',
    serialization: 'raw',

    options: [
      {
        label: '不掉落',
        value: 'None',
        description: '死亡后不掉落任何物品。',
      },
      {
        label: '仅物品',
        value: 'Item',
        description: '掉落背包中的物品，但保留已经装备的装备。',
      },
      {
        label: '物品和装备',
        value: 'ItemAndEquipment',
        description: '掉落背包物品和已经装备的装备。',
      },
      {
        label: '全部',
        value: 'All',
        description: '掉落物品、装备以及队伍中的帕鲁。',
      },
    ],

    description: '决定玩家死亡后会失去哪些内容。',
    simpleMode: true,
  },
  {
    key: 'RandomizerType',
    label: '帕鲁出现随机模式',
    category: 'pal',
    order: 1,

    valueType: 'enum',
    control: 'segmented',
    defaultValue: 'None',
    serialization: 'raw',

    options: [
      {
        label: '关闭',
        value: 'None',
        description: '保持正常的帕鲁出现规则。',
      },
      {
        label: '按区域随机',
        value: 'Region',
        description: '在各区域适合的范围内随机帕鲁。',
      },
      {
        label: '完全随机',
        value: 'All',
        description: '在整个世界中完全随机帕鲁。',
      },
    ],

    description:
      '控制野生帕鲁的出现随机方式。随机化会明显改变地图探索、捕获和成长体验。',
    example:
      '普通服务器保持“关闭”；想保留区域差异时选择“按区域随机”。',
    simpleMode: false,
  },
  {
    key: 'RandomizerSeed',
    label: '帕鲁随机种子',
    category: 'pal',
    order: 2,

    valueType: 'string',
    control: 'text',
    defaultValue: '',
    serialization: 'quoted-string',

    description:
      '随机模式使用的种子文本。使用相同种子通常便于复现相同的随机结果。',
    placeholder: '留空则不指定固定种子',
    simpleMode: false,

    dependsOn: {
      key: 'RandomizerType',
      operator: 'not-equals',
      value: 'None',
      behavior: 'disable',
    },
  },
  {
    key: 'bIsRandomizerPalLevelRandom',
    label: '帕鲁等级完全随机',
    category: 'pal',
    order: 3,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '开启后，野生帕鲁等级会完全随机；关闭时，等级会在各区域原本适合的范围内随机。',
    example:
      '希望随机地图仍保留大致成长顺序时保持关闭。',
    simpleMode: false,

    dependsOn: {
      key: 'RandomizerType',
      operator: 'not-equals',
      value: 'None',
      behavior: 'disable',
    },
  },
  {
    key: 'PalStomachDecreaceRate',
    label: '帕鲁饱腹度消耗倍率',
    category: 'pal',
    order: 10,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制帕鲁饱腹度下降的速度。数值越低，帕鲁越不容易饥饿。',
    example:
      '设置为 0.1 时，帕鲁饱腹度消耗会明显低于默认状态。',
    simpleMode: true,
  },
  {
    key: 'PalStaminaDecreaceRate',
    label: '帕鲁耐力消耗倍率',
    category: 'pal',
    order: 20,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制帕鲁行动时消耗耐力的速度。数值越低，帕鲁耐力消耗越慢。',
    example:
      '设置为 0.1 时，帕鲁耐力消耗会明显低于默认状态。',
    simpleMode: true,
  },
  {
    key: 'PalAutoHPRegeneRate',
    label: '帕鲁自动回血倍率',
    category: 'pal',
    order: 30,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制帕鲁在正常状态下自动恢复生命值的速度。数值越高，回血越快。',
    example:
      '设置为 5 时，帕鲁脱离战斗后的生命恢复会明显加快。',
    simpleMode: true,
  },
  {
    key: 'PalAutoHpRegeneRateInSleep',
    label: '帕鲁休息回血倍率',
    category: 'pal',
    order: 40,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制帕鲁在睡眠或帕鲁终端内休息时恢复生命值的速度。',
    example:
      '设置为 5 时，休息中的帕鲁会更快恢复生命值。',
    simpleMode: true,
  },
  {
    key: 'MonsterFarmActionSpeedRate',
    label: '放牧产物生产速度倍率',
    category: 'pal',
    order: 50,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制帕鲁在牧场放牧时生产物品的速度。数值越高，产物生成得越快。',
    example:
      '设置为 3 时，牧场产物的生产速度会明显高于默认状态。',
    simpleMode: true,
  },
  {
    key: 'bAllowGlobalPalboxExport',
    label: '允许导出到全局帕鲁终端',
    category: 'pal',
    order: 60,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许玩家把当前世界中的帕鲁保存到全局帕鲁终端，以便在支持该功能的其他世界中使用。',
    example:
      '关闭后，玩家不能从该服务器把帕鲁导出到全局帕鲁终端。',
    simpleMode: false,
  },
  {
    key: 'bAllowGlobalPalboxImport',
    label: '允许从全局帕鲁终端导入',
    category: 'pal',
    order: 70,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '允许玩家从全局帕鲁终端把帕鲁导入当前世界。开启后可能影响服务器原有的成长和收集节奏。',
    example:
      '面向固定好友的私人服务器可以按共同规则决定是否开启。',
    simpleMode: false,
  },
  {
    key: 'EnablePredatorBossPal',
    label: '启用捕食者首领帕鲁',
    category: 'pal',
    order: 80,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许世界中出现捕食者首领帕鲁。该参数存在于当前默认配置中，但当前官方参数说明页没有单独列出。',
    example:
      '关闭后可减少这类特殊首领遭遇；实际表现可能随游戏版本变化。',
    simpleMode: true,
  },
  {
    key: 'CollectionDropRate',
    label: '采集资源获得量倍率',
    category: 'resources',
    order: 10,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制采集矿石、木材、石头等资源时获得的物品数量。',
    example:
      '设置为 3 时，每次采集获得的资源数量约为默认情况的 3 倍。',
    simpleMode: true,
  },
  {
    key: 'CollectionObjectHpRate',
    label: '采集物生命值倍率',
    category: 'resources',
    order: 20,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制矿石、树木和岩石等采集物能够承受的伤害总量。',
    example:
      '设置为 1.5 时，采集物会比默认状态更耐打，也能持续采集更久。',
    simpleMode: true,
  },
  {
    key: 'CollectionObjectRespawnSpeedRate',
    label: '资源刷新间隔倍率',
    category: 'resources',
    order: 30,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制矿石、树木和其他采集物重新出现所需的时间。数值越低，资源刷新越快。',
    example:
      '设置为 0.5 时，资源刷新间隔约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'EnemyDropItemRate',
    label: '敌人掉落数量倍率',
    category: 'resources',
    order: 40,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description: '控制击败敌人和帕鲁后获得的掉落物数量。',
    example:
      '设置为 3 时，敌人掉落物数量约为默认情况的 3 倍。',
    simpleMode: true,
  },
  {
    key: 'ItemWeightRate',
    label: '物品重量倍率',
    category: 'resources',
    order: 50,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 5,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制背包中物品的重量倍率。数值越低，物品越轻，玩家可以携带更多物品。',
    example:
      '设置为 0.5 时，物品重量约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'ItemCorruptionMultiplier',
    label: '物品腐败速度倍率',
    category: 'resources',
    order: 60,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制有保质期物品的腐败速度。数值越低，物品腐败得越慢。',
    example:
      '设置为 0.5 时，物品腐败速度约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'DropItemMaxNum',
    label: '世界掉落物数量上限',
    category: 'resources',
    order: 70,

    valueType: 'number',
    control: 'number',
    defaultValue: 3000,
    serialization: 'integer',

    min: 100,
    max: 20000,
    step: 100,
    precision: 0,
    unit: '个',
    rangeKind: 'suggested',

    description:
      '控制世界中能够同时存在的掉落物总数。数值过高可能增加服务器内存、同步和清理压力。',
    example:
      '当前默认值为 3000。多人高倍率服务器不建议无节制提高。',
    simpleMode: false,
  },
  {
    key: 'PhysicsActiveDropItemMaxNum',
    label: '启用物理效果的掉落物上限',
    category: 'resources',
    order: 80,

    valueType: 'number',
    control: 'unlimited-number',
    defaultValue: -1,
    serialization: 'integer',

    min: 100,
    max: 20000,
    step: 100,
    precision: 0,
    unit: '个',
    rangeKind: 'suggested',

    unlimitedValue: -1,
    finiteDefaultValue: 3000,
    unlimitedLabel: '不限制物理模拟数量',

    description:
      '控制能够同时使用物理行为的掉落物数量。限制该数值可以作为繁忙服务器的性能调节手段。',
    example:
      '当前默认配置使用 -1 表示不限制；性能不足时可以改为有限数量。',
    simpleMode: false,
  },
  {
    key: 'DropItemAliveMaxHours',
    label: '掉落物地面存活时间',
    category: 'resources',
    order: 90,

    valueType: 'number',
    control: 'number',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 24,
    step: 0.1,
    precision: 1,
    unit: '小时',
    rangeKind: 'suggested',

    description:
      '控制掉落物在地面上保留多长时间后自动消失。时间越长，世界中越容易积累大量掉落物。',
    example:
      '当前默认值为 1 小时。繁忙服务器可以适当降低以减少堆积。',
    simpleMode: false,
  },
  {
    key: 'BuildObjectHpRate',
    label: '建筑生命值倍率',
    category: 'building',
    order: 10,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制建筑物的生命值倍率。该参数存在于当前默认配置中，但当前官方参数说明页未单独解释其行为。',
    example:
      '设置为 2 时，建筑生命值通常会高于默认状态；实际效果可能随游戏版本变化。',
    simpleMode: false,
  },
  {
    key: 'BuildObjectDamageRate',
    label: '建筑承受伤害倍率',
    category: 'building',
    order: 20,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制建筑物受到攻击时承受的伤害倍率。数值越低，建筑通常越耐打。',
    example:
      '设置为 0.5 时，建筑受到的伤害约为默认情况的一半。',
    simpleMode: true,
  },
  {
    key: 'BuildObjectDeteriorationDamageRate',
    label: '建筑自然劣化倍率',
    category: 'building',
    order: 30,

    valueType: 'number',
    control: 'slider',
    defaultValue: 1,
    serialization: 'float',

    min: 0,
    max: 10,
    step: 0.1,
    precision: 1,
    unit: '倍',
    rangeKind: 'suggested',

    description:
      '控制建筑物随时间自然劣化的速度。数值越低，建筑劣化越慢。',
    example:
      '设置为 0.1 时，建筑自然劣化速度会明显低于默认状态。',
    simpleMode: true,
  },
  {
    key: 'bAutoResetGuildNoOnlinePlayers',
    label: '自动清理长期离线公会',
    category: 'building',
    order: 35,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '当公会所有成员持续离线达到指定时间后，自动删除该公会的建筑与据点帕鲁。该操作具有破坏性。',
    example:
      '私人长期存档通常建议关闭；公共服务器需要清理弃坑据点时再开启。',
    simpleMode: false,
  },
  {
    key: 'AutoResetGuildTimeNoOnlinePlayers',
    label: '公会离线清理等待时间',
    category: 'building',
    order: 36,

    valueType: 'number',
    control: 'number',
    defaultValue: 72,
    serialization: 'float',

    min: 1,
    max: 8760,
    step: 1,
    precision: 0,
    unit: '小时',
    rangeKind: 'suggested',

    description:
      '公会所有成员连续离线多久后触发自动清理。只有开启“自动清理长期离线公会”时才生效。',
    example:
      '当前默认值为 72 小时，也就是连续离线 3 天后触发。',
    simpleMode: false,

    dependsOn: {
      key: 'bAutoResetGuildNoOnlinePlayers',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    },
  },
  {
    key: 'GuildPlayerMaxNum',
    label: '公会成员人数上限',
    category: 'building',
    order: 37,

    valueType: 'number',
    control: 'number',
    defaultValue: 20,
    serialization: 'integer',

    min: 1,
    max: 100,
    step: 1,
    precision: 0,
    unit: '人',
    rangeKind: 'suggested',

    description:
      '控制单个公会能够拥有的最大成员数量。',
    example:
      '当前默认值为 20；私人小型服务器可按实际人数降低。',
    simpleMode: true,
  },
  {
    key: 'BaseCampMaxNum',
    label: '服务器据点总数上限',
    category: 'building',
    order: 38,

    valueType: 'number',
    control: 'number',
    defaultValue: 128,
    serialization: 'integer',

    min: 1,
    max: 1024,
    step: 1,
    precision: 0,
    unit: '个',
    rangeKind: 'suggested',

    description:
      '控制整个服务器中能够同时存在的据点总数。数值越高，服务器需要维护的据点、寻路与同步数据通常越多。',
    example:
      '当前默认配置为 128。小型私人服务器通常无需提高。',
    simpleMode: false,
  },
  {
    key: 'BaseCampMaxNumInGuild',
    label: '每个公会据点数量上限',
    category: 'building',
    order: 40,

    valueType: 'number',
    control: 'number',
    defaultValue: 4,
    serialization: 'integer',

    min: 1,
    max: 10,
    step: 1,
    precision: 0,
    unit: '个',
    rangeKind: 'hard',

    description:
      '控制每个公会能够拥有的据点数量。数值越高，服务器处理负载通常越大。',
    example:
      '官方默认值为 4，最大值为 10。',
    simpleMode: true,
  },
  {
    key: 'BaseCampWorkerMaxNum',
    label: '每个据点工作帕鲁上限',
    category: 'building',
    order: 50,

    valueType: 'number',
    control: 'number',
    defaultValue: 15,
    serialization: 'integer',

    min: 1,
    max: 50,
    step: 1,
    precision: 0,
    unit: '只',
    rangeKind: 'hard',

    description:
      '控制每个据点能够同时工作的帕鲁数量。数值越高，服务器处理负载通常越大。',
    example:
      '当前默认配置为 15，官方允许的最大值为 50。',
    simpleMode: true,
  },
  {
    key: 'MaxBuildingLimitNum',
    label: '每名玩家建筑数量上限',
    category: 'building',
    order: 60,

    valueType: 'number',
    control: 'unlimited-number',
    defaultValue: 0,
    serialization: 'integer',

    min: 100,
    max: 100000,
    step: 100,
    precision: 0,
    unit: '个',
    rangeKind: 'suggested',

    unlimitedValue: 0,
    finiteDefaultValue: 10000,
    unlimitedLabel: '不限制建筑数量',

    description:
      '限制每名玩家可以拥有的建筑数量，0 表示无限制。',
    example:
      '开启无限制时，程序会自动写入 0。',
    simpleMode: false,
  },
  {
    key: 'bIsPvP',
    label: '启用 PvP',
    category: 'pvp',
    order: 10,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '允许服务器启用玩家之间的 PvP 对战规则。',
    simpleMode: true,
  },
  {
    key: 'bEnablePlayerToPlayerDamage',
    label: '允许玩家互相伤害',
    category: 'pvp',
    order: 20,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '允许玩家的攻击对其他玩家造成伤害。',
    simpleMode: true,

    dependsOn: {
      key: 'bIsPvP',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    },
  },
  {
    key: 'bEnableDefenseOtherGuildPlayer',
    label: '据点帕鲁攻击敌对公会玩家',
    category: 'pvp',
    order: 30,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '允许据点帕鲁攻击进入据点范围的其他公会玩家。',
    simpleMode: true,

    dependsOn: {
      key: 'bIsPvP',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    },
  },
  {
    key: 'ServerName',
    label: '服务器名称',
    category: 'server',
    order: 10,

    valueType: 'string',
    control: 'text',
    defaultValue: 'Default Palworld Server',
    serialization: 'quoted-string',

    description:
      '玩家在服务器列表中看到的服务器名称。',
    placeholder: '例如：h302_world',
    simpleMode: true,
  },
  {
    key: 'ServerDescription',
    label: '服务器介绍',
    category: 'server',
    order: 20,

    valueType: 'string',
    control: 'text',
    defaultValue: '',
    serialization: 'quoted-string',

    description:
      '服务器列表或连接界面中显示的介绍内容。',
    placeholder:
      '例如：欢迎来到我的 Palworld 服务器',
    simpleMode: true,
  },
  {
    key: 'ServerPassword',
    label: '服务器加入密码',
    category: 'server',
    order: 30,

    valueType: 'string',
    control: 'password',
    defaultValue: '',
    serialization: 'quoted-string',

    description:
      '玩家加入服务器时需要输入的密码，留空表示不设置。',
    placeholder: '留空表示无需密码',
    simpleMode: true,
  },
  {
    key: 'AdminPassword',
    label: '管理员密码',
    category: 'server',
    order: 40,

    valueType: 'string',
    control: 'password',
    defaultValue: '',
    serialization: 'quoted-string',

    description:
      '用于在服务器中获得管理员权限的密码。',
    placeholder: '请输入管理员密码',
    simpleMode: false,
  },
  {
    key: 'CoopPlayerMaxNum',
    label: '合作模式人数上限',
    category: 'server',
    order: 50,

    valueType: 'number',
    control: 'number',
    defaultValue: 4,
    serialization: 'integer',

    min: 1,
    max: 32,
    step: 1,
    precision: 0,
    unit: '人',
    rangeKind: 'suggested',

    description:
      '控制合作模式允许的玩家人数。该参数存在于当前默认配置中，但未列入官方 1.0 参数说明表，实际效果可能随版本变化。',
    example:
      '当前默认配置为 4；你的私人服务器可以按实际联机人数设置。',
    simpleMode: true,
  },
  {
    key: 'ServerPlayerMaxNum',
    label: '服务器最大人数',
    category: 'server',
    order: 60,

    valueType: 'number',
    control: 'number',
    defaultValue: 32,
    serialization: 'integer',

    min: 1,
    max: 128,
    step: 1,
    precision: 0,
    unit: '人',
    rangeKind: 'suggested',

    description:
      '允许同时加入服务器的最大玩家数量。',
    example:
      '私人服务器常用 4、8、16 或 32 人。',
    simpleMode: true,
  },
  {
    key: 'AutoSaveSpan',
    label: '自动保存间隔',
    category: 'server',
    order: 65,

    valueType: 'number',
    control: 'number',
    defaultValue: 30,
    serialization: 'float',

    min: 10,
    max: 3600,
    step: 10,
    precision: 0,
    unit: '秒',
    rangeKind: 'suggested',

    description:
      '控制服务器自动保存世界数据的时间间隔。间隔过短会增加磁盘写入频率。',
    example:
      '当前默认值为 30 秒；私人服务器通常可保持默认值。',
    simpleMode: false,
  },
  {
    key: 'CrossplayPlatforms',
    label: '允许连接的平台',
    category: 'server',
    order: 70,

    valueType: 'string-array',
    control: 'multi-select',
    defaultValue: ['Steam', 'Xbox', 'PS5', 'Mac'],
    serialization: 'string-list',

    options: [
      {
        label: 'Steam',
        value: 'Steam',
      },
      {
        label: 'Xbox',
        value: 'Xbox',
      },
      {
        label: 'PS5',
        value: 'PS5',
      },
      {
        label: 'Mac',
        value: 'Mac',
      },
    ],

    minSelections: 1,

    description:
      '决定哪些游戏平台的玩家可以连接服务器。',
    example:
      '只允许 Steam 玩家时，导出为 CrossplayPlatforms=(Steam)。',
    simpleMode: true,
  },
  {
    key: 'bAllowClientMod',
    label: '允许使用模组的客户端加入',
    category: 'server',
    order: 72,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '允许启用了客户端模组的玩家加入服务器。该选项不会替你安装服务器模组，也不能保证客户端与服务器模组版本兼容。',
    example:
      '使用客户端模组或服务器模组时通常保持开启，并确保所有玩家安装相同版本。',
    simpleMode: false,
  },
  {
    key: 'bIsShowJoinLeftMessage',
    label: '显示玩家加入与离开消息',
    category: 'server',
    order: 73,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '控制玩家加入或离开服务器时，是否在游戏内显示系统消息。',
    simpleMode: true,
  },
  {
    key: 'ChatPostLimitPerMinute',
    label: '每分钟聊天消息上限',
    category: 'server',
    order: 74,

    valueType: 'number',
    control: 'number',
    defaultValue: 30,
    serialization: 'integer',

    min: 1,
    max: 600,
    step: 1,
    precision: 0,
    unit: '条/分钟',
    rangeKind: 'suggested',

    description:
      '限制单个玩家每分钟能够发送的聊天消息数量，用于降低刷屏和聊天滥用。',
    example:
      '当前默认值为 30。私人好友服通常不需要修改。',
    simpleMode: false,
  },
  {
    key: 'bIsUseBackupSaveData',
    label: '启用世界自动备份',
    category: 'server',
    order: 75,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: true,
    serialization: 'boolean',

    description:
      '让服务器定期在存档目录中保存世界备份。开启后会增加一定磁盘写入与存储占用，但能降低存档损坏或误操作带来的风险。',
    example:
      '建议保持开启。官方服务器指南说明开启后会在存档目录创建 backup 文件夹。',
    simpleMode: true,
  },
  {
    key: 'bShowPlayerList',
    label: '在菜单中显示玩家列表',
    category: 'server',
    order: 76,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '控制玩家是否可以在 ESC 菜单中查看当前服务器的玩家列表。',
    simpleMode: true,
  },
  {
    key: 'bEnableVoiceChat',
    label: '游戏内语音聊天',
    category: 'server',
    order: 80,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '允许玩家在服务器中使用游戏内语音聊天。',
    simpleMode: true,
  },
  {
    key: 'VoiceChatMaxVolumeDistance',
    label: '语音保持最大音量的距离',
    category: 'server',
    order: 90,

    valueType: 'number',
    control: 'number',
    defaultValue: 3000,
    serialization: 'float',

    min: 0,
    max: 100000,
    step: 100,
    precision: 0,
    unit: '距离单位',
    rangeKind: 'suggested',

    description:
      '控制语音聊天保持最大音量的距离。玩家超过这个距离后，语音音量会开始衰减。',
    example:
      '当前默认配置为 3000。数值越大，玩家在更远距离内仍能以较大音量听见彼此。',
    simpleMode: false,

    dependsOn: {
      key: 'bEnableVoiceChat',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    },
  },
  {
    key: 'VoiceChatZeroVolumeDistance',
    label: '语音完全静音的距离',
    category: 'server',
    order: 100,

    valueType: 'number',
    control: 'number',
    defaultValue: 15000,
    serialization: 'float',

    min: 0,
    max: 100000,
    step: 100,
    precision: 0,
    unit: '距离单位',
    rangeKind: 'suggested',

    description:
      '控制语音聊天衰减到完全听不见的距离。通常应大于“语音保持最大音量的距离”。',
    example:
      '当前默认配置为 15000。超过这个距离后，其他玩家的语音将无法听见。',
    simpleMode: false,

    dependsOn: {
      key: 'bEnableVoiceChat',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    },
  },
  {
    key: 'PublicIP',
    label: '社区服务器公开 IP',
    category: 'advanced',
    order: 1,

    valueType: 'string',
    control: 'text',
    defaultValue: '',
    serialization: 'quoted-string',

    description:
      '在社区服务器列表中显式指定对外公开的 IP 地址。留空时由服务器环境自行判断。',
    example:
      '该参数只用于社区服务器公开信息，不应填写局域网地址来冒充公网地址。',
    placeholder: '留空或填写公网 IP',
    simpleMode: false,
  },
  {
    key: 'PublicPort',
    label: '社区服务器公开端口',
    category: 'advanced',
    order: 2,

    valueType: 'number',
    control: 'number',
    defaultValue: 8211,
    serialization: 'integer',

    min: 1,
    max: 65535,
    step: 1,
    precision: 0,
    unit: '端口',
    rangeKind: 'hard',

    description:
      '在社区服务器列表中显式公布的外部端口。修改它不会改变服务器实际监听端口。',
    example:
      '当前默认值为 8211。端口映射后应填写玩家从公网连接时使用的端口。',
    simpleMode: false,
  },
  {
    key: 'RCONEnabled',
    label: '启用 RCON 远程管理',
    category: 'advanced',
    order: 10,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '启用旧版 RCON 远程管理接口。官方已将 RCON 标记为弃用，新部署优先使用 REST API。',
    example:
      'RCON 只建议在受信任的局域网中使用，不要直接暴露到互联网。',
    simpleMode: false,
  },
  {
    key: 'RCONPort',
    label: 'RCON 端口',
    category: 'advanced',
    order: 20,

    valueType: 'number',
    control: 'number',
    defaultValue: 25575,
    serialization: 'integer',

    min: 1,
    max: 65535,
    step: 1,
    precision: 0,
    unit: '端口',
    rangeKind: 'hard',

    description:
      'RCON 服务监听使用的网络端口。',
    example:
      '当前默认端口为 25575。修改后还需要同步调整防火墙和管理客户端。',
    simpleMode: false,

    dependsOn: {
      key: 'RCONEnabled',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    },
  },
  {
    key: 'RESTAPIEnabled',
    label: '启用 REST API',
    category: 'advanced',
    order: 30,

    valueType: 'boolean',
    control: 'switch',
    defaultValue: false,
    serialization: 'boolean',

    description:
      '启用用于服务器管理的 REST API。官方建议新部署优先使用 REST API，而不是已经弃用的 RCON。',
    example:
      'REST API 只建议在受信任的局域网中使用，不要直接暴露到互联网。',
    simpleMode: false,
  },
  {
    key: 'RESTAPIPort',
    label: 'REST API 端口',
    category: 'advanced',
    order: 40,

    valueType: 'number',
    control: 'number',
    defaultValue: 8212,
    serialization: 'integer',

    min: 1,
    max: 65535,
    step: 1,
    precision: 0,
    unit: '端口',
    rangeKind: 'hard',

    description:
      'REST API 服务监听使用的网络端口。',
    example:
      '当前默认端口为 8212。修改后还需要同步调整防火墙和调用工具。',
    simpleMode: false,

    dependsOn: {
      key: 'RESTAPIEnabled',
      operator: 'equals',
      value: true,
      behavior: 'disable',
    },
  },
  {
    key: 'LogFormatType',
    label: '服务器日志格式',
    category: 'advanced',
    order: 50,

    valueType: 'enum',
    control: 'segmented',
    defaultValue: 'Text',
    serialization: 'raw',

    options: [
      {
        label: '文本',
        value: 'Text',
        description: '便于直接阅读和手工排查。',
      },
      {
        label: 'JSON',
        value: 'Json',
        description: '便于日志采集、检索和自动化处理。',
      },
    ],

    description:
      '决定服务器日志使用普通文本还是 JSON 格式输出。',
    example:
      '没有日志分析系统时使用文本；需要接入日志平台时可选 JSON。',
    simpleMode: false,
  },
  {
    key: 'ServerReplicatePawnCullDistance',
    label: '帕鲁网络同步距离',
    category: 'advanced',
    order: 60,

    valueType: 'number',
    control: 'slider',
    defaultValue: 15000,
    serialization: 'float',

    min: 5000,
    max: 15000,
    step: 500,
    precision: 0,
    unit: '厘米',
    rangeKind: 'hard',

    description:
      '控制玩家周围需要进行网络同步的帕鲁距离。距离越大，远处帕鲁更早进入同步范围，但网络与服务器负载也可能增加。',
    example:
      '官方允许范围为 5000～15000，当前默认值为 15000。',
    simpleMode: false,
  },
  {
    key: 'ItemContainerForceMarkDirtyInterval',
    label: '容器强制同步间隔',
    category: 'advanced',
    order: 70,

    valueType: 'number',
    control: 'number',
    defaultValue: 1,
    serialization: 'float',

    min: 0.1,
    max: 60,
    step: 0.1,
    precision: 1,
    unit: '秒',
    rangeKind: 'suggested',

    description:
      '控制玩家打开容器时，服务器强制重新同步容器状态的频率。间隔越短，同步越频繁，也会增加处理与网络压力。',
    example:
      '当前默认值为 1 秒。除非正在排查容器同步问题，否则不建议大幅降低。',
    simpleMode: false,
  },
] as const satisfies readonly SettingDefinition[]

export type SettingKey =
  (typeof SETTINGS_SCHEMA)[number]['key']

export type SettingsValues = Record<
  SettingKey,
  SettingRuntimeValue
>

export function createDefaultSettingsValues(): SettingsValues {
  return Object.fromEntries(
    SETTINGS_SCHEMA.map((setting) => {
      const value = Array.isArray(setting.defaultValue)
        ? [...setting.defaultValue]
        : setting.defaultValue

      return [setting.key, value]
    }),
  ) as SettingsValues
}

export function getSettingByKey(
  key: string,
): SettingDefinition | undefined {
  return SETTINGS_SCHEMA.find(
    (setting) => setting.key === key,
  )
}

export function isSettingKey(
  key: string,
): key is SettingKey {
  return SETTINGS_SCHEMA.some(
    (setting) => setting.key === key,
  )
}

