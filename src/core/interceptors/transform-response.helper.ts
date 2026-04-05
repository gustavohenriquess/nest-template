export interface TransformResponse<T> {
  meta: {
    timestamp: string;
    path: string;
    filters: unknown;
    count?: number;
    [key: string]: unknown;
  };
  data: T;
}

export function formatSuccessResponse<T>(
  data: T,
  path: string,
  filters: unknown,
  customMeta: Record<string, unknown> | undefined,
): TransformResponse<T> {
  const meta: TransformResponse<T>['meta'] = {
    timestamp: new Date().toISOString(),
    path,
    filters,
  };

  const extra = customMeta || {};
  Object.keys(extra).forEach((key) => {
    meta[key] = extra[key];
  });

  if (Array.isArray(data)) {
    meta.count = (data as unknown[]).length;
  }

  return { meta, data };
}
