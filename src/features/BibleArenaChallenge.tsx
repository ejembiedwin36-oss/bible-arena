import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { starterChallengeQuestions } from '../data/starterChallenge';

export function BibleArenaChallenge() {
  const navigate = useNavigate();
  const questions = useMemo(() => starterChallengeQuestions, []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = questions[index];

  function choose(choice: string) {
    if (selected) return;
    setSelected(choice);
    if (choice === current.answer) setScore(value => value + 1);
  }

  function next() {
    if (!selected) return;
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex(value => value + 1);
    setSelected(null);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return <main className="placeholder card">
      <span className="eyebrow">BIBLE ARENA · STARTER CHALLENGE</span>
      <h1>Challenge complete</h1>
      <p>You scored <strong>{score}/{questions.length}</strong>.</p>
      <p>This starter challenge works without paid AI or GPU hosting. Future Arena challenges can be published from verified Bible Arena content.</p>
      <div className="bookmark-actions">
        <button onClick={restart}>Try again</button>
        <button onClick={() => navigate('/bible')}>Read the Bible →</button>
      </div>
    </main>;
  }

  return <main className="placeholder card">
    <div className="page-heading">
      <div>
        <span className="eyebrow">BIBLE ARENA · STARTER CHALLENGE</span>
        <h1>Test your Bible knowledge</h1>
        <p>Question {index + 1} of {questions.length}</p>
      </div>
      <span className="count-chip">Score {score}</span>
    </div>
    <section className="settings-section">
      <h2>{current.question}</h2>
      <div className="language-grid">
        {current.choices.map(choice => <button key={choice} disabled={Boolean(selected)} onClick={() => choose(choice)}>{choice}</button>)}
      </div>
      {selected && <div className={selected === current.answer ? 'notice success' : 'notice error'}>
        {selected === current.answer ? 'Correct ✓' : `Not quite. The answer is ${current.answer}.`}
      </div>}
      {selected && <div className="bookmark-actions">
        <button onClick={() => navigate(`/bible/${current.bookKey}/${current.chapter}`)}>Check {current.reference} →</button>
        <button onClick={next}>{index === questions.length - 1 ? 'See result' : 'Next question →'}</button>
      </div>}
    </section>
  </main>;
}
