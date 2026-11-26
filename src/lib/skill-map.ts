import type { en } from '../i18n/en'
import type { Lesson } from './lesson'
import type { LessonParts, Mastery } from './mastery'
import type { Progress } from './progress'
import { getMastery, isFinished } from './mastery'

export type SkillColumn = 'foundations' | 'javascript' | 'debugging' | 'react'

export type NodeStatus = 'comingSoon' | 'notStarted' | 'inProgress' | 'finished'

export type SkillNode = {
  id: string
  column: SkillColumn
  // A key of en.ts, so the title comes from the language files and not from here.
  titleKey: keyof typeof en
  // null means the lesson is not written yet, so the node says "Coming soon".
  lessonId: string | null
}

export const SKILL_NODES: SkillNode[] = [
  {
    id: 'values-and-variables',
    column: 'foundations',
    titleKey: 'nodeValuesAndVariables',
    lessonId: 'unit-00a-values-and-variables',
  },
  {
    id: 'function-and-return',
    column: 'foundations',
    titleKey: 'nodeFunctionAndReturn',
    lessonId: 'unit-00b-function-and-return',
  },
  {
    id: 'how-web-apps-work',
    column: 'foundations',
    titleKey: 'nodeHowWebAppsWork',
    lessonId: 'unit-01-how-web-apps-work',
  },
  {
    id: 'comparing-with-equals',
    column: 'javascript',
    titleKey: 'nodeComparingWithEquals',
    lessonId: 'unit-02-isbugline',
  },
  {
    id: 'choosing-with-ternary',
    column: 'javascript',
    titleKey: 'nodeChoosingWithTernary',
    lessonId: 'unit-03-parselanguage',
  },
  { id: 'decisions-in-code', column: 'javascript', titleKey: 'nodeDecisionsInCode', lessonId: null },
  { id: 'spot-the-bug', column: 'debugging', titleKey: 'nodeSpotTheBug', lessonId: null },
]

// The four columns, left to right (top to bottom on a phone).
export const SKILL_COLUMNS: { id: SkillColumn; titleKey: keyof typeof en }[] = [
  { id: 'foundations', titleKey: 'columnFoundations' },
  { id: 'javascript', titleKey: 'columnJavascript' },
  { id: 'debugging', titleKey: 'columnDebugging' },
  { id: 'react', titleKey: 'columnReact' },
]

export function getNodesInColumn(column: SkillColumn): SkillNode[] {
  return SKILL_NODES.filter((node) => node.column === column)
}

// Turns a whole lesson into the two small flags that getMastery needs.
export function getLessonParts(lesson: Lesson): LessonParts {
  return {
    hasExercise: lesson.exercise !== undefined,
    hasBugCheck: lesson.bugCheck !== undefined,
  }
}

// The status of a node on the skill map. The questions are asked in this order,
// and the first one that fits decides the answer:
//   1. the node has no lesson yet            -> 'comingSoon'
//   2. all three pips are on                 -> 'finished'
//   3. some pips are on, but not all of them -> 'inProgress'
//   4. nothing else fits (no pip is on)      -> 'notStarted'
export function getNodeStatus(node: SkillNode, progress: Progress, parts: LessonParts): NodeStatus {
  if (node.lessonId === null) {
    return 'comingSoon'
  }

  const entry = progress.lessons[node.lessonId]
  const mastery = getMastery(entry, parts)

  if (isFinished(mastery)) {
    return 'finished'
  }

  if (mastery.understands || mastery.builds || mastery.debugs) {
    return 'inProgress'
  }

  return 'notStarted'
}

// A node without a lesson, or a lesson that is missing from the library, has no optional parts.
const NO_PARTS: LessonParts = { hasExercise: false, hasBugCheck: false }

export function getNodeParts(node: SkillNode, partsByLessonId: Record<string, LessonParts>): LessonParts {
  if (node.lessonId === null) return NO_PARTS
  return partsByLessonId[node.lessonId] ?? NO_PARTS
}

// What the big button in the selected-skill panel says. A coming-soon node has no button.
export type LessonAction = 'start' | 'continue' | 'review'

export function getLessonAction(status: NodeStatus): LessonAction | null {
  if (status === 'comingSoon') return null
  if (status === 'notStarted') return 'start'
  if (status === 'inProgress') return 'continue'
  return 'review'
}

// How many of the three pips are on, for the small "2 of 3" text under the pips.
export function countLevelsDone(mastery: Mastery): number {
  return [mastery.understands, mastery.builds, mastery.debugs].filter((on) => on).length
}

// The skill the panel shows before the learner taps one: the first lesson that is
// not finished yet, so "Continue lesson" is one tap away. If every lesson is finished,
// the first lesson. If no node has a lesson, nothing.
export function getDefaultSelectedNode(
  nodes: SkillNode[],
  progress: Progress,
  partsByLessonId: Record<string, LessonParts>,
): SkillNode | undefined {
  const withLesson = nodes.filter((node) => node.lessonId !== null)
  const notFinished = withLesson.find(
    (node) => getNodeStatus(node, progress, getNodeParts(node, partsByLessonId)) !== 'finished',
  )
  return notFinished ?? withLesson[0]
}
