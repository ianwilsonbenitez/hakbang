import type { en } from './en'

// "typeof en" makes TypeScript complain if a key is missing here or has no match in en.ts.
export const tl: typeof en = {
  appName: 'Hakbang',
  themeLabel: 'Theme',
  themeDark: 'Madilim',
  themeLight: 'Maliwanag',
  switchTheme: 'Palitan ang theme',
  switchLanguage: 'Palitan sa English',
  unitLabel: 'Unit',
  minutesShort: 'min',
  stepPicture: 'Larawan',
  stepExplain: 'Paliwanag',
  stepTry: 'Subukan mo',
  stepsLabel: 'Mga hakbang ng lesson',
  diagramSoon: 'Malapit nang lumabas ang diagram. Ito ang ipapakita nito:',
  back: 'Bumalik',
  next: 'Susunod',
  checkAnswer: 'I-check ang sagot',
  tryAgain: 'Subukan ulit',
  answerCorrect: 'Tama!',
  answerWrong: 'Hindi pa tama.',
  whyLabel: 'Bakit',
  lessonInvalid: 'Hindi valid ang lesson file na ito, kaya hindi ito maipapakita.',
}
