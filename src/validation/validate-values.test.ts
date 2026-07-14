import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  type SettingsValues,
} from '../data/settings-schema'
import { validateSettingValues } from './validate-values'

function createValues(
  overrides: Partial<SettingsValues> = {},
): SettingsValues {
  return {
    ...createDefaultSettingsValues(),
    ...overrides,
  }
}

function getIssueIds(values: SettingsValues): string[] {
  return validateSettingValues(values).map(
    (issue) => issue.id,
  )
}

describe('validateSettingValues', () => {
  it('官方默认值不产生单参数校验问题', () => {
    expect(
      validateSettingValues(createDefaultSettingsValues()),
    ).toEqual([])
  })

  it('建议范围外的数字产生 warning', () => {
    const issues = validateSettingValues(
      createValues({
        ExpRate: 21,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'ExpRate-outside-range',
        severity: 'warning',
        settingKey: 'ExpRate',
        category: 'basic',
      }),
    )
  })

  it('硬范围外的数字产生 error', () => {
    const issues = validateSettingValues(
      createValues({
        BaseCampMaxNumInGuild: 11,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'BaseCampMaxNumInGuild-outside-range',
        severity: 'error',
        settingKey: 'BaseCampMaxNumInGuild',
        category: 'building',
      }),
    )
  })

  it('整数参数拒绝小数', () => {
    const issues = validateSettingValues(
      createValues({
        RCONPort: 25575.5,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'RCONPort-not-integer',
        severity: 'error',
        settingKey: 'RCONPort',
      }),
    )
  })

  it('NaN 和无限值不是有效数字', () => {
    const nanIssues = validateSettingValues(
      createValues({
        ExpRate: Number.NaN,
      }),
    )

    const infinityIssues = validateSettingValues(
      createValues({
        ExpRate: Number.POSITIVE_INFINITY,
      }),
    )

    expect(nanIssues).toContainEqual(
      expect.objectContaining({
        id: 'ExpRate-invalid-number',
        severity: 'error',
      }),
    )
    expect(infinityIssues).toContainEqual(
      expect.objectContaining({
        id: 'ExpRate-invalid-number',
        severity: 'error',
      }),
    )
  })

  it('无限制数值使用特殊值时不触发范围提醒', () => {
    const ids = getIssueIds(
      createValues({
        MaxBuildingLimitNum: 0,
      }),
    )

    expect(ids).not.toContain(
      'MaxBuildingLimitNum-outside-range',
    )
  })

  it('布尔参数收到其他类型时产生错误', () => {
    const issues = validateSettingValues(
      createValues({
        bIsPvP: 'true',
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'bIsPvP-invalid-boolean',
        severity: 'error',
      }),
    )
  })

  it('枚举参数拒绝未支持的选项', () => {
    const issues = validateSettingValues(
      createValues({
        DeathPenalty: 'DropEverythingForever',
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'DeathPenalty-unsupported-enum',
        severity: 'error',
      }),
    )
  })

  it('文本参数收到数字时产生错误', () => {
    const issues = validateSettingValues(
      createValues({
        ServerName: 123,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'ServerName-invalid-string',
        severity: 'error',
      }),
    )
  })

  it('跨平台列表至少选择一项', () => {
    const issues = validateSettingValues(
      createValues({
        CrossplayPlatforms: [],
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'CrossplayPlatforms-too-few-selections',
        severity: 'error',
      }),
    )
  })

  it('跨平台列表拒绝未支持的平台', () => {
    const issues = validateSettingValues(
      createValues({
        CrossplayPlatforms: ['Steam', 'Switch'],
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'CrossplayPlatforms-unsupported-list-values',
        severity: 'error',
      }),
    )
  })

  it('跨平台列表包含重复值时产生 warning', () => {
    const issues = validateSettingValues(
      createValues({
        CrossplayPlatforms: ['Steam', 'Steam'],
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'CrossplayPlatforms-duplicate-list-values',
        severity: 'warning',
      }),
    )
  })

  it('列表包含非字符串项目时产生错误', () => {
    const values = createValues()

    values.CrossplayPlatforms = [
      'Steam',
      123,
    ] as unknown as string[]

    const issues = validateSettingValues(values)

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'CrossplayPlatforms-invalid-string-list',
        severity: 'error',
      }),
    )
  })
})
