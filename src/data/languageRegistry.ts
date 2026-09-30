export type LanguageCapability = {
  bibleText: boolean;
  interface: boolean;
  textSearch: boolean;
  speechRecognition: boolean;
  languageUnderstanding: boolean;
  intentRouting: boolean;
  responseGeneration: boolean;
  speechSynthesis: boolean;
  bibleAudio: boolean;
};

export type BibleArenaLanguage = {
  id: string;
  name: string;
  nativeName: string;
  priority: number;
  status: 'baseline' | 'priority' | 'planned' | 'expandable';
  capabilities: LanguageCapability;
};

const notYetValidated: LanguageCapability = {
  bibleText: false,
  interface: false,
  textSearch: false,
  speechRecognition: false,
  languageUnderstanding: false,
  intentRouting: false,
  responseGeneration: false,
  speechSynthesis: false,
  bibleAudio: false,
};

export const bibleArenaLanguages: readonly BibleArenaLanguage[] = [
  {
    id: 'en', name: 'English', nativeName: 'English', priority: 1, status: 'baseline',
    capabilities: { bibleText: true, interface: true, textSearch: true, speechRecognition: true, languageUnderstanding: true, intentRouting: true, responseGeneration: true, speechSynthesis: true, bibleAudio: false },
  },
  { id: 'id', name: 'Idoma', nativeName: 'Idoma', priority: 2, status: 'priority', capabilities: notYetValidated },
  { id: 'ig', name: 'Igbo', nativeName: 'Igbo', priority: 3, status: 'planned', capabilities: notYetValidated },
  { id: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', priority: 4, status: 'planned', capabilities: notYetValidated },
  { id: 'ha', name: 'Hausa', nativeName: 'Hausa', priority: 5, status: 'planned', capabilities: notYetValidated },
  { id: 'tiv', name: 'Tiv', nativeName: 'Tiv', priority: 6, status: 'planned', capabilities: notYetValidated },
  { id: 'igl', name: 'Igala', nativeName: 'Igala', priority: 7, status: 'planned', capabilities: notYetValidated },
  { id: 'efi', name: 'Efik / Calabar', nativeName: 'Efik', priority: 8, status: 'planned', capabilities: notYetValidated },
];

export function getLanguage(id: string): BibleArenaLanguage | undefined {
  return bibleArenaLanguages.find((language) => language.id === id);
}

export function getLanguagesByPriority(): readonly BibleArenaLanguage[] {
  return bibleArenaLanguages;
}
