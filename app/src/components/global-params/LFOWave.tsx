import { useRef, useState, useEffect, useMemo } from "react"
import { HorizontalSlider } from "../HorizontalSlider"
import { colors } from "../../tokens"

interface LFOWaveProps {
    speed: number,
    depth: number,
    waveform: number,
    color?: string,
    onWaveformChange: (value: number) => void;
}

const W = 200
const H = 100
const PAD_X = 12
const WAVE_MID = H / 2
const WAVE_AMP = H / 2 - 16
const CYCLES = 2
const W_INNER = W - PAD_X * 2
const CYCLE_WIDTH = W_INNER / CYCLES
const N_SAMPLES = 120

function buildStaticPath(zone: number, depth: number): string {
    const TOTAL = CYCLES + 1
    const amp = WAVE_AMP * Math.max(0.12, depth)
    const valToY = (v: number) => WAVE_MID - v * amp
    const tToX = (t: number) => PAD_X + t * CYCLE_WIDTH

    if (zone === 3) { // square
        const segs: string[] = []
        let val = 1
        segs.push(`M ${tToX(0)},${valToY(val)}`)
        for (let tr = 0.5; tr < TOTAL; tr += 0.5) {
            segs.push(`L ${tToX(tr)},${valToY(val)}`)
            val = -val
            segs.push(`L ${tToX(tr)},${valToY(val)}`)
        }
        segs.push(`L ${tToX(TOTAL)},${valToY(val)}`)
        return segs.join(' ')
    }

    if (zone === 2) { // saw
        const segs: string[] = []
        segs.push(`M ${tToX(0)},${valToY(-1)}`)
        for (let tr = 1; tr < TOTAL; tr++) {
            segs.push(`L ${tToX(tr)},${valToY(1)}`)
            segs.push(`L ${tToX(tr)},${valToY(-1)}`)
        }
        segs.push(`L ${tToX(TOTAL)},${valToY(1)}`)
        return segs.join(' ')
    }

    const N = Math.round(N_SAMPLES * TOTAL / CYCLES)
    const pts: string[] = []
    for (let i = 0; i <= N; i++) {
        const t = (i / N) * TOTAL
        const v = zone === 0
            ? Math.sin(t * Math.PI * 2)
            : 1 - 4 * Math.abs((t % 1) - 0.5)
        pts.push(i === 0 ? `M ${tToX(t)},${valToY(v)}` : `L ${tToX(t)},${valToY(v)}`)
    }
    return pts.join(' ')
}

export function LFOWave({ speed, depth, waveform, color = '#888', onWaveformChange }: LFOWaveProps) {
    const [zone, setZone] = useState(waveform)
    const requestRef = useRef(0)
    const phaseRef = useRef(0)
    const groupRef = useRef<SVGGElement>(null)

    const pathD = useMemo(() => buildStaticPath(zone, depth), [zone, depth])

    function handleWaveSlider(v: number) {
        setZone(v)
        onWaveformChange(v)
    }

    useEffect(() => {
        const tick = () => {
            const shift = (phaseRef.current % 1) * CYCLE_WIDTH
            groupRef.current?.setAttribute('transform', `translate(${-shift}, 0)`)
            phaseRef.current += speed / 127 * 0.05
            requestRef.current = requestAnimationFrame(tick)
        }
        requestRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(requestRef.current)
    }, [speed])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <svg width={W} height={H} style={{ display: 'block' }}>
                {/* dashed grid */}
                {[1, 2, 3].map(i => (
                    <line key={`h${i}`} x1={PAD_X} y1={(i / 4) * H} x2={PAD_X + W_INNER} y2={(i / 4) * H}
                        stroke={colors.border.strong} strokeWidth={1} strokeDasharray="3 4" />
                ))}
                {[1, 2, 3].map(i => (
                    <line key={`v${i}`} x1={PAD_X + (i / 4) * W_INNER} y1={0} x2={PAD_X + (i / 4) * W_INNER} y2={H}
                        stroke={colors.border.strong} strokeWidth={1} strokeDasharray="3 4" />
                ))}

                <g ref={groupRef}>
                    <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeLinecap="round"
                    />
                </g>
            </svg>
            <HorizontalSlider value={zone} steps={4} onChange={handleWaveSlider} labels={['sine', 'triangle', 'saw', 'square']} width={W} color={color} labelGap={16} />
        </div>
    )
}
