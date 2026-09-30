import { useMemo, useState } from 'react';
import { bibleArenaLanguages, type BibleArenaLanguage } from '../data/languageRegistry';
import {
  createLanguagePreference,
  setBibleLanguage,
  setInterfaceLanguage,
  setResponseLanguage,
  setVoiceInputLanguage,
  type LanguagePreference,
} from '../services/languagePreferences';

type LanguageSettingsPanelProps = {
  initialPreferences?: Partial<LanguagePreference>;
  onChange?: (preferences: LanguagePreference) => void;
};

type PreferenceKey = keyof LanguagePreference;

const fields: Array<{ key: PreferenceKey; label: string; capability: keyof BibleArenaLanguage['capabilities'] }> = [
  { key: 'bibleLanguageId', label: 'Bible text', capability: 'bibleText' },
  { key: 'interfaceLanguageId', label: 'Interface', capability: 'interface' },
  { key: 'voiceInputLanguageId', label: 'Voice input', capability: 'speechRecognition' },
  { key: 'responseLanguageId', label: 'Response and audio', capability: 'speechSynthesis' },
];

const setters: Record<PreferenceKey, (preferences: LanguagePreference, languageId: string) => LanguagePreference> = {
  bibleLanguageId: setBibleLanguage,
  interfaceLanguageId: setInterfaceLanguage,
  voiceInputLanguageId: setVoiceInputLanguage,
  responseLanguageId: setResponseLanguage,
};

function supports(language: BibleArenaLanguage, capability: keyof BibleArenaLanguage['capabilities']) {
  return language.capabilities[capability];
}

export function LanguageSettingsPanel({ initialPreferences, onChange }: LanguageSettingsPanelProps) {
  const [preferences, setPreferences] = useState(() => createLanguagePreference(initialPreferences));
  const languages = useMemo(() => [...bibleArenaLanguages].sort((a, b) => a.priority - b.priority), []);

  function update(key: PreferenceKey, languageId: string) {
    const next = setters[key](preferences, languageId);
    setPreferences(next);
    onChange?.(next);
  }

  return (
    <section className="language-settings card" aria-labelledby="language-settings-title">
      <div className="language-settings-heading">
        <div>
          <span className="eyebrow">LANGUAGE</span>
          <h2 id="language-settings-title">Choose how you use Bible Arena</h2>
          <p>Text, interface, voice input, and spoken responses can have different languages.</p>
        </div>
      </div>

      <div className="language-settings-grid">
        {fields.map((field) => (
          <label key={field.key} className="language-setting-field">
            <span>{field.label}</span>
            <select value={preferences[field.key]} onChange={(event) => update(field.key, event.target.value)}>
              {languages.map((language) => {
                const available = supports(language, field.capability);
                return (
                  <option key={language.id} value={language.id} disabled={!available}>
                    {language.name} — {available ? 'available' : 'coming as validated'}
                  </option>
                );
              })}
            </select>
          </label>
        ))}
      </div>

      <div className="language-settings-note">
        <strong>Our language promise</strong>
        <span>As each language is properly validated, Bible Arena can add its text, search, hearing, understanding, response, speaking, and audio capabilities without changing this settings model.</span>
      </div>
    </section>
  );
}
