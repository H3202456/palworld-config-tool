import { useState } from 'react'

interface ConfigPreviewProps {
  content: string
  actionLabel?: string
  onClose: () => void
  onDownload: () => void | Promise<void>
}

export function ConfigPreview({
  content,
  actionLabel = '下载 INI',
  onClose,
  onDownload,
}: ConfigPreviewProps) {
  const [copyMessage, setCopyMessage] = useState('')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopyMessage('代码已复制')
    } catch {
      setCopyMessage('复制失败，请手动选择代码复制')
    }
  }

  return (
    <div
      className="config-preview-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="config-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="配置代码预览"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="config-tool-heading">
          <div>
            <p className="section-label">代码预览</p>
            <h2>PalWorldSettings.ini</h2>
            <p>
              下面是根据当前界面设置实时生成的完整配置。
            </p>
          </div>

          <button
            className="config-close-button"
            type="button"
            aria-label="关闭代码预览"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <textarea
          className="config-preview-textarea"
          value={content}
          readOnly
          spellCheck={false}
        />

        <div className="config-preview-footer">
          <span>{copyMessage}</span>

          <div>
            <button
              className="button button-secondary"
              type="button"
              onClick={handleCopy}
            >
              复制代码
            </button>

            <button
              className="button button-primary"
              type="button"
              onClick={onDownload}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
