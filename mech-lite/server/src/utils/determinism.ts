/**
 * Utility functions for ensuring deterministic simulation behavior.
 */

/**
 * Fixed-point math helpers to avoid floating point non-determinism.
 * All positions are stored as integers representing 1/100th of a grid unit.
 */
export const FIXED_SCALE = 100;

export function toFixed(value: number): number {
  return Math.round(value * FIXED_SCALE);
}

export function fromFixed(value: number): number {
  return value / FIXED_SCALE;
}

export function fixedDistance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  // Integer square root approximation for determinism
  return Math.floor(Math.sqrt(dx * dx + dy * dy));
}

/**
 * Deterministic sort function that breaks ties consistently.
 */
export function deterministicSort<T>(
  items: T[],
  keyFn: (item: T) => string
): T[] {
  return [...items].sort((a, b) => keyFn(a).localeCompare(keyFn(b)));
}

/**
 * Verify two combat states produce the same checksum.
 */
export function verifyDeterminism(checksum1: number, checksum2: number): boolean {
  return checksum1 === checksum2;
}

/**
 * Generate a simple hash for a string (for seeding).
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash >>> 0;
}
