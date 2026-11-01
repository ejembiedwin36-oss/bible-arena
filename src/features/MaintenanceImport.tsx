import { useState } from 'react';
import { runKjvBulkImport, type KjvImportResult } from '../lib/maintenance';

export function MaintenanceImport() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<KjvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runImport() {
    if (running) return;
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      setResult(await runKjvBulkImport());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The KJV import failed.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="card">
      <span className="eyebrow">MAINTENANCE</span>
      <h2>KJV Scripture import</h2>
      <p>
        Run the secured KJV importer using your current Bible Arena session. This action never
        exposes the service-role key and must be explicitly started.
      </p>
      <button type="button" disabled={running} onClick={runImport}>
        {running ? 'Importing KJV…' : 'Run KJV import'}
      </button>
      {result && (
        <div className={result.completed ? 'notice success' : 'notice'}>
          <strong>{result.completed ? 'KJV import completed.' : 'KJV import finished with checks pending.'}</strong>
          <p>{result.total.toLocaleString()} verses are currently stored for KJV.</p>
          <p>{result.processed.toLocaleString()} source verses were processed in this run.</p>
          {result.failures.length > 0 && <p>{result.failures.length} book import(s) reported an error.</p>}
        </div>
      )}
      {error && <div className="notice error">{error}</div>}
    </section>
  );
}
