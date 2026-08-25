'use client';

import { useEffect, useMemo, useState } from 'react';

type Stage = 'detected' | 'review' | 'executing' | 'resolved';

const services = [
  { id: 'edge', name: 'edge-gateway', x: '12%', y: '45%', meta: '12.4k rpm', tone: 'healthy' },
  { id: 'checkout', name: 'checkout-api', x: '36%', y: '24%', meta: '184ms p95', tone: 'healthy' },
  { id: 'payment', name: 'payment-router', x: '61%', y: '44%', meta: '2.8s p95', tone: 'danger' },
  { id: 'ledger', name: 'ledger-db', x: '86%', y: '21%', meta: '42ms p95', tone: 'healthy' },
  { id: 'fraud', name: 'fraud-engine', x: '86%', y: '69%', meta: 'degraded', tone: 'warning' },
];

const activity = [
  { time: '14:31:58', label: 'Anomaly detected', detail: 'p95 crossed 2.5s on payment-router', tone: 'red' },
  { time: '14:32:01', label: 'Trace correlation complete', detail: '1.8M spans · 24 services · 187 edges', tone: 'violet' },
  { time: '14:32:04', label: 'Deploy linked', detail: '#a82f1c changed pool.max from 80 → 20', tone: 'amber' },
  { time: '14:32:07', label: 'Safe action prepared', detail: 'Rollback plan validated against SLO policy', tone: 'green' },
];

const bars = [22, 28, 31, 29, 34, 41, 48, 66, 82, 97, 73, 58, 52, 45, 42, 38, 34, 31];

export default function Home() {
  const [stage, setStage] = useState<Stage>('detected');
  const [selected, setSelected] = useState('payment');
  const [tab, setTab] = useState<'analysis' | 'timeline' | 'runbook'>('analysis');
  const [commandOpen, setCommandOpen] = useState(false);
  const [elapsed, setElapsed] = useState(462);

  useEffect(() => {
    if (stage === 'resolved') return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (stage !== 'executing') return;
    const timer = window.setTimeout(() => setStage('resolved'), 3800);
    return () => window.clearTimeout(timer);
  }, [stage]);

  const selectedService = services.find((service) => service.id === selected) ?? services[2];
  const time = useMemo(() => `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`, [elapsed]);
  const isResolved = stage === 'resolved';

  function runAction() {
    if (stage === 'detected') setStage('review');
    else if (stage === 'review') setStage('executing');
    else if (stage === 'resolved') {
      setElapsed(462);
      setStage('detected');
    }
  }

  return (
    <main className={`app-shell stage-${stage}`}>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">H</span><span>HELIOS</span><em>OPS INTELLIGENCE</em></div>
        <nav className="main-nav" aria-label="Product navigation"><button className="active">COMMAND</button><button>FLEET</button><button>INTELLIGENCE</button></nav>
        <div className="system-status"><i /> ALL SYSTEMS OBSERVED <span>14:32:09 UTC</span></div>
        <button className="avatar" aria-label="Open operator profile">AK</button>
      </header>

      <section className="command-row">
        <div>
          <p className="eyebrow"><span>INCIDENT #2847</span> / {isResolved ? 'RECOVERED' : 'LIVE COMMAND'}</p>
          <h1>{isResolved ? 'Payment systems recovered' : 'Payment latency cascade'}</h1>
        </div>
        <div className="metrics">
          <div><span>SEVERITY</span><strong className={isResolved ? 'resolved' : 'severity'}>{isResolved ? 'STABLE' : 'SEV-1'}</strong></div>
          <div><span>IMPACT</span><strong>{isResolved ? '$0 / MIN' : '$18.4K / MIN'}</strong></div>
          <div><span>{isResolved ? 'RESOLVED IN' : 'MTTR'}</span><strong>{time}</strong></div>
          <button onClick={() => setCommandOpen(true)} aria-label="Open command palette">⌘&nbsp; COMMAND</button>
        </div>
      </section>

      <section className="workspace">
        <div className="topology-panel panel">
          <div className="panel-heading">
            <div><span className="kicker">SERVICE TOPOLOGY</span><h2>Blast radius</h2></div>
            <div className="heading-actions"><button>−</button><button>+</button><div className="live-chip"><i /> LIVE TRACE</div></div>
          </div>
          <div className="topology" aria-label="Live service dependency map">
            <div className="scope-ring ring-one" /><div className="scope-ring ring-two" />
            <div className="signal-path path-a" /><div className="signal-path path-b" /><div className="signal-path path-c" /><div className="signal-path path-d" />
            {services.map((service) => (
              <button
                key={service.id}
                className={`service-node ${service.id === 'payment' && isResolved ? 'healthy' : service.tone} ${selected === service.id ? 'selected' : ''}`}
                style={{ left: service.x, top: service.y }}
                onClick={() => setSelected(service.id)}
                aria-label={`Inspect ${service.name}`}
              >
                <b>{service.name.slice(0, 2).toUpperCase()}</b><span>{service.name}</span><small>{service.id === 'payment' && isResolved ? '156ms p95' : service.meta}</small>
              </button>
            ))}
            {!isResolved && <div className="trace-pulse" />}
            <div className="service-inspector"><span>INSPECTING</span><strong>{selectedService.name}</strong><small>{selectedService.id === 'payment' && isResolved ? 'Nominal · 156ms p95' : selectedService.meta}</small></div>
            <div className="topology-legend"><span><i className="ok" /> Nominal</span><span><i className="warn" /> Degraded</span><span><i className="critical" /> Critical</span></div>
          </div>
          <div className="topology-footer"><span>24 services</span><span>187 edges</span><span className={isResolved ? 'cool' : 'hot'}>● {isResolved ? 'no critical paths' : '1 critical path'}</span><span>Updated 180ms ago</span></div>
        </div>

        <aside className="intel-panel panel">
          <div className="intel-tabs" role="tablist">
            {(['analysis', 'timeline', 'runbook'] as const).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item}</button>)}
          </div>

          {tab === 'analysis' && <>
            <div className="panel-heading intel-heading"><div><span className="kicker">HELIOS AI</span><h2>{isResolved ? 'Recovery verified' : 'Root cause analysis'}</h2></div><span className="confidence">94% CONF.</span></div>
            <div className="finding">
              <span className="finding-index">01</span>
              <div><strong>{isResolved ? 'All SLOs back in policy' : 'Connection pool exhaustion'}</strong><p>{isResolved ? 'Error rate and latency returned to baseline across all downstream services.' : <>payment-router began rejecting connections 46s after deploy <code>#a82f1c</code>.</>}</p></div>
            </div>
            <div className="evidence"><span>PRIMARY SIGNAL</span><strong>{isResolved ? 'RECOVERY_CONFIRMED' : 'DB_POOL_WAIT'}</strong><b className={isResolved ? 'positive' : ''}>{isResolved ? '−96%' : '+847%'}</b></div>
            <div className={`recommendation ${isResolved ? 'complete' : ''}`}>
              <span>{stage === 'review' ? 'ACTION REVIEW' : isResolved ? 'ACTION COMPLETE' : 'RECOMMENDED ACTION'}</span>
              <h3>{isResolved ? 'Rollback succeeded' : 'Rollback payment-router'}</h3>
              <p>{stage === 'review' ? 'Scope: 6 pods · Region: us-east-1 · No schema changes detected.' : isResolved ? 'Version #8bd712 is healthy on all 6 pods. No customer action required.' : <>Projected recovery in <b>2m 40s</b> with 87% confidence.</>}</p>
              <button onClick={runAction} disabled={stage === 'executing'}>
                {stage === 'detected' && <>REVIEW &amp; EXECUTE <span>→</span></>}
                {stage === 'review' && <>CONFIRM ROLLBACK <span>⌘ ↵</span></>}
                {stage === 'executing' && <><i className="spinner" /> ROLLING BACK 6 PODS</>}
                {stage === 'resolved' && <>REPLAY INCIDENT <span>↻</span></>}
              </button>
            </div>
            <div className="agents"><span>AGENT ACTIVITY</span><p><i className="violet" /> Trace agent correlated 1.8M spans <b>4.2s</b></p><p><i className="green" /> Runbook agent found safe rollback <b>2.1s</b></p><p><i className="cyan" /> Policy agent verified change window <b>0.8s</b></p></div>
          </>}

          {tab === 'timeline' && <div className="timeline-view"><span className="kicker">CORRELATED EVENT STREAM</span>{activity.map((item, index) => <div className="timeline-item" key={item.time}><i className={item.tone} /><time>{item.time}</time><div><strong>{item.label}</strong><p>{item.detail}</p></div>{index === 1 && <span className="ai-tag">AI</span>}</div>)}</div>}

          {tab === 'runbook' && <div className="runbook-view"><span className="kicker">VERIFIED AUTOMATION</span><h3>Safe service rollback</h3><p>Generated from 142 previous incidents and validated against current infrastructure state.</p>{['Freeze deploy pipeline', 'Drain payment-router traffic', 'Restore version #8bd712', 'Verify golden signals'].map((step, index) => <div className="runbook-step" key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong><b>{index === 0 && stage !== 'detected' ? 'DONE' : 'READY'}</b></div>)}<button className="secondary-action" onClick={() => setTab('analysis')}>RETURN TO ACTION →</button></div>}
        </aside>
      </section>

      <section className="telemetry-grid">
        <article className="telemetry-card panel"><div className="card-label"><span>PAYMENT-ROUTER / P95 LATENCY</span><b className={isResolved ? 'positive' : ''}>{isResolved ? '156 MS' : '2,847 MS'}</b></div><div className={`spark-bars ${isResolved ? 'recovered' : ''}`}>{bars.map((height, index) => <i key={index} style={{ height: `${isResolved && index > 9 ? Math.max(15, height / 3) : height}%` }} />)}</div><div className="axis"><span>−15m</span><span>deploy #a82f1c</span><span>now</span></div></article>
        <article className="telemetry-card panel change-card"><div className="card-label"><span>CHANGE INTELLIGENCE</span><b>1 CORRELATED</b></div><div className="commit"><span>DEPLOY</span><strong>#a82f1c</strong><small>payment-router v2.14.7</small><b>46s before anomaly</b></div><div className="diff"><span>pool.max</span><del>80</del><ins>20</ins></div></article>
        <article className="telemetry-card panel score-card"><div className="card-label"><span>AUTONOMY SCORE</span><b>LEVEL 4</b></div><div className="score"><strong>87</strong><span>/100</span></div><p>Safe to execute with human confirmation.</p><div className="score-line"><i /></div></article>
      </section>

      <footer><span>HELIOS SIMULATION ENVIRONMENT</span><span>1.8M SPANS INGESTED · 24 SERVICES · 99.99% SLO</span><span>BUILT FOR HIGH-STAKES SYSTEMS</span></footer>

      {commandOpen && <div className="command-overlay" role="presentation" onMouseDown={() => setCommandOpen(false)}>
        <div className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}>
          <div className="command-input"><span>⌘</span><input autoFocus placeholder="Ask Helios or run a command…" aria-label="Command search" /><kbd>ESC</kbd></div>
          <span className="command-section">SUGGESTED</span>
          <button onClick={() => { setCommandOpen(false); setTab('analysis'); setStage('review'); }}><i>↶</i><span><strong>Rollback payment-router</strong><small>Safest remediation · 87% confidence</small></span><kbd>↵</kbd></button>
          <button onClick={() => { setCommandOpen(false); setTab('timeline'); }}><i>⌁</i><span><strong>Explain the root cause</strong><small>Open correlated incident timeline</small></span></button>
          <button onClick={() => { setCommandOpen(false); setSelected('fraud'); }}><i>◎</i><span><strong>Inspect downstream impact</strong><small>Focus fraud-engine and dependencies</small></span></button>
          <div className="command-hint"><span>↑↓ NAVIGATE</span><span>↵ SELECT</span><span>ESC CLOSE</span></div>
        </div>
      </div>}

      {isResolved && <div className="recovery-toast"><i>✓</i><div><strong>Incident contained</strong><span>All golden signals recovered</span></div><button onClick={() => setStage('detected')}>×</button></div>}
    </main>
  );
}
