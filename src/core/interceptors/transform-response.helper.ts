export interface TransformResponse<T> {
  meta: {
    timestamp: string;
    path: string;
    filters: any;
    count?: number;
    [key: string]: any;
  };
  data: T;
}

export function formatSuccessResponse<T>(
  data: T,
  path: string,
  filters: any,
  customMeta: Record<string, any> | undefined,
): TransformResponse<T> {
  const meta: any = {
    timestamp: new Date().toISOString(),
    path,
    filters,
  };

  const extra = customMeta || {};
  Object.keys(extra).forEach((key) => {
    meta[key] = extra[key];
  });

  if (Array.isArray(data)) {
    meta.count = data.length;
  }

  return { meta, data };
}
