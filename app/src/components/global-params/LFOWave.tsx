import { useRef, useState, useEffect } from "react"
import { HorizontalSlider } from "../HorizontalSlider"



interface LFOWaveProps {
    speed: number,
    depth: number,
    waveform: number,
    onWaveformChange: (value: number) => void;
}

    const W = 200
    const H = 100
    const PAD_X = 12
    const WAVE_MID = H / 2
    const WAVE_AMP = H / 2 - 16
    const N_SAMPLES = 80


function sampleWave(sliderPos: number, t: number): number {
    const waveformZone = Math.round(sliderPos * 3)
    switch(waveformZone) {
        case 0: return Math.sin(t * Math.PI * 2)
        case 1: return 1 - 4 * Math.abs((t % 1) - 0.5)
        case 2: return (t % 1) * 2 - 1
        case 3: return t % 1 < 0.5 ? 1 : -1
        default: return 0
    }
}

function buildPath(phase: number, sliderPos: number) : string {
    const points: string[] = []
    for (let i = 0; i <= N_SAMPLES; i++) {
    const t = i / N_SAMPLES + phase
    const x = PAD_X + (i / N_SAMPLES) * (W - PAD_X * 2)
    const y = WAVE_MID - sampleWave(sliderPos, t) * WAVE_AMP
    points.push(i === 0 ? `M ${x},${y}` : `L ${x},${y}`)
  }
  
  return points.join(' ')

}

export function LFOWave ({speed, depth, waveform, onWaveformChange}: LFOWaveProps) {
    const [sliderPos, setSliderPos] = useState(waveform / 3)
    const requestRef = useRef(0);
    const phaseRef = useRef(0)
    const svgRef = useRef<SVGSVGElement>(null)
    const pathRef = useRef<SVGPathElement>(null)
    const sliderPosRef = useRef(waveform / 3)



    function handleWaveSlider (v: number) {
    const stepValue =  v / 3
    setSliderPos(v)
    sliderPosRef.current = stepValue
    onWaveformChange(v)

}

    useEffect(() => {
        const tick = () => {
        pathRef.current?.setAttribute('d', buildPath(phaseRef.current, sliderPosRef.current))
        phaseRef.current += speed / 127 * 0.05
        requestRef.current = requestAnimationFrame(tick)
        }
        requestRef.current = requestAnimationFrame(tick)
        return (() => {
            cancelAnimationFrame(requestRef.current)
        })

       
    }, [depth, speed])


    return (
        <div>
            <svg ref={svgRef} width={W} height={H}>
                <path fill="none" stroke="black" strokeWidth={'2px'} ref={pathRef}></path>
            </svg>
            <HorizontalSlider value={sliderPos} steps={4} onChange={handleWaveSlider} labels={['sine', 'triangle', 'saw', 'square']} />
        </div>

    )
}