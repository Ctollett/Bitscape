import { useEffect, useRef, useState, useCallback } from 'react';
import { getWaveform, getSpectrum } from '../audio/engine';

const W = 1200;
const SCOPE_H = 100;
const SPEC_H  = 160;
const ANALYSIS_H = 72;

const FREQ_LABELS = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

function freqToX(hz: number, nyquist: number, w: number): number {
  const t = (Math.log10(hz) - Math.log10(20)) / (Math.log10(nyquist) - Math.log10(20));
  return Math.max(0, Math.min(w, t * w));
}

// ─── Signal analysis ───────────────────────────────────────────────────────────
interface Analysis {
  hasSignal: boolean;
  fundamentalHz: number;
  fundamentalDb: number;
  sidebandCount: number;
  estimatedBeta: number;
  isFM: boolean;
  thd: number;        // total harmonic distortion proxy (sideband energy / fundamental)
  lines: string[];
}

function analyzeSpectrum(data: Uint8Array, binCount: number, nyquist: number): Analysis {
  const hzPerBin = nyquist / binCount;
  const noSignal: Analysis = {
    hasSignal: false, fundamentalHz: 0, fundamentalDb: 0,
    sidebandCount: 0, estimatedBeta: 0, isFM: false, thd: 0,
    lines: ['— no signal —'],
  };

  if (!binCount || !nyquist) return noSignal;

  // Find peak bin (skip DC / sub-20 Hz)
  const minBin = Math.ceil(20 / hzPerBin);
  let peakVal = 0, peakBin = minBin;
  for (let i = minBin; i < binCount; i++) {
    if (data[i] > peakVal) { peakVal = data[i]; peakBin = i; }
  }

  if (peakVal < 20) return { ...noSignal, lines: ['— silence —'] };

  const fundamentalHz = peakBin * hzPerBin;
  // Convert 0-255 back to approximate dBFS (minDecibels=-120, maxDecibels=0)
  const fundamentalDb = -120 + (peakVal / 255) * 120;

  // Look for sidebands: scan ±10 bins around n*fundamental for n=1..8
  // FM sidebands appear at fc ± n*fm, but we don't know fm directly.
  // Instead: look for peaks > threshold near integer multiples of the fundamental.
  // Threshold ~40dB below fundamental (in the linear byte scale, 1dB ≈ 2.125 bytes)
  // This rejects Blackman FFT window leakage (~-74dB sidelobes) while catching real FM sidebands
  const DB_PER_BYTE = 120 / 255;
  const threshold = Math.max(40, peakVal - Math.round(15 / DB_PER_BYTE));
  const halfwidth = Math.max(2, Math.round(0.02 * peakBin)); // ±2% of fundamental bin

  let sidebandEnergy = 0;
  let fundamentalEnergy = peakVal * peakVal;
  let sidebandCount = 0;
  const sidebandHzList: number[] = [];

  for (let n = 2; n <= 12; n++) {
    const centerBin = peakBin * n;
    if (centerBin + halfwidth >= binCount) break;

    // Find local max around this harmonic
    let localMax = 0;
    for (let k = centerBin - halfwidth; k <= centerBin + halfwidth; k++) {
      if (k >= 0 && k < binCount && data[k] > localMax) localMax = data[k];
    }

    if (localMax >= threshold) {
      sidebandCount++;
      sidebandEnergy += localMax * localMax;
      sidebandHzList.push(centerBin * hzPerBin);
    }
  }

  // Also scan between harmonics for non-integer FM sidebands
  // (FM sidebands are at fc ± k*fm, which may not be integer multiples of fc)
  let nonHarmonicPeaks = 0;
  const nonHarmonicThreshold = Math.max(50, peakVal - Math.round(35 / DB_PER_BYTE));
  for (let i = minBin; i < binCount; i++) {
    // Skip bins near the fundamental or its harmonics
    const nearHarmonic = [1, 2, 3, 4, 5, 6, 7, 8].some(
      n => Math.abs(i - peakBin * n) <= halfwidth * 2
    );
    if (nearHarmonic) continue;
    if (data[i] >= nonHarmonicThreshold && data[i] >= data[i - 1] && data[i] >= data[i + 1]) {
      nonHarmonicPeaks++;
    }
  }

  const isFM = sidebandCount >= 1 || nonHarmonicPeaks >= 2;
  const thd = fundamentalEnergy > 0 ? Math.sqrt(sidebandEnergy / fundamentalEnergy) : 0;

  // Rough β estimate from sideband count
  // β ≈ 0: no sidebands, β ≈ 1: 2-3 sidebands, β ≈ 2: 4-5, β ≈ 5: 8+
  const betaTable: [number, number][] = [
    [0, 0], [1, 0.5], [2, 1.0], [3, 1.5], [4, 2.0], [5, 2.5],
    [6, 3.5], [8, 5.0], [10, 7.0],
  ];
  let estimatedBeta = 0;
  for (const [count, beta] of betaTable) {
    if (sidebandCount >= count) estimatedBeta = beta;
  }

  const fmtHz = (hz: number) =>
    hz >= 1000 ? `${(hz / 1000).toFixed(2)}kHz` : `${Math.round(hz)}Hz`;

  const lines: string[] = [
    `Fundamental  ${fmtHz(fundamentalHz)}  ${fundamentalDb.toFixed(1)} dBFS`,
    `Harmonics    ${sidebandCount} detected${nonHarmonicPeaks > 0 ? `  +${nonHarmonicPeaks} non-harmonic peaks` : ''}   FM ${isFM ? `ACTIVE  β ≈ ${estimatedBeta.toFixed(1)}  THD ${(thd * 100).toFixed(0)}%` : 'INACTIVE (pure tone)'}`,
    sidebandHzList.length
      ? `Sideband Hz  ${sidebandHzList.slice(0, 6).map(fmtHz).join('  ')}`
      : '',
  ].filter(Boolean);

  return { hasSignal: true, fundamentalHz, fundamentalDb, sidebandCount, estimatedBeta, isFM, thd, lines };
}

// ─── Oscilloscope ─────────────────────────────────────────────────────────────
function drawScope(ctx: CanvasRenderingContext2D, waveform: Float32Array) {
  const w = W, h = SCOPE_H;
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

  const N = waveform.length;
  if (!N) return;

  ctx.strokeStyle = '#4af';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * w;
    const y = (0.5 - waveform[i] * 0.48) * h;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#555';
  ctx.font = '10px monospace';
  ctx.fillText('SCOPE', 6, 14);
}

// ─── Spectrum ─────────────────────────────────────────────────────────────────
function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  binCount: number,
  nyquist: number,
  analysis?: Analysis,
) {
  const w = W, h = SPEC_H;
  const labelH = 18;
  const plotH = h - labelH;

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, w, h);

  ctx.font = '9px monospace';
  for (let i = 0; i <= 6; i++) {
    const db = -120 + i * 20;
    const y = plotH * (1 - i / 6);
    ctx.strokeStyle = db === 0 ? '#383838' : '#222';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillStyle = '#555';
    ctx.fillText(`${db}`, 2, y - 2);
  }

  if (!binCount || !nyquist) {
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.fillText('no audio signal', 20, plotH / 2 + 4);
    return;
  }

  for (const hz of FREQ_LABELS) {
    if (hz >= nyquist) continue;
    const x = freqToX(hz, nyquist, w);
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, plotH); ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    const label = hz >= 1000 ? `${hz / 1000}k` : `${hz}`;
    ctx.fillText(label, x - 8, h - 4);
  }

  const hzPerBin = nyquist / binCount;
  const pts: [number, number][] = [];
  for (let i = 1; i < binCount; i++) {
    const hz = i * hzPerBin;
    if (hz < 20) continue;
    const x = freqToX(hz, nyquist, w);
    const y = plotH * (1 - data[i] / 255);
    pts.push([x, y]);
  }

  if (!pts.length) return;

  ctx.beginPath();
  ctx.moveTo(pts[0][0], plotH);
  for (const [x, y] of pts) ctx.lineTo(x, y);
  ctx.lineTo(pts[pts.length - 1][0], plotH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(40, 160, 255, 0.18)';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = '#4af';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Peak marker
  if (analysis?.hasSignal) {
    const peakX = freqToX(analysis.fundamentalHz, nyquist, w);
    const peakY = plotH * (1 - (analysis.fundamentalDb + 120) / 120);
    ctx.beginPath();
    ctx.arc(peakX, peakY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#4f8';
    ctx.fill();

    const fmtHz = (hz: number) => hz >= 1000 ? `${(hz / 1000).toFixed(1)}k` : `${Math.round(hz)}`;
    const label = `${fmtHz(analysis.fundamentalHz)}Hz  ${analysis.fundamentalDb.toFixed(1)}dB`;
    const lx = Math.min(peakX + 6, w - ctx.measureText(label).width - 4);
    ctx.fillStyle = '#4f8';
    ctx.font = '9px monospace';
    ctx.fillText(label, lx, Math.max(peakY - 4, 10));
  }

  ctx.fillStyle = '#555';
  ctx.font = '10px monospace';
  ctx.fillText('SPECTRUM', 6, 14);
}

// ─── Analysis panel ───────────────────────────────────────────────────────────
function drawAnalysis(ctx: CanvasRenderingContext2D, analysis: Analysis) {
  const w = W, h = ANALYSIS_H;
  ctx.fillStyle = '#0e0e0e';
  ctx.fillRect(0, 0, w, h);

  ctx.font = '11px monospace';
  const lineH = 16;
  const startY = 16;

  analysis.lines.forEach((line, i) => {
    // Highlight FM ACTIVE / INACTIVE differently
    if (line.includes('FM ACTIVE')) {
      const parts = line.split('FM ACTIVE');
      ctx.fillStyle = '#888';
      ctx.fillText(parts[0] + 'FM ', 12, startY + i * lineH);
      const w0 = ctx.measureText(parts[0] + 'FM ').width;
      ctx.fillStyle = '#4f8';
      ctx.fillText('ACTIVE', 12 + w0, startY + i * lineH);
      const w1 = w0 + ctx.measureText('ACTIVE').width;
      ctx.fillStyle = '#888';
      ctx.fillText(parts[1], 12 + w1, startY + i * lineH);
    } else if (line.includes('FM INACTIVE')) {
      const parts = line.split('FM INACTIVE');
      ctx.fillStyle = '#888';
      ctx.fillText(parts[0] + 'FM ', 12, startY + i * lineH);
      const w0 = ctx.measureText(parts[0] + 'FM ').width;
      ctx.fillStyle = '#f84';
      ctx.fillText('INACTIVE', 12 + w0, startY + i * lineH);
      const w1 = w0 + ctx.measureText('INACTIVE').width;
      ctx.fillStyle = '#888';
      ctx.fillText(parts[1], 12 + w1, startY + i * lineH);
    } else {
      ctx.fillStyle = '#888';
      ctx.fillText(line, 12, startY + i * lineH);
    }
  });
}

// ─── Snapshot type ────────────────────────────────────────────────────────────
interface Snapshot {
  id: number;
  label: string;
  analysis: Analysis;
  spectrum: number[];   // sampled at FREQ_LABELS bins for compact storage
  ts: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function MonitorPanel() {
  const scopeRef    = useRef<HTMLCanvasElement>(null);
  const specRef     = useRef<HTMLCanvasElement>(null);
  const analysisRef = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef(0);
  const latestRef   = useRef<{ analysis: Analysis; data: Uint8Array; binCount: number; nyquist: number } | null>(null);
  const [open, setOpen]         = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [label, setLabel]       = useState('');
  const [copied, setCopied]     = useState(false);
  const snapIdRef = useRef(0);

  useEffect(() => {
    if (!open) { cancelAnimationFrame(rafRef.current); return; }

    const tick = () => {
      const scopeCtx    = scopeRef.current?.getContext('2d');
      const specCtx     = specRef.current?.getContext('2d');
      const analysisCtx = analysisRef.current?.getContext('2d');

      if (scopeCtx) drawScope(scopeCtx, getWaveform());

      const { data, binCount, nyquist } = getSpectrum();
      const analysis = analyzeSpectrum(data, binCount, nyquist);
      latestRef.current = { analysis, data, binCount, nyquist };
      if (specCtx)     drawSpectrum(specCtx, data, binCount, nyquist, analysis);
      if (analysisCtx) drawAnalysis(analysisCtx, analysis);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open]);

  const capture = useCallback(() => {
    const latest = latestRef.current;
    if (!latest) return;
    const { analysis, data, binCount, nyquist } = latest;
    const hzPerBin = nyquist / binCount;

    // Sample spectrum at FREQ_LABELS frequencies (0-255)
    const spectrum = FREQ_LABELS.map(hz => {
      const bin = Math.round(hz / hzPerBin);
      return bin < data.length ? data[bin] : 0;
    });

    const snap: Snapshot = {
      id: ++snapIdRef.current,
      label: label.trim() || `Test ${snapIdRef.current}`,
      analysis,
      spectrum,
      ts: new Date().toLocaleTimeString(),
    };
    setSnapshots(prev => [...prev, snap]);
    setLabel('');
  }, [label]);

  const copyLog = useCallback(() => {
    const rows = snapshots.map(s => ({
      label: s.label,
      ts: s.ts,
      hasSignal: s.analysis.hasSignal,
      fundamentalHz: Math.round(s.analysis.fundamentalHz),
      fundamentalDb: +s.analysis.fundamentalDb.toFixed(1),
      sidebandCount: s.analysis.sidebandCount,
      estimatedBeta: +s.analysis.estimatedBeta.toFixed(2),
      isFM: s.analysis.isFM,
      thd: +(s.analysis.thd * 100).toFixed(1),
      spectrumAt: Object.fromEntries(FREQ_LABELS.map((hz, i) => [hz >= 1000 ? `${hz/1000}kHz` : `${hz}Hz`, s.spectrum[i]])),
    }));
    navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [snapshots]);

  const btnStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid #333',
    color: '#666',
    fontFamily: 'monospace',
    fontSize: 11,
    padding: '4px 10px',
    cursor: 'pointer',
    borderRadius: 4,
    letterSpacing: '0.05em',
  };

  return (
    <div style={{ width: W, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => setOpen(o => !o)} style={btnStyle}>
          {open ? '▾ MONITOR' : '▸ MONITOR'}
        </button>
        {open && (
          <>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && capture()}
              placeholder="label (e.g. Op0→Op1 close)"
              style={{
                background: '#111', border: '1px solid #2a2a2a', color: '#aaa',
                fontFamily: 'monospace', fontSize: 11, padding: '4px 8px',
                borderRadius: 4, width: 240, outline: 'none',
              }}
            />
            <button onClick={capture} style={{ ...btnStyle, color: '#4af', borderColor: '#4af' }}>
              CAPTURE
            </button>
            {snapshots.length > 0 && (
              <button onClick={copyLog} style={{ ...btnStyle, color: copied ? '#4f8' : '#888', borderColor: copied ? '#4f8' : '#333' }}>
                {copied ? 'COPIED!' : `COPY LOG (${snapshots.length})`}
              </button>
            )}
            {snapshots.length > 0 && (
              <button onClick={() => setSnapshots([])} style={{ ...btnStyle, color: '#f64', borderColor: '#f64' }}>
                CLEAR
              </button>
            )}
          </>
        )}
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ border: '1px solid #222', borderRadius: 6, overflow: 'hidden' }}>
            <canvas ref={scopeRef}    width={W} height={SCOPE_H}    style={{ display: 'block' }} />
            <div style={{ height: 1, background: '#1c1c1c' }} />
            <canvas ref={specRef}     width={W} height={SPEC_H}     style={{ display: 'block' }} />
            <div style={{ height: 1, background: '#1c1c1c' }} />
            <canvas ref={analysisRef} width={W} height={ANALYSIS_H} style={{ display: 'block' }} />
          </div>

          {snapshots.length > 0 && (
            <div style={{ border: '1px solid #1a1a1a', borderRadius: 6, background: '#0a0a0a', overflow: 'auto', maxHeight: 220 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 10, color: '#777' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e1e1e', color: '#444' }}>
                    {['#', 'Label', 'Freq', 'dBFS', 'Harmonics', 'Beta', 'THD', 'FM', 'Time'].map(h => (
                      <th key={h} style={{ padding: '5px 10px', textAlign: 'left', fontWeight: 'normal' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #141414' }}>
                      <td style={{ padding: '4px 10px', color: '#333' }}>{s.id}</td>
                      <td style={{ padding: '4px 10px', color: '#aaa' }}>{s.label}</td>
                      <td style={{ padding: '4px 10px' }}>
                        {s.analysis.hasSignal
                          ? (s.analysis.fundamentalHz >= 1000
                              ? `${(s.analysis.fundamentalHz/1000).toFixed(2)}k`
                              : `${Math.round(s.analysis.fundamentalHz)}`)
                          : '—'}
                      </td>
                      <td style={{ padding: '4px 10px' }}>{s.analysis.hasSignal ? s.analysis.fundamentalDb.toFixed(1) : '—'}</td>
                      <td style={{ padding: '4px 10px' }}>{s.analysis.sidebandCount}</td>
                      <td style={{ padding: '4px 10px' }}>{s.analysis.estimatedBeta.toFixed(1)}</td>
                      <td style={{ padding: '4px 10px' }}>{(s.analysis.thd * 100).toFixed(0)}%</td>
                      <td style={{ padding: '4px 10px', color: s.analysis.isFM ? '#4f8' : '#f84' }}>
                        {s.analysis.isFM ? 'ACTIVE' : 'NONE'}
                      </td>
                      <td style={{ padding: '4px 10px', color: '#333' }}>{s.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
