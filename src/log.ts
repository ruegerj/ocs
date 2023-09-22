export function log(...args: unknown[]): void {
    console.log('[OCS]', ...args);
}

export function warn(...args: unknown[]): void {
    console.warn('[OCS]', ...args);
}
