import type { en } from './en'

// "typeof en" makes TypeScript complain if a key is missing here or has no match in en.ts.
export const tl: typeof en = {
  appName: 'Hakbang',
  themeLabel: 'Theme',
  themeDark: 'Madilim',
  themeLight: 'Maliwanag',
  switchTheme: 'Palitan ang theme',
  switchLanguage: 'Palitan sa English',
}
