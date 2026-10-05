import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { VoiceReviewQueue } from './VoiceReviewQueue';

type Role = { language_code: string; role: 'reviewer' | 'validator'; active: boolean };

export function ReviewerWorkspace() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('voice_language_reviewer_roles')
        .select('language_code, role, active')
        .eq('user_id', user.id)
        .eq('active', true);
      if (active) {
        setRoles((data ?? []) as Role[]);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  if (loading) return <main className="page"><section className="card"><p>Loading reviewer workspace…</p></section></main>;

  if (!roles.length) {
    return <main className="page"><section className="card"><span className="eyebrow">LANGUAGE REVIEW</span><h1>Reviewer workspace</h1><p>Your account does not currently have an active language-review assignment.</p></section></main>;
  }

  return (
    <main className="page reviewer-workspace">
      <section className="card">
        <span className="eyebrow">LANGUAGE REVIEW</span>
        <h1>Reviewer workspace</h1>
        <p>Review only the languages assigned to your account.</p>
        <div className="reviewer-role-list">
          {roles.map((role) => (
            <span key={`${role.language_code}-${role.role}`} className="reviewer-role-pill">
              {role.language_code.toUpperCase()} · {role.role}
            </span>
          ))}
        </div>
      </section>
      {roles.map((role) => (
        <section key={`${role.language_code}-${role.role}`} className="card reviewer-language-section">
          <div className="reviewer-language-heading">
            <div>
              <span className="eyebrow">{role.language_code.toUpperCase()}</span>
              <h2>{role.role === 'validator' ? 'Validation queue' : 'Native review queue'}</h2>
            </div>
            <span className="reviewer-role-pill">{role.role}</span>
          </div>
          <VoiceReviewQueue languageCode={role.language_code} role={role.role} />
        </section>
      ))}
    </main>
  );
}
