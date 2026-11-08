import { describe, expect, it } from 'vitest'
import unit01 from '../../content/lessons/unit-01-how-web-apps-work.json'
import { strings } from '../i18n/strings'
import type { Progress } from './progress'
import { SKILL_NODES, getNodeStatus, type SkillNode } from './skill-map'

const fullLesson = { hasExercise: true, hasBugCheck: true }
const plainLesson = { hasExercise: false, hasBugCheck: false }

const nodeWithLesson: SkillNode = { ...SKILL_NODES[0], lessonId: 'lesson-a' }
const nodeWithoutLesson: SkillNode = { ...SKILL_NODES[0], lessonId: null }

function progressWith(entry: Progress['lessons'][string]): Progress {
  return { schemaVersion: 1, lessons: { 'lesson-a': entry } }
}

describe('SKILL_NODES', () => {
  it('has exactly three nodes', () => {
    expect(SKILL_NODES).toHaveLength(3)
  })

  it('gives every node its own id', () => {
    const ids = SKILL_NODES.map((node) => node.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('points every lesson node at a lesson that exists', () => {
    const knownLessonIds = [unit01.id]
    for (const node of SKILL_NODES) {
      if (node.lessonId !== null) expect(knownLessonIds).toContain(node.lessonId)
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
  it('is locked when the node has no lesson, even if progress exists', () => {
    const progress = progressWith({ taskPassed: true })
    expect(getNodeStatus(nodeWithoutLesson, progress, fullLesson)).toBe('locked')
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
    })
    expect(getNodeStatus(nodeWithLesson, progress, fullLesson)).toBe('finished')
  })

  it('is finished for a lesson without exercise and bug check once task and check are done', () => {
    const progress = progressWith({ taskPassed: true, checkBestScore: 2 })
    expect(getNodeStatus(nodeWithLesson, progress, plainLesson)).toBe('finished')
  })
})
