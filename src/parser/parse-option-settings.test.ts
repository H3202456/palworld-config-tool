import { describe, expect, it } from 'vitest'
import { OptionSettingsParseError } from './option-settings-types'
import {
  parseOptionSettings,
  splitTopLevelValues,
} from './parse-option-settings'

function entriesToRecord(
  entries: readonly { key: string; rawValue: string }[],
): Record<string, string> {
  return Object.fromEntries(
    entries.map((entry) => [entry.key, entry.rawValue]),
  )
}

describe('splitTopLevelValues', () => {
  it('只在最外层逗号处分割，保留括号和引号内的逗号', () => {
    const source = [
      'ExpRate=20.000000',
      'CrossplayPlatforms=(Steam,Xbox)',
      'ServerName="Alpha, Beta"',
      'Custom=(Inner=(A,B),Text="x,y")',
    ].join(',')

    expect(splitTopLevelValues(source)).toEqual([
      'ExpRate=20.000000',
      'CrossplayPlatforms=(Steam,Xbox)',
      'ServerName="Alpha, Beta"',
      'Custom=(Inner=(A,B),Text="x,y")',
    ])
  })

  it('不会把转义引号后的逗号误判为参数分隔符', () => {
    const source =
      'ServerDescription="A \\"quoted\\", value",ExpRate=2.000000'

    expect(splitTopLevelValues(source)).toEqual([
      'ServerDescription="A \\"quoted\\", value"',
      'ExpRate=2.000000',
    ])
  })
})

describe('parseOptionSettings', () => {
  it('可以从完整 PalWorldSettings.ini 中提取配置项', () => {
    const source = `; sample configuration
[/Script/Pal.PalGameWorldSettings]
OptionSettings=(ExpRate=20.000000,ServerName="Alpha, Beta",CrossplayPlatforms=(Steam,Xbox),bEnableVoiceChat=True)
`

    const parsed = parseOptionSettings(source)
    const values = entriesToRecord(parsed.entries)

    expect(parsed.entries.map((entry) => entry.key)).toEqual([
      'ExpRate',
      'ServerName',
      'CrossplayPlatforms',
      'bEnableVoiceChat',
    ])

    expect(values.ExpRate).toBe('20.000000')
    expect(values.ServerName).toBe('"Alpha, Beta"')
    expect(values.CrossplayPlatforms).toBe('(Steam,Xbox)')
    expect(values.bEnableVoiceChat).toBe('True')
  })

  it('可以解析用户直接粘贴的 OptionSettings 代码', () => {
    const parsed = parseOptionSettings(
      'OptionSettings=(ExpRate=2.000000,DeathPenalty=None)',
    )

    expect(parsed.entries).toEqual([
      {
        key: 'ExpRate',
        rawValue: '2.000000',
      },
      {
        key: 'DeathPenalty',
        rawValue: 'None',
      },
    ])
  })

  it('保留未知参数和嵌套原始值，不擅自改写内容', () => {
    const parsed = parseOptionSettings(
      'OptionSettings=(KnownValue=1,FutureSetting=(Mode=Custom,Platforms=(Steam,Xbox)),AnotherUnknown="A,B")',
    )

    expect(parsed.entries).toEqual([
      {
        key: 'KnownValue',
        rawValue: '1',
      },
      {
        key: 'FutureSetting',
        rawValue: '(Mode=Custom,Platforms=(Steam,Xbox))',
      },
      {
        key: 'AnotherUnknown',
        rawValue: '"A,B"',
      },
    ])
  })

  it('值中包含等号、网址参数和转义引号时仍保持完整', () => {
    const parsed = parseOptionSettings(
      'OptionSettings=(ServerDescription="token=a,b and \\"quoted\\"",BanListURL="https://example.com/list?x=1&y=2")',
    )

    expect(parsed.entries).toEqual([
      {
        key: 'ServerDescription',
        rawValue: '"token=a,b and \\"quoted\\""',
      },
      {
        key: 'BanListURL',
        rawValue: '"https://example.com/list?x=1&y=2"',
      },
    ])
  })

  it('找不到 OptionSettings 时抛出明确的解析错误', () => {
    expect(() =>
      parseOptionSettings(
        '[/Script/Pal.PalGameWorldSettings]\nExpRate=1.000000',
      ),
    ).toThrow(OptionSettingsParseError)
  })

  it('括号没有闭合时拒绝返回残缺配置', () => {
    expect(() =>
      parseOptionSettings(
        'OptionSettings=(ExpRate=1.000000,CrossplayPlatforms=(Steam,Xbox)',
      ),
    ).toThrow(OptionSettingsParseError)
  })

  it('引号没有闭合时拒绝错误地切分后续参数', () => {
    expect(() =>
      parseOptionSettings(
        'OptionSettings=(ServerName="Broken,ExpRate=2.000000)',
      ),
    ).toThrow(OptionSettingsParseError)
  })
})