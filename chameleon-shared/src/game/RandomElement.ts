export function randomElement<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)]
}
export function randomElementIndex<T>(items: T[]) {
    return Math.floor(Math.random() * items.length)
}