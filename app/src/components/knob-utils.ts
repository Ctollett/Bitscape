export const START_DEG = 135;
export const SWEEP_DEG = 270;

export const polarXY = (centerX: number, centerY: number, radius: number, angle: number) => {
    const radians = angle * (Math.PI / 180)
    const x = centerX + radius * Math.cos(radians)
    const y = centerY + radius * Math.sin(radians)
    return { x, y }
}

export const describeArc = (centerX: number, centerY: number, radius: number, fromDeg: number, toDeg: number) => {
    const startPoint = polarXY(centerX, centerY, radius, fromDeg)
    const endPoint = polarXY(centerX, centerY, radius, toDeg)
    const large = toDeg - fromDeg > 180 ? 1 : 0
    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${large} 1 ${endPoint.x} ${endPoint.y}`
}
