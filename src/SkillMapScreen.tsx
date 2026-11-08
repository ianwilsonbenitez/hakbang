import { useLanguage } from './language-context'
import { getMastery, type Mastery, type LessonParts } from './lib/mastery'
import type { Progress } from './lib/progress'
import {
  SKILL_COLUMNS,
  getNodeStatus,
  getNodesInColumn,
  type NodeStatus,
  type SkillNode,
} from './lib/skill-map'

type SkillMapScreenProps = {
  progress: Progress
  // Which optional parts each lesson has, by lesson id. A node without a lesson has no entry.
  partsByLessonId: Record<string, LessonParts>
  onOpenLesson: (lessonId: string) => void
}

const NO_PARTS: LessonParts = { hasExercise: false, hasBugCheck: false }

const statusKeys = {
  locked: 'statusLocked',
  notStarted: 'statusNotStarted',
  inProgress: 'statusInProgress',
  finished: 'statusFinished',
} as const

// A finished node gets a mint border. The status text and the pips say the same,
// so the colour is never the only signal.
function nodeClass(status: NodeStatus): string {
  const base = 'min-h-11 w-full rounded-lg border p-4 text-left '
  if (status === 'finished') return base + 'border-success bg-surface-raised'
  if (status === 'inProgress') return base + 'border-accent bg-surface-raised'
  if (status === 'locked') return base + 'border-border bg-surface opacity-70'
  return base + 'border-border-strong bg-surface'
}

function Pips({ mastery }: { mastery: Mastery }) {
  const { t } = useLanguage()
  const pips = [
    { label: t.levelUnderstands, on: mastery.understands },
    { label: t.levelBuilds, on: mastery.builds },
    { label: t.levelDebugs, on: mastery.debugs },
  ]
  return (
    <ul className="mt-3 flex gap-2" aria-label={t.skillMapTitle}>
      {pips.map((pip) => (
        <li
          key={pip.label}
          title={pip.label}
          className={
            'h-3 w-3 rounded-full border ' +
            (pip.on ? 'border-success bg-success' : 'border-border-strong bg-transparent')
          }
        >
          <span className="sr-only">
            {pip.label}: {pip.on ? t.pipOn : t.pipOff}
          </span>
        </li>
      ))}
    </ul>
  )
}

function NodeCard({
  node,
  progress,
  parts,
  onOpenLesson,
}: {
  node: SkillNode
  progress: Progress
  parts: LessonParts
  onOpenLesson: (lessonId: string) => void
}) {
  const { t } = useLanguage()
  const status = getNodeStatus(node, progress, parts)
  const entry = node.lessonId === null ? undefined : progress.lessons[node.lessonId]
  const mastery = getMastery(entry, parts)

  const content = (
    <>
      <span className="block font-semibold">{t[node.titleKey]}</span>
      <span className="mt-1 block font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t[statusKeys[status]]}
      </span>
      <Pips mastery={mastery} />
    </>
  )

  // A locked node has no lesson yet, so it is a plain box and not a button.
  if (node.lessonId === null) {
    return <div className={nodeClass(status)}>{content}</div>
  }

  const lessonId = node.lessonId
  return (
    <button type="button" onClick={() => onOpenLesson(lessonId)} className={nodeClass(status)}>
      {content}
    </button>
  )
}

export function SkillMapScreen({ progress, partsByLessonId, onOpenLesson }: SkillMapScreenProps) {
  const { t } = useLanguage()

  return (
    <section>
      <h2 className="text-xl font-bold">{t.skillMapTitle}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        {SKILL_COLUMNS.map((column) => {
          const nodes = getNodesInColumn(column.id)
          return (
            <div key={column.id}>
              <h3 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
                {t[column.titleKey]}
              </h3>
              <div className="mt-3 space-y-3">
                {nodes.length === 0 ? (
                  <p className="text-sm text-text-subtle">{t.columnEmpty}</p>
                ) : (
                  nodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      progress={progress}
                      parts={
                        node.lessonId === null
                          ? NO_PARTS
                          : (partsByLessonId[node.lessonId] ?? NO_PARTS)
                      }
                      onOpenLesson={onOpenLesson}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
