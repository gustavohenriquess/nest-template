import { SetMetadata } from '@nestjs/common';

export const RESPONSE_META_KEY = 'response_meta';

export const ResponseMeta = (meta: Record<string, any>) =>
  SetMetadata(RESPONSE_META_KEY, meta);
