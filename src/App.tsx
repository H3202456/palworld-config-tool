import { useEffect, useMemo, useState } from 'react'
import { ChangesPanel } from './components/ChangesPanel'
import {
  ConfigImport,
  type ConfigImportSummary,
} from './components/ConfigImport'
import { ConfigPreview } from './components/ConfigPreview'
import { DraftRecoveryDialog } from './components/DraftRecoveryDialog'
import { PresetPanel } from './components/PresetPanel'
import { SettingRow } from './components/SettingRow'
import { ValidationPanel } from './components/ValidationPanel'
import {
  SETTING_CATEGORIES,
  getSettingCategory,
  type SettingCategoryId,
} from './data/categories'
import {
  SETTINGS_SCHEMA,
  createDefaultSettingsValues,
  getSettingByKey,
  isSettingKey,
  type SettingKey,
  type SettingsValues,
} from './data/settings-schema'
import {
  applyConfigPreset,
  type ConfigPreset,
} from './data/config-presets'
import type {
  SettingDefinition,
  SettingDependency,
  SettingRuntimeValue,
} from './data/settings-types'
import { generatePalWorldSettingsIni } from './parser/generate-option-settings'
import type { OptionSettingEntry } from './parser/option-settings-types'
import { parseOptionSettings } from './parser/parse-option-settings'
import { parseSettingValue } from './parser/setting-value'
import { validateSettings } from './validation/validate-settings'
import type { ValidationIssue } from './validation/validation-types'
import {
  configDraftHasUserWork,
  loadConfigDraft,
  removeConfigDraft,
  saveConfigDraft,
} from './storage/config-draft'
import './styles/controls.css'
import './styles/config-tools.css'

const OFFICIAL_DEFAULT_VALUES = createDefaultSettingsValues()

function valuesAreEqual(
  first: SettingRuntimeValue,
  second: SettingRuntimeValue,
): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length &&
      first.every((item, index) => item === second[index])
    )
  }

  return first === second
}

function cloneRuntimeValue(
  value: SettingRuntimeValue,
): SettingRuntimeValue {
  return Array.isArray(value) ? [...value] : value
}

function getSettingDependency(
  setting: SettingDefinition,
): SettingDependency | undefined {
  return setting.dependsOn
}

function settingDependencyIsMet(
  dependency: SettingDependency | undefined,
  values: SettingsValues,
): boolean {
  if (!dependency) {
    return true
  }

  if (!isSettingKey(dependency.key)) {
    return false
  }

  const actualValue = values[dependency.key]

  switch (dependency.operator) {
    case 'equals':
      return actualValue === dependency.value

    case 'not-equals':
      return actualValue !== dependency.value

    case 'includes':
      return (
        Array.isArray(actualValue) &&
        typeof dependency.value === 'string' &&
        actualValue.includes(dependency.value)
      )

    default:
      return false
  }
}

function cloneSettingsValues(
  values: SettingsValues,
): SettingsValues {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      cloneRuntimeValue(value),
    ]),
  ) as SettingsValues
}

function App() {
  const [initialDraftResult] = useState(() =>
    loadConfigDraft(window.localStorage),
  )

  const recoverableDraft =
    initialDraftResult.status === 'loaded' &&
    configDraftHasUserWork(initialDraftResult.draft)
      ? initialDraftResult.draft
      : undefined

  const initialDraftWarnings =
    initialDraftResult.status === 'loaded'
      ? initialDraftResult.warnings
      : []

  const [draftRecoveryResolved, setDraftRecoveryResolved] =
    useState(recoverableDraft === undefined)

  const [draftSavedAt, setDraftSavedAt] = useState<
    string | null
  >(recoverableDraft?.savedAt ?? null)

  const [values, setValues] = useState(createDefaultSettingsValues)

  const [baselineValues, setBaselineValues] = useState(
    createDefaultSettingsValues,
  )

  const [sourceEntries, setSourceEntries] = useState<
    OptionSettingEntry[]
  >([])

  const [hasImportedConfiguration, setHasImportedConfiguration] =
    useState(false)

  const [activeCategory, setActiveCategory] =
    useState<SettingCategoryId>('basic')

  const [simpleMode, setSimpleMode] = useState(true)
  const [importOpen, setImportOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [changesOpen, setChangesOpen] = useState(false)
  const [presetOpen, setPresetOpen] = useState(false)

  const draftHasUserWork =
    configDraftHasUserWork({
      values,
      baselineValues,
      sourceEntries,
    })

  useEffect(() => {
    if (initialDraftResult.status === 'invalid') {
      removeConfigDraft(window.localStorage)
    }
  }, [initialDraftResult])

  useEffect(() => {
    if (!draftRecoveryResolved) {
      return
    }

    if (!draftHasUserWork) {
      removeConfigDraft(window.localStorage)
      return
    }

    const saveTimer = window.setTimeout(() => {
      const savedDraft = saveConfigDraft(
        window.localStorage,
        {
          values,
          baselineValues,
          sourceEntries,
        },
      )

      setDraftSavedAt(savedDraft.savedAt)
    }, 800)

    return () => window.clearTimeout(saveTimer)
  }, [
    baselineValues,
    draftHasUserWork,
    draftRecoveryResolved,
    sourceEntries,
    values,
  ])

  const categoryDefinition = getSettingCategory(activeCategory)

  const visibleSettings = SETTINGS_SCHEMA.filter((setting) => {
    const belongsToCategory = setting.category === activeCategory
    const visibleInMode = !simpleMode || setting.simpleMode

    const dependency = getSettingDependency(setting)

    const dependencyMet = settingDependencyIsMet(
      dependency,
      values,
    )

    const hiddenByDependency =
      dependency?.behavior === 'hide' && !dependencyMet

    return (
      belongsToCategory &&
      visibleInMode &&
      !hiddenByDependency
    )
  })

  const modifiedCount = SETTINGS_SCHEMA.filter((setting) => {
    return !valuesAreEqual(
      values[setting.key],
      baselineValues[setting.key],
    )
  }).length

  const officialDifferenceCount = SETTINGS_SCHEMA.filter(
    (setting) => {
      return !valuesAreEqual(
        values[setting.key],
        OFFICIAL_DEFAULT_VALUES[setting.key],
      )
    },
  ).length

  const unknownEntryCount = sourceEntries.filter(
    (entry) => !isSettingKey(entry.key),
  ).length

  const generatedIni = useMemo(
    () => generatePalWorldSettingsIni(values, sourceEntries),
    [values, sourceEntries],
  )

  const validationIssues = useMemo(
    () => validateSettings(values),
    [values],
  )

  const errorCount = validationIssues.filter(
    (issue) => issue.severity === 'error',
  ).length

  const warningCount = validationIssues.filter(
    (issue) => issue.severity === 'warning',
  ).length

  const updateSetting = (
    key: SettingKey,
    nextValue: SettingRuntimeValue,
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: cloneRuntimeValue(nextValue),
    }))
  }

  const resetSetting = (key: SettingKey) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: cloneRuntimeValue(
        OFFICIAL_DEFAULT_VALUES[key],
      ),
    }))
  }

  const resetAllSettings = () => {
    setValues(createDefaultSettingsValues())
  }

  const resetSettingToBaseline = (key: SettingKey) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: cloneRuntimeValue(baselineValues[key]),
    }))
  }

  const resetAllToBaseline = () => {
    setValues(cloneSettingsValues(baselineValues))
    setChangesOpen(false)
  }

  const importConfiguration = (
    source: string,
  ): ConfigImportSummary => {
    const parsed = parseOptionSettings(source)
    const nextValues = createDefaultSettingsValues()
    const warnings = [...parsed.warnings]

    const successfullyLoadedKeys = new Set<string>()
    const unknownKeys = new Set<string>()

    for (const entry of parsed.entries) {
      if (!isSettingKey(entry.key)) {
        unknownKeys.add(entry.key)
        continue
      }

      const setting = getSettingByKey(entry.key)

      if (!setting) {
        unknownKeys.add(entry.key)
        continue
      }

      try {
        const parsedValue = parseSettingValue(
          setting,
          entry.rawValue,
        )

        nextValues[entry.key] = cloneRuntimeValue(parsedValue)
        successfullyLoadedKeys.add(entry.key)
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : '未知值格式错误'

        warnings.push(
          `${entry.key} 未能载入，将暂时使用官方默认值。原因：${message}`,
        )
      }
    }

    const importedBaseline = cloneSettingsValues(nextValues)

    setValues(cloneSettingsValues(nextValues))
    setBaselineValues(importedBaseline)
    setSourceEntries(parsed.entries)
    setHasImportedConfiguration(true)
    setChangesOpen(false)

    return {
      supportedCount: successfullyLoadedKeys.size,
      unknownCount: unknownKeys.size,
      warnings,
    }
  }

  const focusSetting = (key: string) => {
    if (!isSettingKey(key)) {
      return
    }

    const setting = getSettingByKey(key)

    if (!setting) {
      return
    }

    setActiveCategory(setting.category)

    if (!setting.simpleMode) {
      setSimpleMode(false)
    }

    setChangesOpen(false)

    window.setTimeout(() => {
      const target = document.getElementById(
        `setting-row-${key}`,
      )

      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }

  const handleSelectIssue = (issue: ValidationIssue) => {
    if (issue.settingKey) {
      focusSetting(issue.settingKey)
    }
  }

  const restoreDraft = () => {
    if (!recoverableDraft) {
      return
    }

    setValues(cloneSettingsValues(recoverableDraft.values))
    setBaselineValues(
      cloneSettingsValues(
        recoverableDraft.baselineValues,
      ),
    )
    setSourceEntries(
      recoverableDraft.sourceEntries.map(
        (entry) => ({ ...entry }),
      ),
    )
    setHasImportedConfiguration(
      recoverableDraft.sourceEntries.length > 0,
    )
    setDraftSavedAt(recoverableDraft.savedAt)
    setDraftRecoveryResolved(true)
  }

  const discardDraft = () => {
    removeConfigDraft(window.localStorage)
    setDraftSavedAt(null)
    setDraftRecoveryResolved(true)
  }

  const openPresetPanel = () => {
    setImportOpen(false)
    setPreviewOpen(false)
    setChangesOpen(false)
    setPresetOpen(true)
  }

  const handleApplyPreset = (preset: ConfigPreset) => {
    setValues((currentValues) =>
      applyConfigPreset(currentValues, preset),
    )
    setPresetOpen(false)
    setChangesOpen(true)
  }

  const downloadConfiguration = () => {
    if (errorCount > 0) {
      return
    }

    const blob = new Blob([generatedIni], {
      type: 'text/plain;charset=utf-8',
    })

    const downloadUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = downloadUrl
    anchor.download = 'PalWorldSettings.ini'

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()

    URL.revokeObjectURL(downloadUrl)
  }

  const footerStatus =
    errorCount > 0
      ? `发现 ${errorCount} 个错误，修复后才能下载`
      : warningCount > 0
        ? `发现 ${warningCount} 个提醒，可以继续导出`
        : '配置检查通过'

  const baselineLabel = hasImportedConfiguration
    ? '最近导入值'
    : '官方默认值'

  const draftStatusText = !draftRecoveryResolved
    ? '等待处理上次草稿'
    : !draftHasUserWork
      ? '当前没有需要保存的草稿'
      : draftSavedAt
        ? '草稿已自动保存（密码除外）'
        : '草稿等待自动保存'

  const draftStatusPending =
    !draftRecoveryResolved ||
    (draftHasUserWork && draftSavedAt === null)

  return (
    <main className="app-shell">
      {!draftRecoveryResolved &&
        recoverableDraft && (
          <DraftRecoveryDialog
            draft={recoverableDraft}
            warnings={initialDraftWarnings}
            onRestore={restoreDraft}
            onDiscard={discardDraft}
          />
        )}

      <header className="app-header">
        <div>
          <p className="app-eyebrow">PALWORLD SERVER TOOL</p>

          <h1>Palworld 中文配置助手</h1>

          <p className="app-description">
            导入、修改、检查并导出 PalWorldSettings.ini。
            所有配置都只在浏览器本地处理。
          </p>
        </div>

        <div className="header-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={openPresetPanel}
          >
            体验预设
          </button>

          <button
            className="button button-secondary"
            type="button"
            onClick={() => setImportOpen((current) => !current)}
          >
            导入配置
          </button>

          <button
            className="button button-secondary"
            type="button"
            disabled={officialDifferenceCount === 0}
            onClick={resetAllSettings}
          >
            使用官方默认
          </button>

          <button
            className="button button-primary"
            type="button"
            disabled={errorCount > 0}
            title={
              errorCount > 0
                ? '请先修复配置错误'
                : '下载当前配置'
            }
            onClick={downloadConfiguration}
          >
            导出配置
          </button>
        </div>
      </header>

      {presetOpen && (
        <PresetPanel
          values={values}
          onClose={() => setPresetOpen(false)}
          onApplyPreset={handleApplyPreset}
        />
      )}

      {importOpen && (
        <ConfigImport
          onImport={importConfiguration}
          onClose={() => setImportOpen(false)}
        />
      )}

      <section className="workspace">
        <aside className="sidebar">
          <p className="section-label">设置分类</p>

          <nav className="category-list" aria-label="设置分类">
            {SETTING_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`category-item ${
                  activeCategory === category.id
                    ? 'category-item-active'
                    : ''
                }`}
                type="button"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="editor-panel">
          <div className="panel-heading">
            <div>
              <p className="section-label">配置编辑器</p>

              <h2>{categoryDefinition?.label}</h2>

              {categoryDefinition && (
                <p className="category-description">
                  {categoryDefinition.description}
                </p>
              )}
            </div>

            <div className="mode-switch" aria-label="编辑模式">
              <button
                className={`mode-button ${
                  simpleMode ? 'mode-button-active' : ''
                }`}
                type="button"
                aria-pressed={simpleMode}
                onClick={() => setSimpleMode(true)}
              >
                简单模式
              </button>

              <button
                className={`mode-button ${
                  !simpleMode ? 'mode-button-active' : ''
                }`}
                type="button"
                aria-pressed={!simpleMode}
                onClick={() => setSimpleMode(false)}
              >
                专业模式
              </button>
            </div>
          </div>

          {visibleSettings.length > 0 ? (
            <div className="settings-list">
              {visibleSettings.map((setting) => {
                const currentValue = values[setting.key]

                const defaultValue =
                  OFFICIAL_DEFAULT_VALUES[setting.key]

                const modified = !valuesAreEqual(
                  currentValue,
                  baselineValues[setting.key],
                )

                const dependency = getSettingDependency(setting)

                const dependencyMet = settingDependencyIsMet(
                  dependency,
                  values,
                )

                const disabled =
                  dependency?.behavior === 'disable' &&
                  !dependencyMet

                const parentSetting = dependency
                  ? getSettingByKey(dependency.key)
                  : undefined

                const disabledReason = disabled
                  ? `需要先开启「${
                      parentSetting?.label ?? dependency?.key
                    }」。`
                  : undefined

                const settingIssues = validationIssues.filter(
                  (issue) => issue.settingKey === setting.key,
                )

                return (
                  <SettingRow
                    key={setting.key}
                    setting={setting}
                    value={currentValue}
                    defaultValue={defaultValue}
                    modified={modified}
                    disabled={disabled}
                    disabledReason={disabledReason}
                    issues={settingIssues}
                    onChange={(
                      nextValue: SettingRuntimeValue,
                    ) =>
                      updateSetting(setting.key, nextValue)
                    }
                    onReset={() => resetSetting(setting.key)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="no-settings-card">
              <div>
                <strong>这个分类暂时没有录入参数</strong>
                <p>后续会继续补充完整参数表。</p>
              </div>
            </div>
          )}
        </section>

        <ValidationPanel
          issues={validationIssues}
          modifiedCount={modifiedCount}
          sourceEntryCount={sourceEntries.length}
          unknownEntryCount={unknownEntryCount}
          onSelectIssue={handleSelectIssue}
        />
      </section>

      <footer className="bottom-bar">
        <div>
          <strong>已修改 {modifiedCount} 项</strong>
          <span>{footerStatus}</span>
          <span
            className={[
              'draft-save-status',
              draftStatusPending
                ? 'draft-save-status-pending'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {draftStatusText}
          </span>
        </div>

        <div className="bottom-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={modifiedCount === 0}
            onClick={() => setChangesOpen(true)}
          >
            查看修改
          </button>

          <button
            className="button button-secondary"
            type="button"
            onClick={() => setPreviewOpen(true)}
          >
            查看代码
          </button>

          <button
            className="button button-primary"
            type="button"
            disabled={errorCount > 0}
            title={
              errorCount > 0
                ? '请先修复配置错误'
                : '下载当前配置'
            }
            onClick={downloadConfiguration}
          >
            下载 PalWorldSettings.ini
          </button>
        </div>
      </footer>

      {changesOpen && (
        <ChangesPanel
          values={values}
          baselineValues={baselineValues}
          officialDefaultValues={OFFICIAL_DEFAULT_VALUES}
          baselineLabel={baselineLabel}
          onClose={() => setChangesOpen(false)}
          onResetSetting={resetSettingToBaseline}
          onResetAll={resetAllToBaseline}
          onSelectSetting={focusSetting}
        />
      )}

      {previewOpen && (
        <ConfigPreview
          content={generatedIni}
          onClose={() => setPreviewOpen(false)}
          onDownload={downloadConfiguration}
        />
      )}
    </main>
  )
}

export default App
