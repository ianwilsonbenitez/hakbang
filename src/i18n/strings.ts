import type { Language } from '../lib/language'
import { en } from './en'
import { tl } from './tl'

export type Strings = typeof en

export const strings: Record<Language, Strings> = { en, tl }
