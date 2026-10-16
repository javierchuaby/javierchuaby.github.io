import type { Position } from '@/data/resume/work';

export function getCurrentPosition(
  positions: Position[],
  asOf = new Date(),
): Position | undefined {
  const date = asOf.toISOString().slice(0, 10);
  return positions.find(
    (position) =>
      position.startDate <= date &&
      (!position.endDate || position.endDate >= date),
  );
}
