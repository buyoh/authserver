import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isRight } from 'fp-ts/lib/Either';

export function checkTypeVerbose<T extends t.Any>(
  type: T,
  x: unknown
): boolean {
  const d = type.decode(x);
  if (isRight(d)) return true;
  PathReporter.report(d).forEach((t) => console.warn(t));
  return false;
}

export function checkType<T extends t.Any>(type: T, x: unknown): boolean {
  const d = type.decode(x);
  return !!isRight(d);
}
