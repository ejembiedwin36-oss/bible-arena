import type { Session } from '@supabase/supabase-js';
import { LanguageSettingsPanel } from '../components/LanguageSettingsPanel';

type SettingsPageProps = {
  session: Session;
};

export function SettingsPage({ session }: SettingsPageProps) {
  return (
    <main className="settings-page">
      <section className="card">
        <span className="eyebrow">SETTINGS</span>
        <h1>Your preferences</h1>
        <p>Choose how you want to read, use, hear, and interact with Bible Arena.</p>
      </section>

      <LanguageSettingsPanel session={session} />
    </main>
  );
}
