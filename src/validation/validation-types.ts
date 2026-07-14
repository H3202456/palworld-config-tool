import type { SettingCategoryId } from '../data/categories'
import type { SettingKey } from '../data/settings-schema'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  message: string
  settingKey?: SettingKey
  category?: SettingCategoryId
}