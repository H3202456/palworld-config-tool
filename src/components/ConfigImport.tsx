import { useState, type ChangeEvent } from 'react'
import {
  isDesktopRuntime,
  openDesktopConfigFile,
} from '../platform/desktop-files'

export interface ConfigImportSummary {
  supportedCount: number
  unknownCount: number
  warnings: string[]
}

interface ConfigImportProps {
  onImport: (source: string) => ConfigImportSummary
  onClose: () => void
}

function getErrorMessage(
  caughtError: unknown,
  fallback: string,
): string {
  if (caughtError instanceof Error) {
    return caughtError.message
  }

  if (typeof caughtError === 'string') {
    return caughtError
  }

  return fallback
}

export function ConfigImport({
  onImport,
  onClose,
}: ConfigImportProps) {
  const desktopMode = isDesktopRuntime()
  const [source, setSource] = useState('')
  const [message, setMessage] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState('')
  const [readingFile, setReadingFile] = useState(false)

  const applyLoadedFile = (
    content: string,
    fileName: string,
  ) => {
    setSource(content)
    setMessage(`已读取文件：${fileName}`)
    setWarnings([])
    setError('')
  }

  const handleDesktopFileSelect = async () => {
    setReadingFile(true)
    setError('')

    try {
      const selectedFile = await openDesktopConfigFile()

      if (!selectedFile) {
        return
      }

      applyLoadedFile(
        selectedFile.content,
        selectedFile.name,
      )
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
          '无法读取这个文件，请确认文件没有损坏。',
        ),
      )
    } finally {
      setReadingFile(false)
    }
  }

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setReadingFile(true)
    setError('')

    try {
      const content = await file.text()

      applyLoadedFile(content, file.name)
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
          '无法读取这个文件，请确认文件没有损坏。',
        ),
      )
    } finally {
      setReadingFile(false)
      event.target.value = ''
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
      setError(
        getErrorMessage(
          caughtError,
          '发生了未知解析错误。',
        ),
      )
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
        {desktopMode ? (
          <button
            className="file-picker-button"
            type="button"
            disabled={readingFile}
            onClick={handleDesktopFileSelect}
          >
            {readingFile ? '正在读取…' : '选择配置文件'}
          </button>
        ) : (
          <label className="file-picker-button">
            {readingFile ? '正在读取…' : '选择配置文件'}
            <input
              type="file"
              accept=".ini,.txt,text/plain"
              disabled={readingFile}
              onChange={handleFileChange}
            />
          </label>
        )}

        <span>
          {desktopMode
            ? '通过系统文件选择器读取，配置不会上传。'
            : '文件只在当前浏览器中读取，不会上传。'}
        </span>
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
          disabled={
            readingFile || source.trim().length === 0
          }
          onClick={handleImport}
        >
          解析并载入
        </button>
      </div>
    </section>
  )
}
