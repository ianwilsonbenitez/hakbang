import { useRef, useState } from 'react'
import { useLanguage } from './language-context'
import { backupFileName, backupText, parseBackupText } from './lib/backup'
import type { Progress } from './lib/progress'

type BackupPanelProps = {
  progress: Progress
  // Called only when the learner confirms. The parent saves it, in that click.
  onImport: (progress: Progress) => void
}

// What the line under the buttons says. One value, so two messages can never show at once.
type Message =
  | { kind: 'none' }
  | { kind: 'exported'; fileName: string }
  | { kind: 'failed' }
  | { kind: 'imported' }

const buttonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent'

export function BackupPanel({ progress, onImport }: BackupPanelProps) {
  const { t } = useLanguage()
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<Message>({ kind: 'none' })
  // A valid backup waits here until the learner confirms the replace.
  const [pending, setPending] = useState<Progress | null>(null)

  function exportBackup() {
    const fileName = backupFileName(new Date())
    const blob = new Blob([backupText(progress)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    setPending(null)
    setMessage({ kind: 'exported', fileName })
  }

  async function chooseFile(file: File | undefined) {
    if (file === undefined) return
    const result = parseBackupText(await file.text())
    if (result.ok) {
      setPending(result.progress)
      setMessage({ kind: 'none' })
    } else {
      setPending(null)
      setMessage({ kind: 'failed' })
    }
    // Clears the picker, so choosing the same file again still fires onChange.
    if (fileInput.current !== null) fileInput.current.value = ''
  }

  function confirmReplace() {
    if (pending === null) return
    onImport(pending)
    setPending(null)
    setMessage({ kind: 'imported' })
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface p-4">
      <h2 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.backupTitle}
      </h2>
      <p className="mt-2 text-text-muted">{t.backupNote}</p>

      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={exportBackup} className={buttonClass}>
          {t.backupExport}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} className={buttonClass}>
          {t.backupImport}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label={t.backupImport}
          onChange={(event) => void chooseFile(event.target.files?.[0])}
        />
      </div>

      {pending !== null && (
        <div role="alert" className="mt-4 rounded-lg border border-review bg-surface-raised p-4">
          <p className="font-semibold text-review">{t.backupConfirm}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={confirmReplace} className={buttonClass}>
              {t.backupReplace}
            </button>
            <button type="button" onClick={() => setPending(null)} className={buttonClass}>
              {t.backupCancel}
            </button>
          </div>
        </div>
      )}

      <div role="status" className="mt-3">
        {message.kind === 'exported' && (
          <p className="font-semibold text-success">
            {t.backupExported}: {message.fileName}
          </p>
        )}
        {message.kind === 'imported' && (
          <p className="font-semibold text-success">{t.backupImported}</p>
        )}
        {message.kind === 'failed' && (
          <p className="font-semibold text-review">{t.backupFailed}</p>
        )}
      </div>
    </section>
  )
}
