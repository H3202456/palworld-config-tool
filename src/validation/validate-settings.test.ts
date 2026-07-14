import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  type SettingsValues,
} from '../data/settings-schema'
import { validateSettings } from './validate-settings'

function createValues(
  overrides: Partial<SettingsValues> = {},
): SettingsValues {
  return {
    ...createDefaultSettingsValues(),
    ...overrides,
  }
}

describe('validateSettings', () => {
  it('官方默认配置通过全部校验', () => {
    expect(
      validateSettings(createDefaultSettingsValues()),
    ).toEqual([])
  })

  it('同时汇总单参数问题和参数关系问题', () => {
    const issues = validateSettings(
      createValues({
        ExpRate: 21,
        CoopPlayerMaxNum: 8,
        ServerPlayerMaxNum: 7,
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'ExpRate-outside-range',
        severity: 'warning',
      }),
    )

    expect(issues).toContainEqual(
      expect.objectContaining({
        id: 'coop-player-limit-exceeds-server-limit',
        severity: 'error',
      }),
    )
  })

  it('错误排在提醒之前', () => {
    const issues = validateSettings(
      createValues({
        ExpRate: 21,
        CoopPlayerMaxNum: 8,
        ServerPlayerMaxNum: 7,
      }),
    )

    expect(issues.map((issue) => issue.severity)).toEqual([
      'error',
      'warning',
    ])
  })

  it('相同严重级别按照 issue id 排序', () => {
    const issues = validateSettings(
      createValues({
        BaseCampMaxNumInGuild: 11,
        RCONPort: 70000,
      }),
    )

    const errorIds = issues
      .filter((issue) => issue.severity === 'error')
      .map((issue) => issue.id)

    expect(errorIds).toEqual(
      [...errorIds].sort((first, second) =>
        first.localeCompare(second),
      ),
    )
  })

  it('一个参数可以同时贡献多个不同问题', () => {
    const issues = validateSettings(
      createValues({
        CrossplayPlatforms: [
          'Steam',
          'Steam',
          'Switch',
        ],
      }),
    )

    const ids = issues.map((issue) => issue.id)

    expect(ids).toContain(
      'CrossplayPlatforms-unsupported-list-values',
    )
    expect(ids).toContain(
      'CrossplayPlatforms-duplicate-list-values',
    )
  })

  it('远程接口端口冲突作为 error 排在安全提醒之前', () => {
    const issues = validateSettings(
      createValues({
        RCONEnabled: true,
        RESTAPIEnabled: true,
        RCONPort: 8212,
        RESTAPIPort: 8212,
      }),
    )

    const conflictIndex = issues.findIndex(
      (issue) =>
        issue.id === 'remote-api-port-conflict',
    )
    const securityWarningIndex = issues.findIndex(
      (issue) => issue.id === 'remote-api-lan-only',
    )

    expect(conflictIndex).toBeGreaterThanOrEqual(0)
    expect(securityWarningIndex).toBeGreaterThanOrEqual(0)
    expect(conflictIndex).toBeLessThan(
      securityWarningIndex,
    )
  })
})
