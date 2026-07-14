export interface OptionSettingEntry {
  key: string
  rawValue: string
}

export interface ParsedOptionSettings {
  entries: OptionSettingEntry[]
  warnings: string[]
}

export class OptionSettingsParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OptionSettingsParseError'
  }
}