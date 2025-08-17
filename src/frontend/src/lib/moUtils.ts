export function toOptionalMo<T>(value: T | null | undefined): [] | [T] {
  if (value === undefined || value === null) {
    return [];
  }

  return [value] as [T];
}

export function toOptionalTs<T>(value: [] | [T]): null | T {
  return value[0] ?? null;
}