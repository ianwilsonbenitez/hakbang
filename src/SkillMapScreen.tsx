import { useRef, useState } from 'react'
import { useLanguage } from './language-context'
import { getMastery, type Mastery, type LessonParts } from './lib/mastery'
import type { Progress } from './lib/progress'
import {
  SKILL_COLUMNS,
  SKILL_NODES,
  countLevelsDone,
  getDefaultSelectedNode,
  getLessonAction,
  getNodeParts,
  getNodeStatus,
  getNodesInColumn,
  type LessonAction,
  type NodeStatus,
  type SkillNode,
} from './lib/skill-map'

type SkillMapScreenProps = {
  progress: Progress
  // Which optional parts each lesson has, by lesson id. A node without a lesson has no entry.
  partsByLessonId: Record<string, LessonParts>
  onOpenLesson: (lessonId: string) => void
}

const statusKeys = {
  comingSoon: 'statusComingSoon',
  notStarted: 'statusNotStarted',
  inProgress: 'statusInProgress',
  finished: 'statusFinished',
} as const

const actionKeys: Record<LessonAction, 'lessonStart' | 'lessonContinue' | 'lessonReview'> = {
  start: 'lessonStart',
  continue: 'lessonContinue',
  review: 'lessonReview',
}

// A finished node gets a mint border. The status text and the pips say the same,
// so the colour is never the only signal. The selected node also gets an indigo ring.
function nodeClass(status: NodeStatus, selected: boolean): string {
  const base = 'min-h-11 w-full rounded-lg border p-4 text-left '
  const ring = selected ? 'ring-2 ring-accent ' : ''
  if (status === 'finished') return base + ring + 'border-success bg-surface-raised'
  if (status === 'inProgress') return base + ring + 'border-accent bg-surface-raised'
  if (status === 'comingSoon') return base + 'border-border bg-surface opacity-70'
  return base + ring + 'border-border-strong bg-surface'
}

function masteryLevels(mastery: Mastery, t: ReturnType<typeof useLanguage>['t']) {
  return [
    { label: t.levelUnderstands, on: mastery.understands },
    { label: t.levelBuilds, on: mastery.builds },
    { label: t.levelDebugs, on: mastery.debugs },
  ]
}

// Small dots plus a visible "2 of 3 levels", because a hover title does not show on a phone.
function Pips({ mastery }: { mastery: Mastery }) {
  const { t } = useLanguage()
  return (
    <div className="mt-3 flex items-center gap-3">
      <ul className="flex gap-2" aria-label={t.levelsTitle}>
        {masteryLevels(mastery, t).map((pip) => (
          <li
            key={pip.label}
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
      <span aria-hidden="true" className="font-mono text-xs text-text-subtle">
        {countLevelsDone(mastery)} {t.stepOf} 3 {t.levelsDoneWord}
      </span>
    </div>
  )
}

function NodeCard({
  node,
  progress,
  parts,
  selected,
  onSelect,
}: {
  node: SkillNode
  progress: Progress
  parts: LessonParts
  selected: boolean
  onSelect: (nodeId: string) => void
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

  // A coming-soon node has no lesson yet, so it is a plain box and not a button.
  if (node.lessonId === null) {
    return <div className={nodeClass(status, false)}>{content}</div>
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(node.id)}
      className={nodeClass(status, selected)}
    >
      {content}
    </button>
  )
}

// The right panel of the approved design: the selected skill, its 3 levels in words, and one button.
function SelectedSkillPanel({
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
  const action = getLessonAction(status)
  const lessonId = node.lessonId

  return (
    <>
      <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.selectedSkillLabel}
      </p>
      <h3 className="mt-2 text-lg font-bold">{t[node.titleKey]}</h3>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t[statusKeys[status]]}
      </p>

      <h4 className="mt-5 text-sm font-semibold text-text-muted">{t.levelsTitle}</h4>
      <ol className="mt-2 space-y-2">
        {masteryLevels(mastery, t).map((level) => (
          <li key={level.label} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={
                'mt-1.5 h-3 w-3 shrink-0 rounded-full border ' +
                (level.on ? 'border-success bg-success' : 'border-border-strong bg-transparent')
              }
            />
            <span className="min-w-0">
              <span className="block text-sm">{level.label}</span>
              <span
                className={
                  'block font-mono text-xs ' + (level.on ? 'text-success' : 'text-text-subtle')
                }
              >
                {level.on ? t.pipOn : t.pipOff}
              </span>
            </span>
          </li>
        ))}
      </ol>

      {action !== null && lessonId !== null && (
        <button
          type="button"
          onClick={() => onOpenLesson(lessonId)}
          className="mt-6 min-h-11 w-full rounded-md bg-accent px-4 font-semibold text-bg"
        >
          {t[actionKeys[action]]}
        </button>
      )}
    </>
  )
}

export function SkillMapScreen({ progress, partsByLessonId, onOpenLesson }: SkillMapScreenProps) {
  const { t } = useLanguage()
  // null means "not tapped yet": the panel then shows the next lesson to do.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const panelRef = useRef<HTMLElement>(null)

  const selectedNode =
    SKILL_NODES.find((node) => node.id === selectedId) ??
    getDefaultSelectedNode(SKILL_NODES, progress, partsByLessonId)

  function handleSelect(nodeId: string) {
    setSelectedId(nodeId)
    // On a phone the panel sits under the map, so bring it into view. On a wide screen it is already visible.
    panelRef.current?.scrollIntoView?.({ block: 'nearest' })
  }

  return (
    <section>
      <h2 className="text-xl font-bold">{t.skillMapTitle}</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="dot-grid grid min-w-0 grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2">
          {SKILL_COLUMNS.map((column) => {
            const nodes = getNodesInColumn(column.id)
            return (
              <div key={column.id} className="min-w-0">
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
                        parts={getNodeParts(node, partsByLessonId)}
                        selected={node.id === selectedNode?.id}
                        onSelect={handleSelect}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {selectedNode !== undefined && (
          <aside
            ref={panelRef}
            aria-label={t.selectedSkillLabel}
            className="min-w-0 self-start rounded-xl border border-border bg-surface-raised p-5"
          >
            <SelectedSkillPanel
              node={selectedNode}
              progress={progress}
              parts={getNodeParts(selectedNode, partsByLessonId)}
              onOpenLesson={onOpenLesson}
            />
          </aside>
        )}
      </div>
    </section>
  )
}
