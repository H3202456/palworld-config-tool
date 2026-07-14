import {
  SETTINGS_SCHEMA,
  isSettingKey,
} from '../data/settings-schema'
import type { ConfigDraftV2 } from '../storage/config-draft'

interface DraftRecoveryDialogProps {
  draft: ConfigDraftV2
  warnings: readonly string[]
  onRestore: () => void
  onDiscard: () => void
}

function valuesAreEqual(
  first: unknown,
  second: unknown,
): boolean {
  if (Array.isArray(first) && Array.isArray(second)) {
    return (
      first.length === second.length &&
      first.every(
        (item, index) => item === second[index],
      )
    )
  }

  return first === second
}

function formatSavedAt(savedAt: string): string {
  return new Date(savedAt).toLocaleString('zh-CN', {
    hour12: false,
  })
}

export function DraftRecoveryDialog({
  draft,
  warnings,
  onRestore,
  onDiscard,
}: DraftRecoveryDialogProps) {
  const modifiedCount = SETTINGS_SCHEMA.filter(
    (setting) =>
      !valuesAreEqual(
        draft.values[setting.key],
        draft.baselineValues[setting.key],
      ),
  ).length

  const unknownEntryCount = draft.sourceEntries.filter(
    (entry) => !isSettingKey(entry.key),
  ).length

  return (
    <div
      className="config-preview-backdrop"
      role="presentation"
    >
      <section
        className="config-preview-dialog draft-recovery-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="恢复本地草稿"
      >
        <div className="draft-recovery-heading">
          <div className="draft-recovery-icon" aria-hidden="true">
            ↻
          </div>

          <div>
            <p className="section-label">本地草稿</p>
            <h2>发现上次未完成的配置</h2>
            <p>
              草稿保存在这个浏览器中，最后保存于
              {' '}
              <strong>{formatSavedAt(draft.savedAt)}</strong>。
            </p>
          </div>
        </div>

        <div className="draft-recovery-summary">
          <div>
            <span>相对基准修改</span>
            <strong>{modifiedCount} 项</strong>
          </div>

          <div>
            <span>原始参数</span>
            <strong>{draft.sourceEntries.length} 项</strong>
          </div>

          <div>
            <span>未知参数</span>
            <strong>{unknownEntryCount} 项</strong>
          </div>
        </div>

        <div className="draft-security-note">
          <strong>密码不会保存在草稿中</strong>
          <p>
            服务器加入密码和管理员密码会被清空。恢复后需要重新输入，再导出配置。
          </p>
        </div>

        {warnings.length > 0 && (
          <div className="draft-warning-list">
            <strong>恢复时需要注意</strong>
            <ul>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="draft-recovery-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={onDiscard}
          >
            丢弃草稿
          </button>

          <button
            className="button button-primary"
            type="button"
            onClick={onRestore}
          >
            恢复并继续编辑
          </button>
        </div>
      </section>
    </div>
  )
}
