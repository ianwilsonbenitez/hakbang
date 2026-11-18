import { useLanguage } from './language-context'
import type { LessonError, LessonErrorCode } from './lib/lesson'
import { formatLessonError, limitErrors } from './lib/lesson-errors'
import type { en } from './i18n/en'

const MAX_SHOWN = 5

// Every code the validator can give has one text in each language.
const codeKeys: Record<LessonErrorCode, keyof typeof en> = {
  'not-an-object': 'lessonErrorNotAnObject',
  missing: 'lessonErrorMissing',
  'wrong-type': 'lessonErrorWrongType',
  'missing-en': 'lessonErrorMissingEn',
  'missing-tl': 'lessonErrorMissingTl',
  'empty-text': 'lessonErrorEmptyText',
  'wrong-count': 'lessonErrorWrongCount',
  'unsupported-version': 'lessonErrorUnsupportedVersion',
  'code-too-long': 'lessonErrorCodeTooLong',
  'line-out-of-range': 'lessonErrorLineOutOfRange',
  'answer-not-in-options': 'lessonErrorAnswerNotInOptions',
}

export function LessonInvalid({ errors }: { errors: LessonError[] }) {
  const { t } = useLanguage()
  const { shown, hiddenCount } = limitErrors(errors, MAX_SHOWN)

  return (
    <div role="alert" className="text-review">
      <p className="font-semibold">{t.lessonInvalid}</p>
      {shown.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-6 font-mono text-sm">
          {shown.map((error) => (
            <li key={`${error.path}-${error.code}`}>
              {formatLessonError(error, t[codeKeys[error.code]])}
            </li>
          ))}
        </ul>
      )}
      {hiddenCount > 0 && (
        <p className="mt-2 text-sm">
          + {hiddenCount} {t.lessonErrorsMore}
        </p>
      )}
    </div>
  )
}
