/**
 * Gets the value at any depth of an object based on a path string (e.g. 'a.b.c').
 */
export function getByPath(
  obj: Record<string, unknown>,
  path: string,
  defaultValue: unknown = undefined,
): any {
  if (!path) return obj;

  const properties = path.split('.');
  let current: any = obj;

  for (const prop of properties) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[prop];
  }

  return current === undefined ? defaultValue : current;
}
