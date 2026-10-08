/** Longest name kept; the Home greeting and avatar have room for about this much. */
export const NAME_MAX = 24;

/** Trimmed, single-spaced name, or '' when there's nothing to keep. */
export function cleanName(raw: string) {
  return raw.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
}
