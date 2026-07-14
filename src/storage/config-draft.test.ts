import { describe, expect, it } from 'vitest'
import {
  createDefaultSettingsValues,
} from '../data/settings-schema'
import {
  CONFIG_DRAFT_STORAGE_KEY,
  CONFIG_DRAFT_VERSION,
  LEGACY_CONFIG_DRAFT_STORAGE_KEY,
  configDraftHasUserWork,
  createConfigDraft,
  loadConfigDraft,
  parseConfigDraft,
  removeConfigDraft,
  saveConfigDraft,
  serializeConfigDraft,
  type DraftStorage,
} from './config-draft'

class MemoryStorage implements DraftStorage {
  private readonly data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }
}

function createSnapshot() {
  const values = createDefaultSettingsValues()
  const baselineValues =
    createDefaultSettingsValues()

  values.ExpRate = 5
  values.ServerName = 'draft server'
  values.CrossplayPlatforms = ['Steam']
  values.ServerPassword = 'join-secret'
  values.AdminPassword = 'admin-secret'

  baselineValues.ServerPassword = 'old-secret'
  baselineValues.AdminPassword = 'old-admin'

  return {
    values,
    baselineValues,
    sourceEntries: [
      {
        key: 'ServerPassword',
        rawValue: '"join-secret"',
      },
      {
        key: 'AdminPassword',
        rawValue: '"admin-secret"',
      },
      {
        key: 'FutureSetting',
        rawValue: '(Mode="A,B")',
      },
    ],
    importSourceLabel: 'PalWorldSettings.ini',
  }
}

describe('config draft v2', () => {
  it('创建草稿时复制数组和原始参数，避免后续突变', () => {
    const snapshot = createSnapshot()

    const draft = createConfigDraft(
      snapshot,
      new Date('2026-07-15T12:00:00.000Z'),
    )

    const crossplayPlatforms =
      snapshot.values.CrossplayPlatforms

    if (!Array.isArray(crossplayPlatforms)) {
      throw new Error(
        'CrossplayPlatforms 应该是字符串数组',
      )
    }

    crossplayPlatforms.push('PS5')
    snapshot.sourceEntries[2].rawValue = 'changed'

    expect(draft.savedAt).toBe(
      '2026-07-15T12:00:00.000Z',
    )
    expect(draft.values.CrossplayPlatforms).toEqual([
      'Steam',
    ])
    expect(draft.sourceEntries[2].rawValue).toBe(
      '(Mode="A,B")',
    )
  })

  it('密码不会写入草稿当前值、基准或原始参数', () => {
    const draft = createConfigDraft(createSnapshot())
    const serialized = serializeConfigDraft(draft)

    expect(draft.values.ServerPassword).toBe('')
    expect(draft.values.AdminPassword).toBe('')
    expect(draft.baselineValues.ServerPassword).toBe('')
    expect(draft.baselineValues.AdminPassword).toBe('')
    expect(draft.sourceEntries[0].rawValue).toBe('""')
    expect(draft.sourceEntries[1].rawValue).toBe('""')
    expect(draft.omittedSensitiveKeys).toEqual(
      expect.arrayContaining([
        'ServerPassword',
        'AdminPassword',
      ]),
    )
    expect(serialized).not.toContain('join-secret')
    expect(serialized).not.toContain('admin-secret')
    expect(serialized).not.toContain('old-secret')
    expect(serialized).not.toContain('old-admin')
  })

  it('序列化后恢复当前值、基准和未知参数，并提醒重新输入密码', () => {
    const draft = createConfigDraft(createSnapshot())
    const result = parseConfigDraft(
      serializeConfigDraft(draft),
    )

    expect(result.status).toBe('loaded')

    if (result.status !== 'loaded') {
      throw new Error('草稿恢复失败')
    }

    expect(result.draft.values.ExpRate).toBe(5)
    expect(result.draft.values.ServerName).toBe(
      'draft server',
    )
    expect(result.draft.baselineValues.ExpRate).toBe(1)
    expect(result.draft.values.ServerPassword).toBe('')
    expect(result.draft.values.AdminPassword).toBe('')
    expect(result.draft.sourceEntries[2]).toEqual({
      key: 'FutureSetting',
      rawValue: '(Mode="A,B")',
    })
    expect(result.warnings).toContain(
      '出于安全考虑，服务器密码和管理员密码没有保存在草稿中，恢复后需要重新输入。',
    )
  })

  it('保存、读取和删除草稿使用 v2 storage key', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      LEGACY_CONFIG_DRAFT_STORAGE_KEY,
      'legacy-secret',
    )

    saveConfigDraft(
      storage,
      createSnapshot(),
      new Date('2026-07-15T12:00:00.000Z'),
    )

    expect(
      storage.getItem(CONFIG_DRAFT_STORAGE_KEY),
    ).not.toBeNull()
    expect(
      storage.getItem(
        LEGACY_CONFIG_DRAFT_STORAGE_KEY,
      ),
    ).toBeNull()

    expect(loadConfigDraft(storage).status).toBe(
      'loaded',
    )

    removeConfigDraft(storage)

    expect(loadConfigDraft(storage)).toEqual({
      status: 'empty',
    })
  })

  it('发现只有旧 v1 草稿时主动清理', () => {
    const storage = new MemoryStorage()

    storage.setItem(
      LEGACY_CONFIG_DRAFT_STORAGE_KEY,
      '{"password":"unsafe"}',
    )

    expect(loadConfigDraft(storage)).toEqual({
      status: 'empty',
    })
    expect(
      storage.getItem(
        LEGACY_CONFIG_DRAFT_STORAGE_KEY,
      ),
    ).toBeNull()
  })

  it('无效 JSON 返回 invalid，而不是让应用崩溃', () => {
    expect(parseConfigDraft('{broken')).toEqual({
      status: 'invalid',
      reason: '本地草稿不是有效 JSON。',
    })
  })

  it('拒绝未知草稿版本', () => {
    const result = parseConfigDraft(
      JSON.stringify({
        version: CONFIG_DRAFT_VERSION + 1,
        savedAt: new Date().toISOString(),
      }),
    )

    expect(result.status).toBe('invalid')
  })

  it('无效参数值恢复默认并提供 warning', () => {
    const draft = createConfigDraft(createSnapshot())
    const raw = JSON.parse(
      serializeConfigDraft(draft),
    ) as Record<string, unknown>

    raw.values = {
      ExpRate: 'not-a-number',
      UnknownFutureKey: 123,
      ServerName: 'valid name',
    }

    const result = parseConfigDraft(
      JSON.stringify(raw),
    )

    expect(result.status).toBe('loaded')

    if (result.status !== 'loaded') {
      throw new Error('草稿恢复失败')
    }

    expect(result.draft.values.ExpRate).toBe(1)
    expect(result.draft.values.ServerName).toBe(
      'valid name',
    )
    expect(result.warnings.length).toBeGreaterThanOrEqual(
      2,
    )
  })

  it('无效原始参数项会被忽略', () => {
    const draft = createConfigDraft(createSnapshot())
    const raw = JSON.parse(
      serializeConfigDraft(draft),
    ) as Record<string, unknown>

    raw.sourceEntries = [
      {
        key: 'ValidUnknown',
        rawValue: '123',
      },
      {
        key: 100,
        rawValue: false,
      },
      null,
    ]

    const result = parseConfigDraft(
      JSON.stringify(raw),
    )

    expect(result.status).toBe('loaded')

    if (result.status !== 'loaded') {
      throw new Error('草稿恢复失败')
    }

    expect(result.draft.sourceEntries).toEqual([
      {
        key: 'ValidUnknown',
        rawValue: '123',
      },
    ])
    expect(result.warnings.length).toBeGreaterThanOrEqual(
      2,
    )
  })

  it('官方默认且未导入配置时不算用户工作', () => {
    const defaults = createDefaultSettingsValues()

    expect(
      configDraftHasUserWork({
        values: defaults,
        baselineValues: createDefaultSettingsValues(),
        sourceEntries: [],
      }),
    ).toBe(false)
  })

  it('修改任一参数或导入未知参数后算用户工作', () => {
    const modified = createDefaultSettingsValues()
    modified.ExpRate = 2

    expect(
      configDraftHasUserWork({
        values: modified,
        baselineValues: createDefaultSettingsValues(),
        sourceEntries: [],
      }),
    ).toBe(true)

    expect(
      configDraftHasUserWork({
        values: createDefaultSettingsValues(),
        baselineValues: createDefaultSettingsValues(),
        sourceEntries: [
          {
            key: 'UnknownSetting',
            rawValue: 'True',
          },
        ],
      }),
    ).toBe(true)
  })
})
