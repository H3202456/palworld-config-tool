import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
  isSettingKey,
} from './settings-schema'
import { validateSettings } from '../validation/validate-settings'
import {
  applyConfigPreset,
  createPresetPreviewValues,
  getConfigPreset,
  getConfigPresetChanges,
  getConfigPresets,
} from './config-presets'

describe('config presets', () => {
  it('预设 ID 唯一', () => {
    const ids = getConfigPresets().map(
      (preset) => preset.id,
    )

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('所有预设覆盖项都是当前 Schema 支持的参数', () => {
    for (const preset of getConfigPresets()) {
      for (const key of Object.keys(preset.overrides)) {
        expect(isSettingKey(key)).toBe(true)
      }
    }
  })

  it('预设不修改服务器身份、密码和远程管理配置', () => {
    const protectedKeys = new Set([
      'ServerName',
      'ServerDescription',
      'ServerPassword',
      'AdminPassword',
      'PublicIP',
      'PublicPort',
      'RCONEnabled',
      'RCONPort',
      'RESTAPIEnabled',
      'RESTAPIPort',
    ])

    for (const preset of getConfigPresets()) {
      for (const key of Object.keys(preset.overrides)) {
        expect(protectedKeys.has(key)).toBe(false)
      }
    }
  })

  it('应用预设时保留未被覆盖的用户配置', () => {
    const current = createDefaultSettingsValues()

    current.ServerName = 'my private server'
    current.AdminPassword = 'keep-this-password'
    current.ServerPlayerMaxNum = 7

    const next = applyConfigPreset(
      current,
      getConfigPreset('fast-progression'),
    )

    expect(next.ServerName).toBe('my private server')
    expect(next.AdminPassword).toBe(
      'keep-this-password',
    )
    expect(next.ServerPlayerMaxNum).toBe(7)
    expect(next.ExpRate).toBe(10)
  })

  it('获取变化时只返回真正改变的参数', () => {
    const current = createDefaultSettingsValues()
    const preset = getConfigPreset('balanced-friends')
    const firstChanges = getConfigPresetChanges(
      current,
      preset,
    )

    const applied = applyConfigPreset(current, preset)
    const secondChanges = getConfigPresetChanges(
      applied,
      preset,
    )

    expect(firstChanges.length).toBeGreaterThan(0)
    expect(secondChanges).toEqual([])
  })

  it('重复应用同一个预设结果保持稳定', () => {
    const preset = getConfigPreset('casual-building')
    const first = applyConfigPreset(
      createDefaultSettingsValues(),
      preset,
    )
    const second = applyConfigPreset(first, preset)

    expect(second).toEqual(first)
  })

  it('性能优先预设确实降低关键负载参数', () => {
    const values = createPresetPreviewValues(
      getConfigPreset('performance-first'),
    )

    expect(values.PalSpawnNumRate).toBeLessThan(1)
    expect(values.DropItemMaxNum).toBeLessThan(3000)
    expect(values.BaseCampMaxNum).toBeLessThan(128)
    expect(
      values.ServerReplicatePawnCullDistance,
    ).toBeLessThan(15000)
  })

  it('所有预设基于官方默认值应用后都没有 error', () => {
    for (const preset of getConfigPresets()) {
      const values = createPresetPreviewValues(preset)
      const errors = validateSettings(values).filter(
        (issue) => issue.severity === 'error',
      )

      expect(
        errors,
        `${preset.label} 不应产生阻止导出的错误`,
      ).toEqual([])
    }
  })

  it('快速成长预设不擅自开启 PvP 或远程接口', () => {
    const values = createPresetPreviewValues(
      getConfigPreset('fast-progression'),
    )

    expect(values.bIsPvP).toBe(false)
    expect(values.RCONEnabled).toBe(false)
    expect(values.RESTAPIEnabled).toBe(false)
  })
})
