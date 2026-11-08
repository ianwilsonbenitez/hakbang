import type { en } from '../i18n/en'
import type { Lesson } from './lesson'
import type { LessonParts } from './mastery'
import type { Progress } from './progress'
import { getMastery, isFinished } from './mastery'

export type SkillColumn = 'foundations' | 'javascript' | 'debugging' | 'react'

export type NodeStatus = 'locked' | 'notStarted' | 'inProgress' | 'finished'

export type SkillNode = {
  id: string
  column: SkillColumn
  // A key of en.ts, so the title comes from the language files and not from here.
  titleKey: keyof typeof en
  // null means the lesson is not written yet, so the node stays locked.
  lessonId: string | null
}

export const SKILL_NODES: SkillNode[] = [
  {
    id: 'how-web-apps-work',
    column: 'foundations',
    titleKey: 'nodeHowWebAppsWork',
    lessonId: 'unit-01-how-web-apps-work',
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
//   1. the node has no lesson yet            -> 'locked'
//   2. all three pips are on                 -> 'finished'
//   3. some pips are on, but not all of them -> 'inProgress'
//   4. nothing else fits (no pip is on)      -> 'notStarted'
export function getNodeStatus(node: SkillNode, progress: Progress, parts: LessonParts): NodeStatus {
  if (node.lessonId === null) {
    return 'locked'
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
