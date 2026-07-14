import { describe, expect, it } from 'vitest'
import {
  getConfigPreset,
  getConfigPresets,
  type ConfigPreset,
} from './config-presets'
import {
  createDefaultSettingsValues,
  type SettingsValues,
} from './settings-schema'
import { analyzeConfigPreset } from './preset-validation'

function createValues(
  overrides: Partial<SettingsValues> = {},
): SettingsValues {
  return {
    ...createDefaultSettingsValues(),
    ...overrides,
  }
}

describe('analyzeConfigPreset', () => {
  it('所有正式预设基于官方默认值都不会新增 error', () => {
    const values = createDefaultSettingsValues()

    for (const preset of getConfigPresets()) {
      const analysis = analyzeConfigPreset(
        values,
        preset,
      )

      expect(
        analysis.introducedErrorCount,
        `${preset.label} 不应新增错误`,
      ).toBe(0)
      expect(analysis.canApply).toBe(true)
    }
  })

  it('分析预设时不会修改当前配置对象', () => {
    const values = createValues({
      ServerName: 'keep-current-values',
    })

    const snapshot = structuredClone(values)

    analyzeConfigPreset(
      values,
      getConfigPreset('fast-progression'),
    )

    expect(values).toEqual(snapshot)
  })

  it('已经存在且应用后仍存在的错误不算预设新增错误', () => {
    const values = createValues({
      CoopPlayerMaxNum: 8,
      ServerPlayerMaxNum: 7,
    })

    const analysis = analyzeConfigPreset(
      values,
      getConfigPreset('balanced-friends'),
    )

    expect(analysis.introducedErrorCount).toBe(0)
    expect(analysis.remainingErrorCount).toBe(1)
    expect(
      analysis.remainingIssues.map((issue) => issue.id),
    ).toContain(
      'coop-player-limit-exceeds-server-limit',
    )
    expect(analysis.canApply).toBe(true)
  })

  it('性能优先预设能够解决已有的高负载提醒', () => {
    const values = createValues({
      BaseCampWorkerMaxNum: 50,
      ServerReplicatePawnCullDistance: 15000,
    })

    const analysis = analyzeConfigPreset(
      values,
      getConfigPreset('performance-first'),
    )

    expect(
      analysis.resolvedIssues.map((issue) => issue.id),
    ).toEqual(
      expect.arrayContaining([
        'base-camp-worker-count-high',
        'server-pal-sync-load-high',
      ]),
    )
  })

  it('会新增关系错误的自定义预设禁止应用', () => {
    const values = createValues({
      CoopPlayerMaxNum: 4,
      ServerPlayerMaxNum: 4,
    })

    const unsafePreset: ConfigPreset = {
      id: 'balanced-friends',
      label: '测试错误预设',
      description: '仅用于测试。',
      recommendedFor: '自动化测试',
      risk: 'medium',
      overrides: {
        CoopPlayerMaxNum: 8,
      },
    }

    const analysis = analyzeConfigPreset(
      values,
      unsafePreset,
    )

    expect(analysis.introducedErrorCount).toBe(1)
    expect(
      analysis.introducedIssues.map(
        (issue) => issue.id,
      ),
    ).toContain(
      'coop-player-limit-exceeds-server-limit',
    )
    expect(analysis.canApply).toBe(false)
  })

  it('变化列表与预设应用后的值保持一致', () => {
    const analysis = analyzeConfigPreset(
      createDefaultSettingsValues(),
      getConfigPreset('casual-building'),
    )

    for (const change of analysis.changes) {
      expect(analysis.nextValues[change.key]).toEqual(
        change.after,
      )
    }
  })
})