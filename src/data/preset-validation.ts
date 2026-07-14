import type { ValidationIssue } from '../validation/validation-types'
import { validateSettings } from '../validation/validate-settings'
import {
  applyConfigPreset,
  getConfigPresetChanges,
  type ConfigPreset,
  type ConfigPresetChange,
} from './config-presets'
import type { SettingsValues } from './settings-schema'

export interface PresetValidationAnalysis {
  changes: ConfigPresetChange[]
  nextValues: SettingsValues
  currentIssues: ValidationIssue[]
  nextIssues: ValidationIssue[]
  introducedIssues: ValidationIssue[]
  resolvedIssues: ValidationIssue[]
  remainingIssues: ValidationIssue[]
  introducedErrorCount: number
  introducedWarningCount: number
  remainingErrorCount: number
  canApply: boolean
}

export function analyzeConfigPreset(
  values: SettingsValues,
  preset: ConfigPreset,
): PresetValidationAnalysis {
  const changes = getConfigPresetChanges(values, preset)
  const nextValues = applyConfigPreset(values, preset)

  const currentIssues = validateSettings(values)
  const nextIssues = validateSettings(nextValues)

  const currentIssueIds = new Set(
    currentIssues.map((issue) => issue.id),
  )

  const nextIssueIds = new Set(
    nextIssues.map((issue) => issue.id),
  )

  const introducedIssues = nextIssues.filter(
    (issue) => !currentIssueIds.has(issue.id),
  )

  const resolvedIssues = currentIssues.filter(
    (issue) => !nextIssueIds.has(issue.id),
  )

  const remainingIssues = nextIssues.filter(
    (issue) => currentIssueIds.has(issue.id),
  )

  const introducedErrorCount = introducedIssues.filter(
    (issue) => issue.severity === 'error',
  ).length

  const introducedWarningCount = introducedIssues.filter(
    (issue) => issue.severity === 'warning',
  ).length

  const remainingErrorCount = remainingIssues.filter(
    (issue) => issue.severity === 'error',
  ).length

  return {
    changes,
    nextValues,
    currentIssues,
    nextIssues,
    introducedIssues,
    resolvedIssues,
    remainingIssues,
    introducedErrorCount,
    introducedWarningCount,
    remainingErrorCount,
    canApply: introducedErrorCount === 0,
  }
}