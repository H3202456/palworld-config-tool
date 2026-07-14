import { useState, type ChangeEvent } from 'react'

export interface ConfigImportSummary {
  supportedCount: number
  unknownCount: number
  warnings: string[]
}

interface ConfigImportProps {
  onImport: (source: string) => ConfigImportSummary
  onClose: () => void
}

export function ConfigImport({
  onImport,
  onClose,
}: ConfigImportProps) {
  const [source, setSource] = useState('')
  const [message, setMessage] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      const content = await file.text()

      setSource(content)
      setMessage(`已读取文件：${file.name}`)
      setWarnings([])
      setError('')
    } catch {
      setError('无法读取这个文件，请确认文件没有损坏。')
    }
  }

  const handleImport = () => {
    setMessage('')
    setWarnings([])
    setError('')

    try {
      const summary = onImport(source)

      setMessage(
        `导入完成：识别 ${summary.supportedCount} 个可编辑参数，保留 ${summary.unknownCount} 个暂未支持参数。`,
      )

      setWarnings(summary.warnings)
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : '发生了未知解析错误。'

      setError(errorMessage)
    }
  }

  return (
    <section className="config-import-panel">
      <div className="config-tool-heading">
        <div>
          <p className="section-label">导入配置</p>
          <h2>载入 PalWorldSettings.ini</h2>
          <p>
            可以选择文件，也可以直接粘贴完整 INI 或
            OptionSettings 内容。
          </p>
        </div>

        <button
          className="config-close-button"
          type="button"
          aria-label="关闭导入面板"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="config-import-file-row">
        <label className="file-picker-button">
          选择配置文件
          <input
            type="file"
            accept=".ini,.txt,text/plain"
            onChange={handleFileChange}
          />
        </label>

        <span>文件只在当前浏览器中读取，不会上传。</span>
      </div>

      <textarea
        className="config-source-textarea"
        value={source}
        spellCheck={false}
        placeholder={`可以粘贴：

[/Script/Pal.PalGameWorldSettings]
OptionSettings=(ExpRate=20.000000,bIsPvP=True)

也可以只粘贴：

ExpRate=20.000000,bIsPvP=True`}
        onChange={(event) => setSource(event.target.value)}
      />

      {message && (
        <div className="import-message import-message-success">
          {message}
        </div>
      )}

      {error && (
        <div className="import-message import-message-error">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="import-warning-list">
          <strong>导入提醒</strong>

          {warnings.map((warning, index) => (
            <p key={`${warning}-${index}`}>⚠ {warning}</p>
          ))}
        </div>
      )}

      <div className="config-import-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={onClose}
        >
          取消
        </button>

        <button
          className="button button-primary"
          type="button"
          disabled={source.trim().length === 0}
          onClick={handleImport}
        >
          解析并载入
        </button>
      </div>
    </section>
  )
}