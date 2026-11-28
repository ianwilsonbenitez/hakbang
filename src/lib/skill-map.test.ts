import { describe, expect, it } from 'vitest'
import unit01 from '../../content/lessons/unit-01-how-web-apps-work.json'
import { strings } from '../i18n/strings'
import { validateLesson } from './lesson'
import { listBundledLessonFiles, loadLessonLibrary } from './lesson-library'
import type { Progress } from './progress'
import {
  SKILL_COLUMNS,
  SKILL_NODES,
  countLevelsDone,
  getDefaultSelectedNode,
  getLessonAction,
  getLessonParts,
  getNodeParts,
  getNodeStatus,
  getNodesInColumn,
  type SkillNode,
} from './skill-map'

const fullLesson = { hasExercise: true, hasBugCheck: true }
const plainLesson = { hasExercise: false, hasBugCheck: false }

const nodeWithLesson: SkillNode = { ...SKILL_NODES[0], lessonId: 'lesson-a' }
const nodeWithoutLesson: SkillNode = { ...SKILL_NODES[0], lessonId: null }

function progressWith(entry: Progress['lessons'][string]): Progress {
  return { schemaVersion: 1, lessons: { 'lesson-a': entry } }
}

describe('SKILL_NODES', () => {
  it('has exactly seven nodes', () => {
    expect(SKILL_NODES).toHaveLength(8)
  })

  it('gives every node its own id', () => {
    const ids = SKILL_NODES.map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // Catches a typo in a lessonId, and a lesson file that is broken, before a learner opens it.
  it('points every lesson node at a valid lesson file', () => {
    const library = loadLessonLibrary(listBundledLessonFiles())
    for (const node of SKILL_NODES) {
      if (node.lessonId !== null) {
        expect(library[node.lessonId]?.ok, `${node.lessonId} is missing or invalid`).toBe(true)
      }
    }
  })

  it('has a title in English and in Taglish for every node', () => {
    for (const node of SKILL_NODES) {
      expect(strings.en[node.titleKey].trim(), node.id).not.toBe('')
      expect(strings.tl[node.titleKey].trim(), node.id).not.toBe('')
    }
  })
})

describe('getNodeStatus', () => {
  it('is coming soon when the node has no lesson, even if progress exists', () => {
    const progress = progressWith({ taskPassed: true })
    expect(getNodeStatus(nodeWithoutLesson, progress, fullLesson)).toBe('comingSoon')
  })

  it('is not started when nothing is saved for the lesson', () => {
    const empty: Progress = { schemaVersion: 1, lessons: {} }
    expect(getNodeStatus(nodeWithLesson, empty, fullLesson)).toBe('notStarted')
  })

  it('is in progress when one pip is on', () => {
    const progress = progressWith({ taskPassed: true })
    expect(getNodeStatus(nodeWithLesson, progress, fullLesson)).toBe('inProgress')
  })

  it('is in progress when two pips are on', () => {
    const progress = progressWith({ taskPassed: true, exerciseSolved: true })
    expect(getNodeStatus(nodeWithLesson, progress, fullLesson)).toBe('inProgress')
  })

  it('is finished when all three pips are on', () => {
    const progress = progressWith({
      taskPassed: true,
      exerciseSolved: true,
      checkBestScore: 3,
      bugCheckPassed: true,
      bugCheckExplained: true,
    })
    expect(getNodeStatus(nodeWithLesson, progress, fullLesson)).toBe('finished')
  })

  it('is finished for a lesson without exercise and bug check once task and check are done', () => {
    const progress = progressWith({ taskPassed: true, checkBestScore: 2 })
    expect(getNodeStatus(nodeWithLesson, progress, plainLesson)).toBe('finished')
  })
})

describe('SKILL_COLUMNS', () => {
  it('has the four columns in the approved order', () => {
    expect(SKILL_COLUMNS.map((column) => column.id)).toEqual([
      'foundations',
      'javascript',
      'debugging',
      'react',
    ])
  })

  it('has a title in both languages for every column', () => {
    for (const column of SKILL_COLUMNS) {
      expect(strings.en[column.titleKey].trim(), column.id).not.toBe('')
      expect(strings.tl[column.titleKey].trim(), column.id).not.toBe('')
    }
  })

  it('gives every node a column that is on the map', () => {
    const columnIds = SKILL_COLUMNS.map((column) => column.id)
    for (const node of SKILL_NODES) expect(columnIds).toContain(node.column)
  })
})

describe('getNodesInColumn', () => {
  it('returns only the nodes of that column', () => {
    const nodes = getNodesInColumn('foundations')
    expect(nodes.map((node) => node.id)).toEqual([
      'values-and-variables',
      'function-and-return',
      'how-web-apps-work',
    ])
  })

  it('returns an empty list for a column with no nodes yet', () => {
    expect(getNodesInColumn('react')).toEqual([])
  })
})

describe('getLessonParts', () => {
  const result = validateLesson(unit01)
  if (!result.ok) throw new Error('Unit 1 should be a valid lesson')
  const lesson = result.lesson

  it('sees the exercise and the bug check in Unit 1', () => {
    expect(getLessonParts(lesson)).toEqual({ hasExercise: true, hasBugCheck: true })
  })

  it('sees a lesson without exercise and bug check', () => {
    const plain = { ...lesson, exercise: undefined, bugCheck: undefined }
    expect(getLessonParts(plain)).toEqual({ hasExercise: false, hasBugCheck: false })
  })
})

describe('getNodeParts', () => {
  it('gives no parts to a node without a lesson', () => {
    expect(getNodeParts(nodeWithoutLesson, { 'lesson-a': fullLesson })).toEqual(plainLesson)
  })

  it('gives the lesson its own parts', () => {
    expect(getNodeParts(nodeWithLesson, { 'lesson-a': fullLesson })).toEqual(fullLesson)
  })

  it('gives no parts when the lesson is missing from the list', () => {
    expect(getNodeParts(nodeWithLesson, {})).toEqual(plainLesson)
  })
})

describe('getLessonAction', () => {
  it('has no button for a coming-soon node', () => {
    expect(getLessonAction('comingSoon')).toBeNull()
  })

  it('says start, continue or review for the other statuses', () => {
    expect(getLessonAction('notStarted')).toBe('start')
    expect(getLessonAction('inProgress')).toBe('continue')
    expect(getLessonAction('finished')).toBe('review')
  })
})

describe('countLevelsDone', () => {
  it('counts 0 when no pip is on', () => {
    expect(countLevelsDone({ understands: false, builds: false, debugs: false })).toBe(0)
  })

  it('counts only the pips that are on', () => {
    expect(countLevelsDone({ understands: true, builds: false, debugs: true })).toBe(2)
  })

  it('counts 3 when all pips are on', () => {
    expect(countLevelsDone({ understands: true, builds: true, debugs: true })).toBe(3)
  })
})

describe('getDefaultSelectedNode', () => {
  const nodeA: SkillNode = { ...SKILL_NODES[0], id: 'a', lessonId: 'lesson-a' }
  const nodeB: SkillNode = { ...SKILL_NODES[0], id: 'b', lessonId: 'lesson-b' }
  const comingSoonNode: SkillNode = { ...SKILL_NODES[0], id: 'comingSoon', lessonId: null }
  const parts = { 'lesson-a': plainLesson, 'lesson-b': plainLesson }
  // With no exercise and no bug check, a passed task and a check score of 2 finish a lesson.
  const finished = { taskPassed: true, checkBestScore: 2 }

  it('picks the first lesson when nothing is done yet', () => {
    const progress: Progress = { schemaVersion: 1, lessons: {} }
    expect(getDefaultSelectedNode([comingSoonNode, nodeA, nodeB], progress, parts)?.id).toBe('a')
  })

  it('skips a finished lesson and picks the next one', () => {
    const progress: Progress = { schemaVersion: 1, lessons: { 'lesson-a': finished } }
    expect(getDefaultSelectedNode([nodeA, nodeB], progress, parts)?.id).toBe('b')
  })

  it('picks the first lesson again when every lesson is finished', () => {
    const progress: Progress = {
      schemaVersion: 1,
      lessons: { 'lesson-a': finished, 'lesson-b': finished },
    }
    expect(getDefaultSelectedNode([nodeA, nodeB], progress, parts)?.id).toBe('a')
  })

  it('picks nothing when no node has a lesson', () => {
    const progress: Progress = { schemaVersion: 1, lessons: {} }
    expect(getDefaultSelectedNode([comingSoonNode], progress, parts)).toBeUndefined()
  })
})
