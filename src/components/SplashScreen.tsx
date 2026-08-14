import { useEffect, useState } from 'react';

const stages = [
  { code: '01 / STRUCTURE', label: 'finding your signal' },
  { code: '02 / POLISH', label: 'shaping the story' },
  { code: '03 / PROVE IT', label: 'making impact visible' },
  { code: '04 / MOVE FORWARD', label: 'getting you ready' },
];

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stageTimer = reduced ? undefined : window.setInterval(() => setStage((current) => Math.min(current + 1, stages.length - 1)), 430);
    const leaveTimer = window.setTimeout(() => setLeaving(true), reduced ? 240 : 1640);
    const hideTimer = window.setTimeout(() => setVisible(false), reduced ? 500 : 2180);
    return () => {
      if (stageTimer) window.clearInterval(stageTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    window.setTimeout(() => setVisible(false), 560);
  };

  if (!visible) return null;
  const current = stages[stage];

  return (
    <div className={`flow-splash${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading FlowCreate">
      <div className="flow-splash-grid" aria-hidden="true" />
      <div className="flow-splash-orb flow-splash-orb-one" aria-hidden="true" />
      <div className="flow-splash-orb flow-splash-orb-two" aria-hidden="true" />
      <header className="flow-splash-topline"><span>FlowCreate / resume intelligence</span><strong>{current.code}</strong></header>
      <main className="flow-splash-center">
        <div className="flow-splash-documents" aria-hidden="true">
          <div className="flow-splash-document flow-splash-document-back"><i /><i /><i /></div>
          <div className="flow-splash-document flow-splash-document-front"><b>FC</b><i /><i /><i /><span /></div>
          <div className="flow-splash-check">✓</div>
        </div>
        <p className="flow-splash-eyebrow">Your next chapter, in focus</p>
        <h1>Build a resume that <em>moves.</em></h1>
        <p className="flow-splash-status"><i /> {current.label}</p>
      </main>
      <footer className="flow-splash-bottomline">
        <div className="flow-splash-progress"><span style={{ transform: `scaleX(${(stage + 1) / stages.length})` }} /></div>
        <span className="flow-splash-note">clarity in / confidence out</span>
        <button type="button" onClick={dismiss}>skip intro</button>
      </footer>
    </div>
  );
};

export default SplashScreen;
