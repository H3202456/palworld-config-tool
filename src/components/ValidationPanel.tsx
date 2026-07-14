import type { ValidationIssue } from '../validation/validation-types'

interface ValidationPanelProps {
  issues: readonly ValidationIssue[]
  modifiedCount: number
  sourceEntryCount: number
  unknownEntryCount: number
  onSelectIssue: (issue: ValidationIssue) => void
}

function getIssueIcon(issue: ValidationIssue): string {
  switch (issue.severity) {
    case 'error':
      return '×'

    case 'warning':
      return '!'

    case 'info':
      return 'i'

    default:
      return '•'
  }
}

function getSeverityLabel(issue: ValidationIssue): string {
  switch (issue.severity) {
    case 'error':
      return '错误'

    case 'warning':
      return '提醒'

    case 'info':
      return '信息'

    default:
      return '检查结果'
  }
}

export function ValidationPanel({
  issues,
  modifiedCount,
  sourceEntryCount,
  unknownEntryCount,
  onSelectIssue,
}: ValidationPanelProps) {
  const errorCount = issues.filter(
    (issue) => issue.severity === 'error',
  ).length

  const warningCount = issues.filter(
    (issue) => issue.severity === 'warning',
  ).length

  return (
    <aside className="status-panel">
      <p className="section-label">配置状态</p>
      <h2>检查结果</h2>

      <div className="validation-summary-grid">
        <div
          className={`validation-stat ${
            errorCount > 0 ? 'validation-stat-error' : ''
          }`}
        >
          <strong>{errorCount}</strong>
          <span>错误</span>
        </div>

        <div
          className={`validation-stat ${
            warningCount > 0 ? 'validation-stat-warning' : ''
          }`}
        >
          <strong>{warningCount}</strong>
          <span>提醒</span>
        </div>

        <div className="validation-stat">
          <strong>{modifiedCount}</strong>
          <span>已修改</span>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="validation-success-message">
          <span className="status-icon status-success">✓</span>

          <div>
            <strong>配置检查通过</strong>
            <p>暂未发现数值或参数关系问题。</p>
          </div>
        </div>
      ) : (
        <div className="validation-issue-list">
          {issues.map((issue) => (
            <button
              key={issue.id}
              className={`validation-issue validation-issue-${issue.severity}`}
              type="button"
              disabled={!issue.settingKey}
              onClick={() => onSelectIssue(issue)}
            >
              <span className="validation-issue-icon">
                {getIssueIcon(issue)}
              </span>

              <span className="validation-issue-content">
                <strong>{getSeverityLabel(issue)}</strong>
                <span>{issue.message}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="status-list validation-secondary-status">
        <div className="status-item">
          <span className="status-icon status-neutral">
            {modifiedCount}
          </span>

          <div>
            <strong>已修改 {modifiedCount} 项</strong>
            <p>相对于最近导入的配置进行计算。</p>
          </div>
        </div>

        {sourceEntryCount > 0 && (
          <div className="status-item">
            <span className="status-icon status-success">✓</span>

            <div>
              <strong>已载入 {sourceEntryCount} 个参数</strong>
              <p>
                其中 {unknownEntryCount} 个暂未支持，导出时仍会保留。
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}