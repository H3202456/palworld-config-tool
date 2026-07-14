import type { SettingCategoryId } from './categories'

export type SettingControlType =
  | 'switch'
  | 'slider'
  | 'number'
  | 'segmented'
  | 'text'
  | 'password'
  | 'multi-select'
  | 'unlimited-number'

export type SettingValueType =
  | 'boolean'
  | 'number'
  | 'string'
  | 'enum'
  | 'string-array'

export type IniSerializationType =
  | 'boolean'
  | 'float'
  | 'integer'
  | 'quoted-string'
  | 'raw'
  | 'string-list'

export type NumericRangeKind = 'hard' | 'suggested'

export type SettingRuntimeValue = boolean | number | string | string[]

export interface SettingOption {
  label: string
  value: string
  description?: string
}

export interface SettingDependency {
  key: string
  operator: 'equals' | 'not-equals' | 'includes'
  value: boolean | number | string
  behavior: 'disable' | 'hide'
}

interface BaseSettingDefinition<
  TValue,
  TValueType extends SettingValueType,
  TControl extends SettingControlType,
  TSerialization extends IniSerializationType,
> {
  /**
   * PalWorldSettings.ini 中使用的原始英文参数名。
   */
  key: string

  /**
   * 展示给用户的中文名称。
   */
  label: string

  /**
   * 参数所在分类。
   */
  category: SettingCategoryId

  /**
   * 参数在分类中的显示顺序。
   */
  order: number

  /**
   * 参数在程序中的值类型。
   */
  valueType: TValueType

  /**
   * 页面应该使用的控件类型。
   */
  control: TControl

  /**
   * 参数初始默认值。
   */
  defaultValue: TValue

  /**
   * 导出 INI 时使用的序列化方式。
   */
  serialization: TSerialization

  /**
   * 面向普通用户的参数说明。
   */
  description: string

  /**
   * 可选的使用示例。
   */
  example?: string

  /**
   * 是否出现在简单模式中。
   */
  simpleMode: boolean

  /**
   * 可选的父级参数依赖。
   */
  dependsOn?: SettingDependency
}

export type BooleanSettingDefinition = BaseSettingDefinition<
  boolean,
  'boolean',
  'switch',
  'boolean'
>

export interface NumericSettingDefinition
  extends BaseSettingDefinition<
    number,
    'number',
    'slider' | 'number',
    'float' | 'integer'
  > {
  min: number
  max: number
  step: number
  unit?: string

  /**
   * 控件展示的小数位数。
   * 它不影响最终 INI 的六位小数格式。
   */
  precision?: number

  /**
   * hard 表示游戏明确限制。
   * suggested 表示编辑器推荐操作范围。
   */
  rangeKind: NumericRangeKind
}

export interface UnlimitedNumberSettingDefinition
  extends BaseSettingDefinition<
    number,
    'number',
    'unlimited-number',
    'float' | 'integer'
  > {
  min: number
  max: number
  step: number
  unit?: string
  precision?: number
  rangeKind: NumericRangeKind

  /**
   * 游戏用于表示无限制的原始数值。
   * 不同参数可能使用 0 或 -1。
   */
  unlimitedValue: number

  /**
   * 用户关闭“无限制”时使用的建议数值。
   */
  finiteDefaultValue: number

  unlimitedLabel: string
}

export interface EnumSettingDefinition
  extends BaseSettingDefinition<string, 'enum', 'segmented', 'raw'> {
  options: readonly SettingOption[]
}

export interface TextSettingDefinition
  extends BaseSettingDefinition<
    string,
    'string',
    'text' | 'password',
    'quoted-string'
  > {
  placeholder?: string
  maxLength?: number
}

export interface MultiSelectSettingDefinition
  extends BaseSettingDefinition<
    readonly string[],
    'string-array',
    'multi-select',
    'string-list'
  > {
  options: readonly SettingOption[]
  minSelections?: number
}

export type SettingDefinition =
  | BooleanSettingDefinition
  | NumericSettingDefinition
  | UnlimitedNumberSettingDefinition
  | EnumSettingDefinition
  | TextSettingDefinition
  | MultiSelectSettingDefinition