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

describe('validateFeatureRelations: server performance', () => {
  it('官方默认值不产生新增性能提醒', () => {
    const ids = getIds(createDefaultSettingsValues())

    expect(ids).not.toContain(
      'base-camp-total-lower-than-guild-limit',
    )
    expect(ids).not.toContain(
      'server-pal-sync-load-high',
    )
    expect(ids).not.toContain(
      'item-container-sync-too-frequent',
    )
  })

  it('服务器据点总上限低于单公会上限时产生提醒', () => {
    const ids = getIds(
      createValues({
        BaseCampMaxNum: 3,
        BaseCampMaxNumInGuild: 4,
      }),
    )

    expect(ids).toContain(
      'base-camp-total-lower-than-guild-limit',
    )
  })

  it('服务器据点总上限等于单公会上限时不误报', () => {
    const ids = getIds(
      createValues({
        BaseCampMaxNum: 4,
        BaseCampMaxNumInGuild: 4,
      }),
    )

    expect(ids).not.toContain(
      'base-camp-total-lower-than-guild-limit',
    )
  })

  it('最大同步距离配合高工作帕鲁上限时产生提醒', () => {
    const ids = getIds(
      createValues({
        ServerReplicatePawnCullDistance: 15000,
        BaseCampWorkerMaxNum: 50,
      }),
    )

    expect(ids).toContain('server-pal-sync-load-high')
  })

  it('最大同步距离配合高帕鲁出现倍率时产生提醒', () => {
    const ids = getIds(
      createValues({
        ServerReplicatePawnCullDistance: 15000,
        PalSpawnNumRate: 2,
      }),
    )

    expect(ids).toContain('server-pal-sync-load-high')
  })

  it('只有最大同步距离时不产生组合负载提醒', () => {
    const ids = getIds(
      createValues({
        ServerReplicatePawnCullDistance: 15000,
        BaseCampWorkerMaxNum: 15,
        PalSpawnNumRate: 1,
      }),
    )

    expect(ids).not.toContain(
      'server-pal-sync-load-high',
    )
  })

  it('容器同步间隔低于 0.5 秒时产生提醒', () => {
    const ids = getIds(
      createValues({
        ItemContainerForceMarkDirtyInterval: 0.25,
      }),
    )

    expect(ids).toContain(
      'item-container-sync-too-frequent',
    )
  })

  it('容器同步间隔为默认 1 秒时不产生提醒', () => {
    const ids = getIds(
      createValues({
        ItemContainerForceMarkDirtyInterval: 1,
      }),
    )

    expect(ids).not.toContain(
      'item-container-sync-too-frequent',
    )
  })
})
