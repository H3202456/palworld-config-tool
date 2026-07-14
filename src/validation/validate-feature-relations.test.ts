import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  type SettingsValues,
} from '../data/settings-schema'
import { validateFeatureRelations } from './validate-feature-relations'

function createValues(
  overrides: Partial<SettingsValues> = {},
): SettingsValues {
  return {
    ...createDefaultSettingsValues(),
    ...overrides,
  }
}

function getIds(values: SettingsValues): string[] {
  return validateFeatureRelations(values).map(
    (issue) => issue.id,
  )
}

describe('validateFeatureRelations', () => {
  it('官方默认值不产生功能关系提醒', () => {
    expect(
      validateFeatureRelations(
        createDefaultSettingsValues(),
      ),
    ).toEqual([])
  })

  it('随机模式关闭但保留种子时产生提醒', () => {
    const ids = getIds(
      createValues({
        RandomizerType: 'None',
        RandomizerSeed: 'same-world',
      }),
    )

    expect(ids).toContain('randomizer-options-ignored')
  })

  it('随机模式关闭但开启等级随机时产生提醒', () => {
    const ids = getIds(
      createValues({
        RandomizerType: 'None',
        bIsRandomizerPalLevelRandom: true,
      }),
    )

    expect(ids).toContain('randomizer-options-ignored')
  })

  it('随机模式开启后不会误报子项被忽略', () => {
    const ids = getIds(
      createValues({
        RandomizerType: 'Region',
        RandomizerSeed: 'same-world',
      }),
    )

    expect(ids).not.toContain(
      'randomizer-options-ignored',
    )
  })

  it('完全随机种类和等级时产生难度提醒', () => {
    const ids = getIds(
      createValues({
        RandomizerType: 'All',
        bIsRandomizerPalLevelRandom: true,
      }),
    )

    expect(ids).toContain('randomizer-fully-chaotic')
  })

  it('开启公会自动清理时产生破坏性提醒', () => {
    const issues = validateFeatureRelations(
      createValues({
        bAutoResetGuildNoOnlinePlayers: true,
        AutoResetGuildTimeNoOnlinePlayers: 72,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'guild-auto-reset-destructive',
        severity: 'warning',
        settingKey: 'bAutoResetGuildNoOnlinePlayers',
      }),
    )
  })

  it('公会清理时间不足一天时追加提醒', () => {
    const ids = getIds(
      createValues({
        bAutoResetGuildNoOnlinePlayers: true,
        AutoResetGuildTimeNoOnlinePlayers: 12,
      }),
    )

    expect(ids).toEqual(
      expect.arrayContaining([
        'guild-auto-reset-destructive',
        'guild-auto-reset-too-fast',
      ]),
    )
  })

  it('关闭公会自动清理时不检查等待时间', () => {
    const ids = getIds(
      createValues({
        bAutoResetGuildNoOnlinePlayers: false,
        AutoResetGuildTimeNoOnlinePlayers: 12,
      }),
    )

    expect(ids).not.toContain(
      'guild-auto-reset-destructive',
    )
    expect(ids).not.toContain(
      'guild-auto-reset-too-fast',
    )
  })
})