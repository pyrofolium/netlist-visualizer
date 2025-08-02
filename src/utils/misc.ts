export function zip<A, B>(a: A[], b: B[]): [A, B][] {
    const length = Math.min(a.length, b.length)
    return Array.from({length}, (_, i) => [a[i], b[i]])
}

export function colorFromString(randomString: string): string {
    let hash = 0
    for (let i = 0; i < randomString.length; i++) {
        hash = ((hash << 5) - hash) + randomString.charCodeAt(i)
        hash = hash & hash
    }
    hash *= 1337
    const r = Math.abs((hash & 0xFF0000) >> 16)
    const g = Math.abs((hash & 0x00FF00) >> 8)
    const b = Math.abs(hash & 0x0000FF)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export function normalizedSigmoid(x: number, min: number, max: number): number {
    // Calculate the shift needed so f(0) = 1
    const shift = Math.log(((max - min) / (1 - min)) - 1)

    // Apply the shift to x in the sigmoid function
    return min + (max - min) * (1 / (1 + Math.exp(x + shift)))

}

export function boundary(inputNumber: number, min: number, max: number): number {
    return Math.max(Math.min(inputNumber, max), min)
}
