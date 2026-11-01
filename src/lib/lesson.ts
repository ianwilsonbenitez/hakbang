import type { LocalizedText } from './language'

// The lesson file format is described in docs/lesson-schema.md.

export type LessonOption = { id: string; text: LocalizedText }

export type LessonChoice = {
  question: LocalizedText
  options: LessonOption[]
  answer: string
  why: LocalizedText
}

export type TracerStep = {
  line: number
  vars: Record<string, string>
  condition?: string
  skippedLines?: number[]
  note: LocalizedText
}

export type Lesson = {
  schemaVersion: 1
  id: string
  unit: number
  title: LocalizedText
  minutes: number
  diagram: { file: string; alt: LocalizedText }
  explain: LocalizedText[]
  glossary?: ({ term: string } & LocalizedText)[]
  task: LessonChoice
  exercise?: {
    prompt: LocalizedText
    code: string
    acceptedAnswers: string[]
    hints: LocalizedText[]
  }
  bugCheck?: {
    prompt: LocalizedText
    code: string
    bugLine: number
    why: LocalizedText
  }
  check: LessonChoice[]
  tracer?: {
    code: string
    predict: { question: LocalizedText; answer: LocalizedText }
    steps: TracerStep[]
  }
}

// The screen turns each code into a sentence in English or Taglish.
export type LessonErrorCode =
  | 'not-an-object'
  | 'missing'
  | 'wrong-type'
  | 'missing-en'
  | 'missing-tl'
  | 'empty-text'
  | 'wrong-count'
  | 'unsupported-version'
  | 'code-too-long'
  | 'line-out-of-range'
  | 'answer-not-in-options'

// path says where the problem is, e.g. "check[1].answer".
export type LessonError = { path: string; code: LessonErrorCode }

export type LessonResult =
  | { ok: true; lesson: Lesson }
  | { ok: false; errors: LessonError[] }

export const SUPPORTED_SCHEMA_VERSION = 1
const MAX_CODE_LINES = 14
const HINT_COUNT = 3
const CHECK_QUESTION_COUNT = 3

type Errors = LessonError[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function addError(errors: Errors, path: string, code: LessonErrorCode): void {
  errors.push({ path, code })
}

function checkNonEmptyString(value: unknown, path: string, errors: Errors): void {
  if (value === undefined) {
    addError(errors, path, 'missing')
  } else if (typeof value !== 'string') {
    addError(errors, path, 'wrong-type')
  } else if (value.trim() === '') {
    addError(errors, path, 'empty-text')
  }
}

function checkPositiveInteger(value: unknown, path: string, errors: Errors): void {
  if (value === undefined) {
    addError(errors, path, 'missing')
  } else if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    addError(errors, path, 'wrong-type')
  }
}

// Checks the fields a { en, tl } object needs. Used for both text objects and glossary entries.
function checkLanguages(value: Record<string, unknown>, path: string, errors: Errors): void {
  if (value.en === undefined) {
    addError(errors, `${path}.en`, 'missing-en')
  } else {
    checkNonEmptyString(value.en, `${path}.en`, errors)
  }
  if (value.tl === undefined) {
    addError(errors, `${path}.tl`, 'missing-tl')
  } else {
    checkNonEmptyString(value.tl, `${path}.tl`, errors)
  }
}

function checkText(value: unknown, path: string, errors: Errors): void {
  if (value === undefined) {
    addError(errors, path, 'missing')
  } else if (!isRecord(value)) {
    addError(errors, path, 'wrong-type')
  } else {
    checkLanguages(value, path, errors)
  }
}

function checkList(
  value: unknown,
  path: string,
  errors: Errors,
  isCountOk: (count: number) => boolean,
): unknown[] | null {
  if (value === undefined) {
    addError(errors, path, 'missing')
    return null
  }
  if (!Array.isArray(value)) {
    addError(errors, path, 'wrong-type')
    return null
  }
  if (!isCountOk(value.length)) {
    addError(errors, path, 'wrong-count')
  }
  return value
}

// Returns the number of lines, or null when the code itself is unusable.
function checkCode(value: unknown, path: string, errors: Errors): number | null {
  checkNonEmptyString(value, path, errors)
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  const lineCount = value.split('\n').length
  if (lineCount > MAX_CODE_LINES) {
    addError(errors, path, 'code-too-long')
  }
  return lineCount
}

// Line numbers count from 1. lineCount is null when the code was unusable, so we skip the range check.
function checkLineNumber(
  value: unknown,
  path: string,
  lineCount: number | null,
  errors: Errors,
): void {
  if (value === undefined) {
    addError(errors, path, 'missing')
  } else if (typeof value !== 'number' || !Number.isInteger(value)) {
    addError(errors, path, 'wrong-type')
  } else if (value < 1 || (lineCount !== null && value > lineCount)) {
    addError(errors, path, 'line-out-of-range')
  }
}

function checkChoice(value: unknown, path: string, errors: Errors): void {
  if (value === undefined) {
    addError(errors, path, 'missing')
    return
  }
  if (!isRecord(value)) {
    addError(errors, path, 'wrong-type')
    return
  }
  checkText(value.question, `${path}.question`, errors)
  checkText(value.why, `${path}.why`, errors)

  const optionIds: string[] = []
  const options = checkList(
    value.options,
    `${path}.options`,
    errors,
    (count) => count >= 2 && count <= 4,
  )
  options?.forEach((option, index) => {
    const optionPath = `${path}.options[${index}]`
    if (!isRecord(option)) {
      addError(errors, optionPath, 'wrong-type')
      return
    }
    checkNonEmptyString(option.id, `${optionPath}.id`, errors)
    if (typeof option.id === 'string') {
      optionIds.push(option.id)
    }
    checkText(option.text, `${optionPath}.text`, errors)
  })

  checkNonEmptyString(value.answer, `${path}.answer`, errors)
  // Only compare when the options list was readable; otherwise the answer would be blamed unfairly.
  if (typeof value.answer === 'string' && options !== null && !optionIds.includes(value.answer)) {
    addError(errors, `${path}.answer`, 'answer-not-in-options')
  }
}

function checkExercise(value: unknown, path: string, errors: Errors): void {
  if (!isRecord(value)) {
    addError(errors, path, 'wrong-type')
    return
  }
  checkText(value.prompt, `${path}.prompt`, errors)
  checkCode(value.code, `${path}.code`, errors)

  const answers = checkList(
    value.acceptedAnswers,
    `${path}.acceptedAnswers`,
    errors,
    (count) => count >= 1,
  )
  answers?.forEach((answer, index) => {
    checkNonEmptyString(answer, `${path}.acceptedAnswers[${index}]`, errors)
  })

  const hints = checkList(value.hints, `${path}.hints`, errors, (count) => count === HINT_COUNT)
  hints?.forEach((hint, index) => checkText(hint, `${path}.hints[${index}]`, errors))
}

function checkBugCheck(value: unknown, path: string, errors: Errors): void {
  if (!isRecord(value)) {
    addError(errors, path, 'wrong-type')
    return
  }
  checkText(value.prompt, `${path}.prompt`, errors)
  checkText(value.why, `${path}.why`, errors)
  const lineCount = checkCode(value.code, `${path}.code`, errors)
  checkLineNumber(value.bugLine, `${path}.bugLine`, lineCount, errors)
}

function checkTracerStep(
  step: unknown,
  path: string,
  lineCount: number | null,
  errors: Errors,
): void {
  if (!isRecord(step)) {
    addError(errors, path, 'wrong-type')
    return
  }
  checkLineNumber(step.line, `${path}.line`, lineCount, errors)
  checkText(step.note, `${path}.note`, errors)

  if (step.vars === undefined) {
    addError(errors, `${path}.vars`, 'missing')
  } else if (!isRecord(step.vars)) {
    addError(errors, `${path}.vars`, 'wrong-type')
  } else {
    for (const [name, varValue] of Object.entries(step.vars)) {
      if (typeof varValue !== 'string') {
        addError(errors, `${path}.vars.${name}`, 'wrong-type')
      }
    }
  }

  if (step.condition !== undefined) {
    checkNonEmptyString(step.condition, `${path}.condition`, errors)
  }
  if (step.skippedLines !== undefined) {
    const skipped = checkList(step.skippedLines, `${path}.skippedLines`, errors, () => true)
    skipped?.forEach((line, index) => {
      checkLineNumber(line, `${path}.skippedLines[${index}]`, lineCount, errors)
    })
  }
}

function checkTracer(value: unknown, path: string, errors: Errors): void {
  if (!isRecord(value)) {
    addError(errors, path, 'wrong-type')
    return
  }
  const lineCount = checkCode(value.code, `${path}.code`, errors)

  if (value.predict === undefined) {
    addError(errors, `${path}.predict`, 'missing')
  } else if (!isRecord(value.predict)) {
    addError(errors, `${path}.predict`, 'wrong-type')
  } else {
    checkText(value.predict.question, `${path}.predict.question`, errors)
    checkText(value.predict.answer, `${path}.predict.answer`, errors)
  }

  const steps = checkList(value.steps, `${path}.steps`, errors, (count) => count >= 1)
  steps?.forEach((step, index) => {
    checkTracerStep(step, `${path}.steps[${index}]`, lineCount, errors)
  })
}

function checkGlossary(value: unknown, path: string, errors: Errors): void {
  const entries = checkList(value, path, errors, (count) => count >= 1)
  entries?.forEach((entry, index) => {
    const entryPath = `${path}[${index}]`
    if (!isRecord(entry)) {
      addError(errors, entryPath, 'wrong-type')
      return
    }
    checkNonEmptyString(entry.term, `${entryPath}.term`, errors)
    checkLanguages(entry, entryPath, errors)
  })
}

export function validateLesson(data: unknown): LessonResult {
  if (!isRecord(data)) {
    return { ok: false, errors: [{ path: '', code: 'not-an-object' }] }
  }

  const errors: Errors = []

  if (data.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    addError(errors, 'schemaVersion', 'unsupported-version')
  }
  checkNonEmptyString(data.id, 'id', errors)
  checkPositiveInteger(data.unit, 'unit', errors)
  checkPositiveInteger(data.minutes, 'minutes', errors)
  checkText(data.title, 'title', errors)

  if (data.diagram === undefined) {
    addError(errors, 'diagram', 'missing')
  } else if (!isRecord(data.diagram)) {
    addError(errors, 'diagram', 'wrong-type')
  } else {
    checkNonEmptyString(data.diagram.file, 'diagram.file', errors)
    checkText(data.diagram.alt, 'diagram.alt', errors)
  }

  const explain = checkList(data.explain, 'explain', errors, (count) => count >= 1 && count <= 4)
  explain?.forEach((paragraph, index) => checkText(paragraph, `explain[${index}]`, errors))

  checkChoice(data.task, 'task', errors)

  const check = checkList(data.check, 'check', errors, (count) => count === CHECK_QUESTION_COUNT)
  check?.forEach((question, index) => checkChoice(question, `check[${index}]`, errors))

  if (data.glossary !== undefined) checkGlossary(data.glossary, 'glossary', errors)
  if (data.exercise !== undefined) checkExercise(data.exercise, 'exercise', errors)
  if (data.bugCheck !== undefined) checkBugCheck(data.bugCheck, 'bugCheck', errors)
  if (data.tracer !== undefined) checkTracer(data.tracer, 'tracer', errors)

  if (errors.length > 0) {
    return { ok: false, errors }
  }
  // Every field was checked above, so this cast is safe.
  return { ok: true, lesson: data as unknown as Lesson }
}
