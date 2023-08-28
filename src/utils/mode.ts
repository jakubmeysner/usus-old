export function mode<E>(array: E[]): E | null {
    const count: Map<E, number> = new Map()

    for (const element of array) {
        count.set(element, (count.get(element) ?? 0) + 1)
    }

    let mode: E | null = null
    let modeCount = 0

    for (const [element, c] of count.entries()) {
        if (c > modeCount) {
            mode = element
            modeCount = c
        }
    }

    return mode
}
