import type { SettingsValues } from '../data/settings-schema'
import { validateFeatureRelations } from './validate-feature-relations'
import { validateSettingRelations } from './validate-relations'
import { validateSettingValues } from './validate-values'
import type {
  ValidationIssue,
  ValidationSeverity,
} from './validation-types'

const SEVERITY_ORDER: Record<ValidationSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
}

export function validateSettings(
  values: SettingsValues,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [
    ...validateSettingValues(values),
    ...validateSettingRelations(values),
    ...validateFeatureRelations(values),
  ]

  return issues.sort((first, second) => {
    const severityDifference =
      SEVERITY_ORDER[first.severity] -
      SEVERITY_ORDER[second.severity]

    if (severityDifference !== 0) {
      return severityDifference
    }

    return first.id.localeCompare(second.id)
  })
}
