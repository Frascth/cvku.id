export function toOptionalMo<T>(value: T | null | undefined): [] | [T] {
  return value !== undefined && value !== null ? [value] as [T] : [];
}

export function toOptionalTs<T>(value: [] | [T]): null | T {
  return value[0] ?? null;
}